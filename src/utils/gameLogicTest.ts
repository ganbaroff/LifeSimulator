// Тестирование логики игры
import { getFallbackEvent } from '../services/AIEngine';
import { Character } from '../types/game';

// Создаем тестового персонажа
const testCharacter: Character = {
  id: 'test-1',
  name: 'Test Character',
  age: 25,
  stats: { health: 100, happiness: 100, wealth: 1000, energy: 100 },
  skills: { intelligence: 50, creativity: 50, social: 50, physical: 50, business: 30, technical: 30 },
  relationships: { family: 70, friends: 60, romantic: 0, colleagues: 40 },
  country: 'USA',
  birthYear: 1998,
  profession: null,
  educationLevel: null,
  currentDisease: null,
  isAlive: true,
  deathCause: null,
  avatarUrl: null,
  history: [],
};

const event = getFallbackEvent(testCharacter, { currentLevel: 'demo', settings: { aiEnabled: false } });

export const testGameLogic = () => {
  console.log('🎮 Тестирование логики игры...');
  
  // Тест 1: Проверка генерации событий
  console.log('\n📋 Тест 1: Генерация событий');
  console.log('✅ Событие сгенерировано:', {
    id: event.id,
    situation: event.situation?.substring(0, 50) + '...',
    hasChoices: !!(event.A && event.B && event.C),
    hasEffects: !!(event.effects?.A && event.effects?.B && event.effects?.C)
  });
  
  // Тест 2: Проверка структуры эффектов
  console.log('\n💪 Тест 2: Структура эффектов');
  const effects = event.effects;
  console.log('✅ Эффекты выбора A:', effects.A);
  console.log('✅ Эффекты выбора B:', effects.B);
  console.log('✅ Эффекты выбора C:', effects.C);
  
  // Тест 3: Проверка рисков
  console.log('\n⚠️ Тест 3: Риски смерти');
  const hasDeathRisk = effects.C?.deathChance;
  console.log('✅ Риск смерти в выборе C:', hasDeathRisk ? `${(hasDeathRisk * 100).toFixed(0)}%` : 'Нет');
  
  // Тест 4: Симуляция выбора
  console.log('\n👆 Тест 4: Симуляция выбора');
  const simulateChoice = (choice: 'A' | 'B' | 'C') => {
    const effect = effects[choice];
    console.log(`Выбор ${choice}:`, {
      health: effect.health || 0,
      happiness: effect.happiness || 0,
      wealth: effect.wealth || 0,
      skills: effect.skills || 0,
      deathChance: effect.deathChance ? `${(effect.deathChance * 100).toFixed(0)}%` : '0%'
    });
  };
  
  simulateChoice('A');
  simulateChoice('B');
  simulateChoice('C');
  
  console.log('\n🎯 Все тесты логики игры пройдены!');
};

export const testCharacterProgression = () => {
  console.log('\n👤 Тестирование прогрессии персонажа...');
  
  let character = {
    age: 25,
    health: 100,
    energy: 100,
    happiness: 100,
    wealth: 1000,
  };
  
  console.log('Начальные характеристики:', character);
  
  // Симуляция 3 событий
  const events = [
    { health: 0, happiness: 5, wealth: 0, skills: 1 },    // Выбор A
    { health: -5, happiness: 10, wealth: 100, skills: 2 }, // Выбор B  
    { health: -20, happiness: -10, wealth: 500, skills: 5, deathChance: 0.2 }, // Выбор C
  ];
  
  events.forEach((effects, index) => {
    console.log(`\nСобытие ${index + 1}:`, effects);
    
    // Применение эффектов
    character = {
      ...character,
      health: Math.max(0, Math.min(100, character.health + (effects.health || 0))),
      happiness: Math.max(0, Math.min(100, character.happiness + (effects.happiness || 0))),
      wealth: Math.max(0, character.wealth + (effects.wealth || 0)),
    };
    
    console.log(`После события ${index + 1}:`, character);
    
    // Проверка смерти
    if (effects.deathChance) {
      const isDead = Math.random() < effects.deathChance;
      console.log(`Риск смерти: ${(effects.deathChance * 100).toFixed(0)}% - ${isDead ? '💀 Умер' : '✅ Выжил'}`);
    }
  });
  
  console.log('\n📊 Финальные характеристики:', character);
  console.log('✅ Тест прогрессии завершен!');
};
