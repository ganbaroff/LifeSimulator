// AIEngine.ts - Gemini API интеграция для генерации событий
// С fallback на локальные JSON события при отсутствии интернета/API

import axios from 'axios';
import { Character, CharacterSkills, CharacterRelationships, GameEvent, GameState, EventEffects } from '../types/game';
import {
  generateHistoricalPromptContext,
  applyHistoricalEffects,
  getHistoricalContext,
} from './HistoricalEvents';
import fallbackEvents from '../data/fallbackEvents.json';

// Временно: используем пустую строку, fallback events сработают автоматически
const GEMINI_API_KEY = '';

// Типизация fallback событий
const typedFallbackEvents = fallbackEvents as FallbackEventData[];

interface ComplexitySettings {
  complexity: 'simple' | 'complex';
  description: string;
  maxEffectRange: {
    health: number;
    happiness: number;
    wealth: number;
    skills: number;
  };
  allowComplexConsequences: boolean;
  allowMultiStepEvents: boolean;
}

interface CustomChoiceResult {
  isValid: boolean;
  explanation: string;
  effects: EventEffects;
}

// Интерфейс для событий из fallbackEvents.json (отличается от Event)
interface FallbackEventData {
  id: string;
  situation: string;
  ageRange: number[];
  level: number;
  profession?: string;
  choices: {
    A: { text: string; effects: EventEffects };
    B: { text: string; effects: EventEffects };
    C: { text: string; effects: EventEffects };
  };
}

// ⚠️ API KEY загружается из .env файла через babel plugin
// Если ключа нет, AI автоматически переключится на fallback события
const API_KEY = GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Кэш для последних событий (избегаем повторений)
let eventCache: string[] = [];
const MAX_CACHE_SIZE = 10;

/**
 * ФУНКЦИЯ: Получить номер уровня из ID
 * @param {String} levelId - ID уровня (demo, level_1, level_2, etc.)
 * @returns {Number} - Номер уровня (0 для demo, 1-5 для level_1-level_5)
 */
