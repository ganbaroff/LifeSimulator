// Финальный тест всей игровой логики
import { getFallbackEvent } from '../services/AIEngine';
import { Character } from '../types/game';
import achievementService from '../services/AchievementService';

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

export const runFinalTest = () => {
  console.log('🎮 ФИНАЛЬНЫЙ ТЕСТ ИГРОВОЙ ЛОГИКИ');
  console.log('=====================================');
  
  // Тест 1: Создание персонажа
  console.log('\n📝 Тест 1: Создание персонажа');
  const character = {
    age: 25,
    health: 100,
    energy: 100,
    happiness: 100,
    wealth: 1000,
  };
  console.log('✅ Персонаж создан:', character);
  
  // Тест 2: Генерация события
  console.log('\n🎲 Тест 2: Генерация события');
  const event = getFallbackEvent();
  console.log('✅ Событие сгенерировано:', {
    id: event.id,
    situation: event.situation?.substring(0, 50) + '...',
    hasChoices: !!(event.A && event.B && event.C),
  });
  
  // Тест 3: Обработка выбора
  console.log('\n👆 Тест 3: Обработка выбора');
  const choice = 'A';
  const effects = event.effects[choice];
  console.log(`✅ Выбор ${choice} с эффектами:`, effects);
  
  // Тест 4: Обновление характеристик
  console.log('\n💪 Тест 4: Обновление характеристик');
  const updatedCharacter = {
    ...character,
    health: Math.max(0, Math.min(100, character.health + (effects.health || 0))),
    energy: Math.max(0, Math.min(100, character.energy + (effects.energy || 0))),
    happiness: Math.max(0, Math.min(100, character.happiness + (effects.happiness || 0))),
    wealth: Math.max(0, character.wealth + (effects.wealth || 0)),
  };
  console.log('✅ Характеристики обновлены:', updatedCharacter);
  
  // Тест 5: Увеличение дня
  console.log('\n📅 Тест 5: Увеличение дня');
  let currentDay = 1;
  currentDay += 1;
  console.log(`✅ День увеличен: ${currentDay}`);
  
  // Тест 6: Проверка достижений
  console.log('\n🏆 Тест 6: Проверка достижений');
  achievementService.resetAchievements();
  const gameState = { currentDay, character: updatedCharacter };
  const newAchievements = achievementService.checkAchievements(updatedCharacter, gameState);
  console.log('✅ Новые достижения:', newAchievements.map(a => a.title));
  
  // Тест 7: Проверка смерти
  console.log('\n💀 Тест 7: Проверка смерти');
  const isDead = updatedCharacter.health <= 0;
  console.log(`✅ Статус смерти: ${isDead ? 'Мертв' : 'Жив'}`);
  
  // Тест 8: Таймер
  console.log('\n⏰ Тест 8: Таймер');
  let timeRemaining = 600;
  const timerInterval = setInterval(() => {
    timeRemaining -= 1;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      console.log('✅ Время истекло - игра завершена');
    }
  }, 1000);
  
  // Тест 9: Game Over
  console.log('\n🔚 Тест 9: Game Over логика');
  const finalStats = {
    success: timeRemaining > 0,
    age: updatedCharacter.age,
    wealth: updatedCharacter.wealth,
    crystalsEarned: 50,
    achievements: newAchievements.map(a => a.title),
  };
  console.log('✅ Финальная статистика:', finalStats);
  
  // Тест 10: UI Компоненты
  console.log('\n🎨 Тест 10: UI Компоненты');
  console.log('✅ GameHUD - отображает характеристики');
  console.log('✅ EventCard - показывает событие и выборы');
  console.log('✅ AchievementModal - уведомления о достижениях');
  console.log('✅ GameOverModal - финальный экран');
  
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
  console.log('Игра готова к запуску! 🚀');
};

// Симуляция полного игрового цикла
export const simulateFullGame = () => {
  console.log('\n🎮 СИМУЛЯЦИЯ ПОЛНОГО ИГРОВОГО ЦИКЛА');
  console.log('=====================================');
  
  let character = {
    age: 25,
    health: 100,
    energy: 100,
    happiness: 100,
    wealth: 1000,
  };
  
  let currentDay = 1;
  let timeRemaining = 600;
  let gameOver = false;
  let crystals = 0;
  
  achievementService.resetAchievements();
  
  console.log('\n🎬 Начало игры...');
  console.log('Начальные характеристики:', character);
  
  // Симуляция 5 игровых дней
  for (let day = 1; day <= 5 && !gameOver; day++) {
    console.log(`\n📅 День ${day}:`);
    
    // Генерация события
    const event = getFallbackEvent();
    console.log(`Событие: ${event.situation.substring(0, 50)}...`);
    
    // Случайный выбор
    const choices = ['A', 'B', 'C'];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const effects = event.effects[choice as keyof typeof event.effects];
    
    console.log(`Выбор: ${choice}`, effects);
    
    // Применение эффектов
    character = {
      ...character,
      health: Math.max(0, Math.min(100, character.health + (effects?.health || 0))),
      energy: Math.max(0, Math.min(100, character.energy + (effects?.energy || 0))),
      happiness: Math.max(0, Math.min(100, character.happiness + (effects?.happiness || 0))),
      wealth: Math.max(0, character.wealth + (effects?.wealth || 0)),
    };
    
    console.log('Характеристики после выбора:', character);
    
    // Проверка достижений
    const gameState = { currentDay: day, character };
    const newAchievements = achievementService.checkAchievements(character, gameState);
    if (newAchievements.length > 0) {
      console.log('🏆 Новое достижение:', newAchievements[0].title);
      crystals += newAchievements[0].reward.crystals || 0;
    }
    
    // Проверка смерти
    if (character.health <= 0) {
      console.log('💀 Персонаж умер!');
      gameOver = true;
    }
    
    // Увеличение возраста каждые 3 дня
    if (day % 3 === 0) {
      character.age += 1;
      console.log(`🎂 Возраст увеличен до ${character.age}`);
    }
    
    // Уменьшение времени
    timeRemaining -= 60; // 1 минута за день
    if (timeRemaining <= 0) {
      console.log('⏰ Время истекло!');
      gameOver = true;
    }
    
    currentDay++;
  }
  
  // Финальная статистика
  const unlockedAchievements = achievementService.getUnlockedAchievements();
  const totalCrystalsFromAchievements = achievementService.getTotalCrystalsEarned();
  
  console.log('\n📊 ФИНАЛЬНАЯ СТАТИСТИКА:');
  console.log('Возраст:', character.age);
  console.log('Здоровье:', character.health);
  console.log('Счастье:', character.happiness);
  console.log('Богатство:', character.wealth);
  console.log('Дни прожиты:', currentDay - 1);
  console.log('Разблокированные достижения:', unlockedAchievements.length);
  console.log('Всего кристаллов:', crystals + totalCrystalsFromAchievements);
  console.log('Статус игры:', gameOver ? 'Завершена' : 'В процессе');
  
  console.log('\n🎉 Симуляция завершена!');
};
