// AIEngine.js - Gemini API интеграция для генерации событий
// С fallback на локальные JSON события при отсутствии интернета/API

import axios from 'axios';
import { generateHistoricalPromptContext, applyHistoricalEffects, getHistoricalContext } from './HistoricalEvents';
import fallbackEvents from '../data/fallbackEvents.json';

// ⚠️ ВСТАВЬТЕ ВАШ GEMINI API KEY ЗДЕСЬ
// Получить ключ: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Кэш для последних событий (избегаем повторений)
let eventCache = [];
const MAX_CACHE_SIZE = 10;

/**
 * ОСНОВНАЯ ФУНКЦИЯ: Генерация события с помощью AI или fallback
 * @param {Object} character - Объект персонажа с атрибутами
 * @param {Object} gameState - Состояние игры
 * @returns {Promise<Object>} - Событие с выборами и эффектами
 */
export const generateEvent = async (character, gameState) => {
  try {
    // Проверяем, включен ли AI
    if (!gameState.settings.aiEnabled || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('AI disabled or no API key, using fallback');
      return getFallbackEvent(character, gameState);
    }

    // Пробуем сгенерировать через Gemini
    const aiEvent = await generateAIEvent(character, gameState);
    
    // Применяем исторические эффекты
    const historicalEvent = getHistoricalContext(
      character.country,
      character.birthYear + character.age
    );
    
    if (historicalEvent) {
      aiEvent.effects.A = applyHistoricalEffects(aiEvent.effects.A, historicalEvent);
      aiEvent.effects.B = applyHistoricalEffects(aiEvent.effects.B, historicalEvent);
      aiEvent.effects.C = applyHistoricalEffects(aiEvent.effects.C, historicalEvent);
    }

    return aiEvent;
  } catch (error) {
    console.error('AI generation failed, using fallback:', error.message);
    return getFallbackEvent(character, gameState);
  }
};

/**
 * ФУНКЦИЯ: Генерация события через Gemini API
 * @param {Object} character - Персонаж
 * @param {Object} gameState - Игровое состояние
 * @returns {Promise<Object>} - AI-сгенерированное событие
 */