const getLevelNumber = (levelId: string): number => {
  if (levelId === 'demo') return 0;
  const match = levelId.match(/level_(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

/**
 * ОСНОВНАЯ ФУНКЦИЯ: Генерация события с помощью AI или fallback
 * @param {Object} character - Объект персонажа с атрибутами
 * @param {Object} gameState - Состояние игры
 * @returns {Promise<Object>} - Событие с выборами и эффектами
 */
export const generateEvent = async (character: Character, gameState: GameState): Promise<GameEvent> => {
  try {
    // Проверяем, включен ли AI (с проверкой на существование settings)
    if (!gameState?.settings?.aiEnabled || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('AI disabled or no API key, using fallback');
      return getFallbackEvent(character, gameState);
    }

    // Пробуем сгенерировать через Gemini
    const aiEvent = await generateAIEvent(character, gameState);

    // Применяем исторические эффекты
    const historicalEvent = getHistoricalContext(
      character.country || 'USA',
      (character.birthYear || 2000) + (character.age || 0),
    );

    if (historicalEvent) {
      aiEvent.effects.A = applyHistoricalEffects(aiEvent.effects.A, historicalEvent);
      aiEvent.effects.B = applyHistoricalEffects(aiEvent.effects.B, historicalEvent);
      aiEvent.effects.C = applyHistoricalEffects(aiEvent.effects.C, historicalEvent);
    }

    return aiEvent;
  } catch (error) {
    console.error(
      'AI generation failed, using fallback:',
      error instanceof Error ? error.message : String(error),
    );
    return getFallbackEvent(character, gameState);
  }
};

/**
 * ФУНКЦИЯ: Извлечь последние решения игрока из истории
 * @param {Array} history - История событий персонажа
 * @param {Number} count - Количество последних решений (5-10)
 * @returns {String} - Форматированная строка с последними решениями
 */
const getRecentChoices = (history: Character['history'], count: number = 10): string => {
  if (!history || history.length === 0) {
    return 'История решений пуста. Это начало игры.';
  }

  const recentEvents = history.slice(-count);
  const choicesText = recentEvents
    .map((event, index) => {
      const eventData = event.event || {};
      const choice = event.choice || 'N/A';
      const age = event.age || 0;
      const situation = eventData.situation || 'Неизвестная ситуация';

      return `${index + 1}. Возраст ${age}: "${situation.substring(0, 100)}..." → Выбор: ${choice}`;
    })
    .join('\n');

  return `Последние ${recentEvents.length} решений игрока:\n${choicesText}`;
};

/**
 * ФУНКЦИЯ: Определить сложность логики на основе уровня
 * @param {String} levelId - ID уровня
 * @returns {Object} - Параметры сложности
 */
const getComplexitySettings = (levelId: string): ComplexitySettings => {
  const levelNum = getLevelNumber(levelId);

  // Для уровней ниже 3 - простая логика
  if (levelNum < 3) {
    return {
      complexity: 'simple',
      description: 'ПРОСТЫЕ события: бытовые ситуации, простые выборы, минимальные последствия',
      maxEffectRange: { health: 15, happiness: 15, wealth: 300, skills: 15 },
      allowComplexConsequences: false,
      allowMultiStepEvents: false,
    };
  }

  // Для уровней 3-5 - сложная логика
  return {
    complexity: 'complex',
    description:
      'СЛОЖНЫЕ события: глубокие последствия, цепочки событий, моральные дилеммы, долгосрочные эффекты',
    maxEffectRange: { health: 30, happiness: 30, wealth: 500, skills: 30 },
    allowComplexConsequences: true,
    allowMultiStepEvents: true,
  };
};

/**
 * ФУНКЦИЯ: Генерация события через Gemini API
 * @param {Object} character - Персонаж
 * @param {Object} gameState - Игровое состояние
 * @returns {Promise<Object>} - AI-сгенерированное событие
 */
const generateAIEvent = async (character: Character, gameState: GameState): Promise<GameEvent> => {
  // Проверка обязательных параметров
  if (!character || !gameState) {
    throw new Error('Character and gameState are required');
  }

  const currentYear = (character.birthYear || 2000) + (character.age || 0);
  const historicalContext = generateHistoricalPromptContext(
    character.country || 'USA',
    currentYear,
    character.age || 0,
  );

  // Получаем информацию о текущем уровне для определения риска
  const levelInfo = gameState.currentLevel || 'demo';
  const levelNum = getLevelNumber(levelInfo);

  let deathChance = 0.2;
  if (levelInfo === 'demo') {
    deathChance = 0.1;
  } else if (levelInfo.includes('level_')) {
    deathChance = 0.2 + (levelNum - 1) * 0.1;
  }

  // Получаем настройки сложности
  const complexity = getComplexitySettings(levelInfo);

  // Извлекаем последние решения (5-10 ходов)
  const recentChoicesCount = levelNum < 3 ? 5 : 10;
  const recentChoices = getRecentChoices(character.history || [], recentChoicesCount);

  // Формируем расширенный промпт для Gemini (LifeSim GSL)
  const prompt = `Ты — игровой движок LifeSim. Твоя задача — создавать реалистичные, исторически точные события с учётом всех параметров персонажа.

📋 ПАРАМЕТРЫ ПЕРСОНАЖА:
- Имя: ${character.name}
- Возраст: ${character.age} лет
- Текущий год: ${currentYear}
- Страна: ${character.country}
- Профессия: ${character.profession || 'Безработный'}
- Образование: ${character.educationLevel || 'Нет образования'}
- Текущее заболевание: ${character.currentDisease || 'Нет'}
- Health: ${character.health}/100
- Happiness: ${character.happiness}/100
- Wealth: $${character.wealth}
- Energy: ${character.energy}/100
- Skills: 
  * Intelligence: ${character.skills?.intelligence || 0}/100
  * Creativity: ${character.skills?.creativity || 0}/100
  * Social: ${character.skills?.social || 0}/100
  * Physical: ${character.skills?.physical || 0}/100
  * Business: ${character.skills?.business || 0}/100
  * Technical: ${character.skills?.technical || 0}/100
- Relationships:
  * Friends: ${character.relationships?.friends || 0}/100
  * Family: ${character.relationships?.family || 0}/100
  * Romance: ${character.relationships?.romance || 0}/100
  * Colleagues: ${character.relationships?.colleagues || 0}/100
- Состояние: ${character.isAlive ? 'Жив' : 'Мёртв'}

🌍 ИСТОРИЧЕСКИЙ КОНТЕКСТ:
${historicalContext}

🎮 УРОВЕНЬ СЛОЖНОСТИ: ${levelInfo} (Уровень ${levelNum})
- Сложность логики: ${complexity.complexity}
- ${complexity.description}
- Риск смерти на выборе C: ${Math.floor(deathChance * 100)}%
- Максимальные эффекты: Health ±${complexity.maxEffectRange.health}, Happiness ±${complexity.maxEffectRange.happiness}, Wealth ±${complexity.maxEffectRange.wealth}, Skills ±${complexity.maxEffectRange.skills}

📜 ИСТОРИЯ РЕШЕНИЙ ИГРОКА:
${recentChoices}

⚠️ КРИТИЧЕСКИ ВАЖНО — УЧЁТ ПРЕДЫДУЩИХ РЕШЕНИЙ:
- Анализируй последние ${recentChoicesCount} решений игрока
- Учитывай паттерны поведения (игрок часто выбирает рискованные варианты? консервативные?)
- Создавай события, которые логически связаны с предыдущими решениями
- Если игрок часто выбирал рискованные варианты — предложи событие, которое учитывает это
- Если игрок был консервативен — создай ситуацию, которая может изменить его подход
- НЕ создавай события, которые противоречат предыдущим решениям без объяснения

📜 ПРАВИЛА ГЕНЕРАЦИИ:
1. События должны быть реалистичными и соответствовать возрасту персонажа
2. Учитывай исторический контекст страны (1850–2025) — 20–30% событий косвенно связаны с историей
3. Учитывай профессию персонажа — события должны быть релевантны его карьере
4. НЕ допускай анахронизмов (до года рождения нет интернета, смартфонов, социальных сетей)
5. Максимум 200 символов для описания ситуации
6. Dark realism, 18+, чёрный юмор, непредсказуемые последствия
7. Выбор C имеет ${Math.floor(deathChance * 100)}% шанс смерти/тюрьмы/банкротства
8. Эффекты ограничены сложностью уровня: ${complexity.description}
9. Не повторяй недавние события: ${eventCache.length > 0 ? eventCache.slice(-5).join(', ') : 'нет данных'}

${
  levelNum < 3
    ? `🚫 ОГРАНИЧЕНИЕ ДЛЯ УРОВНЯ ${levelNum}:
- НЕ создавай слишком сложные события с глубокими последствиями
- НЕ создавай события с цепочками последствий
- НЕ создавай моральные дилеммы высокого уровня
- Фокус на простых, понятных ситуациях с прямыми последствиями
- Максимальные эффекты: ±${complexity.maxEffectRange.health} для здоровья/счастья/навыков, ±${complexity.maxEffectRange.wealth} для богатства`
    : `✅ СЛОЖНАЯ ЛОГИКА ДЛЯ УРОВНЯ ${levelNum}:
- Создавай события с глубокими последствиями
- Разрешай цепочки событий и долгосрочные эффекты
- Включай моральные дилеммы и сложные выборы
- События могут иметь отложенные последствия`
}

💡 ТИПЫ СОБЫТИЙ (выбирай в зависимости от профессии, возраста, истории):
- Карьерные (работа, профессия, бизнес) — особенно для профессионалов
- Социальные (отношения, семья, друзья)
- Личные (здоровье, хобби, образование)
- Случайные катастрофы (несчастные случаи, болезни, криминал)
- Исторические (войны, кризисы, революции — косвенное влияние)

Respond ONLY with valid JSON in this exact format:
{
  "situation": "Краткий реалистичный сценарий (200 символов макс), учитывающий профессию, страну, год, предыдущие решения",
  "A": "Безопасный выбор (низкий риск)",
  "B": "Сбалансированный выбор (умеренный риск)",
  "C": "Рискованный выбор (высокая награда/смерть)",
  "D": "Свой вариант (игрок вводит текст — AI оценивает корректность)",
  "effects": {
    "A": {"health": 0, "happiness": 0, "wealth": 0, "skills": 0},
    "B": {"health": 0, "happiness": 0, "wealth": 0, "skills": 0},
    "C": {"health": 0, "happiness": 0, "wealth": 0, "skills": 0, "deathChance": ${deathChance}}
  }
}

⚠️ ВАЖНО: 
- Генерируй уникальное событие, учитывая ВСЕ параметры: страну, год, профессию, уровень, здоровье, счастье, богатство, навыки
- ОБЯЗАТЕЛЬНО учитывай предыдущие решения игрока (${recentChoicesCount} последних ходов)
- Событие должно логически вытекать из истории решений
- ${levelNum < 3 ? 'Держись простых событий без сложной логики' : 'Используй сложную логику с глубокими последствиями'}
- Не повторяй предыдущие события`;

  // Отправляем запрос к Gemini API
  const response = await axios.post(
    `${GEMINI_API_URL}?key=${API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000, // 10 секунд таймаут
    },
  );

  // Парсим ответ с проверкой структуры
  if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid API response structure');
  }

  const generatedText = response.data.candidates[0].content.parts[0].text;

  // Очищаем от markdown если есть
  const jsonText = generatedText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let event;
  try {
    event = JSON.parse(jsonText);
  } catch (parseError) {
    throw new Error(
      `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
    );
  }

  // Валидация структуры
  if (!event.situation || !event.A || !event.B || !event.C || !event.effects) {
    throw new Error('Invalid event structure from AI');
  }

  // Добавляем в кэш
  eventCache.push(event.situation);
  if (eventCache.length > MAX_CACHE_SIZE) {
    eventCache.shift();
  }

  return {
    id: `ai_${Date.now()}`,
    source: 'gemini',
    ...event,
  };
};

/**
 * ФУНКЦИЯ: Получить событие из fallback JSON базы
 * @param {Object} character - Персонаж
 * @param {Object} gameState - Игровое состояние
 * @returns {Object} - Fallback событие
 */
export const getFallbackEvent = (character: Character, gameState: GameState): GameEvent => {
  if (!character || !gameState) {
    throw new Error('Invalid parameters for fallback event');
  }

  const levelId = gameState.currentLevel || 'demo';
  const levelNum = getLevelNumber(levelId);
  const complexity = getComplexitySettings(levelId);

  // Фильтруем события по возрасту, уровню и сложности
  const appropriateEvents = typedFallbackEvents.filter((event) => {
    if (!event.ageRange || !Array.isArray(event.ageRange) || event.ageRange.length < 2) {
      return false;
    }

    const ageOk = event.ageRange[0] <= character.age && character.age <= event.ageRange[1];
    const levelOk =
      event.level !== undefined && event.level !== null ? event.level <= levelNum : true;
    const complexityOk = levelNum < 3 ? event.level < 3 : true;
    const notRecent = !eventCache.includes(event.situation);
    const professionOk =
      !event.profession ||
      !character.profession ||
      event.profession === character.profession ||
      event.profession === 'any';

    return ageOk && levelOk && complexityOk && notRecent && professionOk;
  });

  let selectedEvent: FallbackEventData;

  if (appropriateEvents.length === 0) {
    const fallbackFiltered = typedFallbackEvents.filter((e) => (levelNum < 3 ? e.level < 3 : true));
    selectedEvent =
      fallbackFiltered.length > 0
        ? fallbackFiltered[Math.floor(Math.random() * fallbackFiltered.length)]
        : typedFallbackEvents[Math.floor(Math.random() * typedFallbackEvents.length)];
  } else {
    selectedEvent = appropriateEvents[Math.floor(Math.random() * appropriateEvents.length)];
  }

  // Ограничиваем эффекты для низких уровней
  if (levelNum < 3) {
    const limitEffects = (effects: EventEffects): EventEffects => {
      return {
        health: Math.max(
          -complexity.maxEffectRange.health,
          Math.min(complexity.maxEffectRange.health, effects.health || 0),
        ),
        happiness: Math.max(
          -complexity.maxEffectRange.happiness,
          Math.min(complexity.maxEffectRange.happiness, effects.happiness || 0),
        ),
        wealth: Math.max(
          -complexity.maxEffectRange.wealth,
          Math.min(complexity.maxEffectRange.wealth, effects.wealth || 0),
        ),
        skills: Math.max(
          -complexity.maxEffectRange.skills,
          Math.min(complexity.maxEffectRange.skills, effects.skills || 0),
        ),
        deathChance: effects.deathChance || 0,
      };
    };

    if (selectedEvent.choices) {
      selectedEvent.choices.A.effects = limitEffects(selectedEvent.choices.A.effects);
      selectedEvent.choices.B.effects = limitEffects(selectedEvent.choices.B.effects);
      selectedEvent.choices.C.effects = limitEffects(selectedEvent.choices.C.effects);
    }
  }

  // Применяем исторические эффекты
  const historicalEvent = getHistoricalContext(
    character.country || 'USA',
    (character.birthYear || 2000) + (character.age || 0),
  );

  const event = { ...selectedEvent };

  if (historicalEvent) {
    event.choices.A.effects = {
      ...event.choices.A.effects,
      ...applyHistoricalEffects(event.choices.A.effects, historicalEvent),
    };
    event.choices.B.effects = {
      ...event.choices.B.effects,
      ...applyHistoricalEffects(event.choices.B.effects, historicalEvent),
    };
    event.choices.C.effects = {
      ...event.choices.C.effects,
      ...applyHistoricalEffects(event.choices.C.effects, historicalEvent),
    };
  }

  // Добавляем в кэш
  eventCache.push(event.situation);
  if (eventCache.length > MAX_CACHE_SIZE) {
    eventCache.shift();
  }

  // Преобразуем в формат AI события
  return {
    id: event.id,
    source: 'fallback',
    situation: event.situation,
    A: event.choices.A.text,
    B: event.choices.B.text,
    C: event.choices.C.text,
    effects: {
      A: event.choices.A.effects,
      B: event.choices.B.effects,
      C: event.choices.C.effects,
    },
  };
};

/**
 * ФУНКЦИЯ: Оценка пользовательского выбора D
 * @param {String} userInput - Текст, введённый пользователем
 * @param {Object} event - Текущее событие
 * @param {Object} character - Персонаж
 * @returns {Promise<Object>} - Результат оценки AI
 */
export const evaluateCustomChoice = async (
  userInput: string,
  event: Event,
  character: Character,
): Promise<CustomChoiceResult> => {
  try {
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      // Если нет API ключа, возвращаем базовую оценку
      return {
        isValid: true,
        explanation: 'Ваш выбор принят. AI оценка недоступна без API ключа.',
        effects: {
          health: 0,
          happiness: 5,
          wealth: 0,
          skills: 1,
        },
      };
    }

    const prompt = `Ты — AI-судья в симуляторе жизни LifeSim GSL (18+, dark realism).
Игрок выбрал вариант D (свой вариант) в следующей ситуации:

СИТУАЦИЯ: ${event.situation}

ДОСТУПНЫЕ ВАРИАНТЫ:
A) ${event.A}
B) ${event.B}
C) ${event.C}

ВЫБОР ИГРОКА (D): "${userInput}"

ПЕРСОНАЖ:
- Возраст: ${character.age}
- Health: ${character.health}/100
- Happiness: ${character.happiness}/100
- Wealth: $${character.wealth}
- Energy: ${character.energy}/100
- Skills: 
  * Intelligence: ${character.skills?.intelligence || 0}/100
  * Creativity: ${character.skills?.creativity || 0}/100
  * Social: ${character.skills?.social || 0}/100
  * Physical: ${character.skills?.physical || 0}/100
  * Business: ${character.skills?.business || 0}/100
  * Technical: ${character.skills?.technical || 0}/100
- Профессия: ${character.profession || 'Безработный'}
- Образование: ${character.educationLevel || 'Нет образования'}

ТВОЯ ЗАДАЧА:
1. Оцени, является ли выбор игрока логичным и реалистичным для данной ситуации
2. Если выбор корректный и креативный, дай бонус +1–3 к Skills
3. Если выбор некорректный (например, анахронизм, нереалистичность), объясни почему и дай 0 бонуса
4. Объясни последствия выбора в 1–2 предложениях

Ответь ТОЛЬКО в формате JSON:
{
  "isValid": true/false,
  "explanation": "Краткое объяснение оценки (100 символов макс)",
  "effects": {
    "health": 0,
    "happiness": 0,
    "wealth": 0,
    "skills": 0
  }
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      },
    );

    // Проверка структуры ответа
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response structure');
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;
    const jsonText = generatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(
        `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      );
    }

    return result;
  } catch (error) {
    console.error(
      'Custom choice evaluation failed:',
      error instanceof Error ? error.message : String(error),
    );
    // Fallback оценка при ошибке
    return {
      isValid: true,
      explanation: 'Ваш выбор принят.',
      effects: {
        health: 0,
        happiness: 0,
        wealth: 0,
        skills: 1,
      },
    };
  }
};