const generateAIEvent = async (character, gameState) => {
  const currentYear = character.birthYear + character.age;
  const historicalContext = generateHistoricalPromptContext(
    character.country,
    currentYear,
    character.age
  );

  // Получаем информацию о текущем уровне для определения риска
  const levelInfo = gameState.currentLevel;
  let deathChance = 0.2;
  if (levelInfo === 'demo') {
    deathChance = 0.1;
  } else if (levelInfo.includes('level_')) {
    const levelNum = parseInt(levelInfo.split('_')[1]);
    deathChance = 0.2 + (levelNum - 1) * 0.1;
  }

  // Формируем расширенный промпт для Gemini (LifeSim GSL)
  const prompt = `Ты — генератор событий для LifeSim GSL, симулятора жизни 18+ с dark realism.
Твоя задача — создавать реалистичные, исторически точные события и управлять прогрессом персонажа.

📋 ПАРАМЕТРЫ ПЕРСОНАЖА:
- Имя: ${character.name}
- Возраст: ${character.age} лет
- Текущий год: ${currentYear}
- Страна: ${character.country}
- Профессия: ${character.profession || 'Безработный'}
- Health: ${character.health}/100
- Happiness: ${character.happiness}/100
- Wealth: $${character.wealth}
- Skills: ${character.skills}/100
- Состояние: ${character.isAlive ? 'Жив' : 'Мёртв'}

🌍 ИСТОРИЧЕСКИЙ КОНТЕКСТ:
${historicalContext}

🎮 УРОВЕНЬ СЛОЖНОСТИ:
- Текущий уровень: ${levelInfo}
- Риск смерти на выборе C: ${Math.floor(deathChance * 100)}%
- Механика: A = безопасный (низкий риск), B = сбалансированный, C = рискованный (высокая награда/смерть), D = пользовательский ввод

📜 ПРАВИЛА ГЕНЕРАЦИИ:
1. События должны быть реалистичными и соответствовать возрасту персонажа
2. Учитывай исторический контекст страны (1850–2025) — 20–30% событий косвенно связаны с историей
3. НЕ допускай анахронизмов (до года рождения нет интернета, смартфонов, социальных сетей)
4. Максимум 200 символов для описания ситуации
5. Dark realism, 18+, чёрный юмор, непредсказуемые последствия
6. Выбор C имеет ${Math.floor(deathChance * 100)}% шанс смерти/тюрьмы/банкротства
7. Эффекты: здоровье/счастье/навыки от -30 до +30, богатство от -500 до +500
8. События масштабируются с уровнем: более высокие уровни = больше стресса, коррупции, permadeath
9. Не повторяй недавние события: ${eventCache.length > 0 ? eventCache.join(', ') : 'нет данных'}

💡 ТИПЫ СОБЫТИЙ:
- Карьерные (работа, профессия, бизнес)
- Социальные (отношения, семья, друзья)
- Личные (здоровье, хобби, образование)
- Случайные катастрофы (несчастные случаи, болезни, криминал)
- Исторические (войны, кризисы, революции — косвенное влияние)

Respond ONLY with valid JSON in this exact format:
{
  "situation": "Краткий реалистичный сценарий (200 символов макс)",
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

⚠️ ВАЖНО: Генерируй уникальное событие, учитывая текущее состояние персонажа и исторический контекст. Не повторяй предыдущие события.`;

  // Отправляем запрос к Gemini API
  const response = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000, // 10 секунд таймаут
    }
  );

  // Парсим ответ
  const generatedText = response.data.candidates[0].content.parts[0].text;
  
  // Очищаем от markdown если есть
  const jsonText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const event = JSON.parse(jsonText);

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
const getFallbackEvent = (character, gameState) => {
  // Фильтруем события по возрасту и уровню
  const appropriateEvents = fallbackEvents.filter(event => {
    const ageOk = event.ageRange[0] <= character.age && character.age <= event.ageRange[1];
    const levelOk = event.level <= getLevelNumber(gameState.currentLevel);
    
    // Избегаем недавних событий
    const notRecent = !eventCache.includes(event.situation);
    
    return ageOk && levelOk && notRecent;
  });

  let selectedEvent;
  
  if (appropriateEvents.length === 0) {
    // Если нет подходящих, берем любое
    selectedEvent = fallbackEvents[Math.floor(Math.random() * fallbackEvents.length)];
  } else {
    // Случайный выбор из подходящих
    selectedEvent = appropriateEvents[Math.floor(Math.random() * appropriateEvents.length)];
  }

  // Применяем исторические эффекты
  const historicalEvent = getHistoricalContext(
    character.country,
    character.birthYear + character.age
  );

  const event = { ...selectedEvent };
  
  if (historicalEvent) {
    event.choices.A.effects = applyHistoricalEffects(event.choices.A.effects, historicalEvent);
    event.choices.B.effects = applyHistoricalEffects(event.choices.B.effects, historicalEvent);
    event.choices.C.effects = applyHistoricalEffects(event.choices.C.effects, historicalEvent);
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
export const evaluateCustomChoice = async (userInput, event, character) => {
  try {
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
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
- Skills: ${character.skills}/100

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
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    const jsonText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(jsonText);

    return result;
  } catch (error) {
    console.error('Custom choice evaluation failed:', error.message);
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
 * ФУНКЦИЯ: Получить номер уровня из ID
 */
const getLevelNumber = (levelId) => {
  if (levelId === 'demo') return 0;
  const match = levelId.match(/level_(\d+)/);
  return match ? parseInt(match[1]) : 1;
};

/**
 * ФУНКЦИЯ: Проверить исход C-выбора (смерть/выживание)
 * @param {Object} effectsObj - Объект эффектов C-выбора
 * @param {Object} gameState - Игровое состояние
 * @returns {Object} - Результат с isDeath флагом
 */
export const checkCRiskOutcome = (effectsObj, gameState) => {
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
const generateDeathCause = (choice) => {
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
export const clearEventCache = () => {
  eventCache = [];
};

export default {
  generateEvent,
  checkCRiskOutcome,
  clearEventCache,
};