/**
 * ФУНКЦИЯ: Проверить исход C-выбора (смерть/выживание)
 * @param {Object} effectsObj - Объект эффектов C-выбора
 * @param {Object} gameState - Игровое состояние
 * @returns {Object} - Результат с isDeath флагом
 */
export const checkCRiskOutcome = (effectsObj: EventEffects, _gameState: GameState): RiskOutcome => {
  const deathChance = effectsObj.deathChance || 0.3;
  const isDeath = Math.random() < deathChance;

  if (isDeath) {
    return {
      isDeath: true,
      deathCause: generateDeathCause(effectsObj),
      effects: {
        health: -100,
        happiness: -100,
        wealth: 0,
        skills: 0,
      },
    };
  }

  return {
    isDeath: false,
    effects: effectsObj,
  };
};

/**
 * ФУНКЦИЯ: Генерация причины смерти на основе выбора
 */
const generateDeathCause = (_choice: EventEffects): string => {
  const causes = [
    'Fatal accident',
    'Health complications',
    'Criminal activity gone wrong',
    'Natural disaster',
    'Occupational hazard',
    'Unforeseen circumstances',
  ];

  return causes[Math.floor(Math.random() * causes.length)];
};

/**
 * ФУНКЦИЯ: Очистить кэш событий (для новой игры)
 */
export const clearEventCache = (): void => {
  eventCache = [];
};

export default {
  generateEvent,
  checkCRiskOutcome,
  clearEventCache,
};
