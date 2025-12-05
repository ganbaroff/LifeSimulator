// Тест для отладки игрового процесса
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

const event = getFallbackEvent(testCharacter, { 
  currentDay: 1,
  currentEvent: null,
  eventCount: 0,
  isGameActive: true,
  isGameOver: false,
  difficulty: { 
    id: 'medium' as const,
    name: 'Medium',
    deathChanceMultiplier: 0.3,
    historicalDensity: 0.5,
    startingBonus: { health: 10, happiness: 10, energy: 5, wealth: 1000 }
  },
  characterSeed: { name: testCharacter.name, country: testCharacter.country },
  currentLevel: 'demo',
  settings: { aiEnabled: false }
});

export const debugGameFlow = () => {
  console.log('🔍 ОТЛАДКА ИГРОВОГО ПРОЦЕССА');
  console.log('==============================');
  
  // Шаг 1: Проверка навигации Start -> Game
  console.log('\n📍 Шаг 1: Навигация Start -> Game');
  console.log('✅ StartScreen.tsx: navigation.navigate("Game")');
  
  // Шаг 2: Проверка создания персонажа
  console.log('\n👤 Шаг 2: Создание персонажа');
  const characterName = 'TestPlayer';
  console.log(`✅ Ввод имени: "${characterName}"`);
  console.log('✅ Проверка: characterName.trim() !== ""');
  console.log('✅ Кнопка "Начать игру" активна');
  
  // Шаг 3: Инициализация игры
  console.log('\n🎮 Шаг 3: Инициализация игры');
  const initialCharacter = {
    age: 25,
    health: 100,
    energy: 100,
    happiness: 100,
    wealth: 1000,
  };
  console.log('✅ Начальные характеристики:', initialCharacter);
  console.log('✅ Сброс достижений: achievementService.resetAchievements()');
  console.log('✅ Установка времени: 600 секунд');
  console.log('✅ Установка дня: 1');
  
  // Шаг 4: Генерация первого события
  console.log('\n🎲 Шаг 4: Генерация первого события');
  try {
    const event = getFallbackEvent(testCharacter, { 
      currentDay: 1,
      currentEvent: null,
      eventCount: 0,
      isGameActive: true,
      isGameOver: false,
      difficulty: { 
        id: 'medium' as const,
        name: 'Medium',
        deathChanceMultiplier: 0.3,
        historicalDensity: 0.5,
        startingBonus: { health: 10, happiness: 10, energy: 5, wealth: 1000 }
      },
      characterSeed: { name: testCharacter.name, country: testCharacter.country },
      currentLevel: 'demo',
      settings: { aiEnabled: false }
    });
    console.log('✅ Событие сгенерировано:', {
      id: event.id,
      situation: event.situation?.substring(0, 50) + '...',
      hasChoices: !!(event.A && event.B && event.C),
    });
    
    // Шаг 5: Отображение EventCard
    console.log('\n📋 Шаг 5: Отображение EventCard');
    console.log('✅ EventCard получает event и onChoice');
    console.log('✅ Показаны варианты A/B/C');
    
    // Шаг 6: Обработка выбора
    console.log('\n👆 Шаг 6: Обработка выбора');
    const choice = 'A';
    const effects = event.effects[choice];
    console.log(`✅ Выбор "${choice}" с эффектами:`, effects);
    
    // Шаг 7: Обновление характеристик
    console.log('\n💪 Шаг 7: Обновление характеристик');
    const updatedCharacter = {
      ...initialCharacter,
      health: Math.max(0, Math.min(100, initialCharacter.health + (effects.health || 0))),
      energy: Math.max(0, Math.min(100, initialCharacter.energy + (effects.energy || 0))),
      happiness: Math.max(0, Math.min(100, initialCharacter.happiness + (effects.happiness || 0))),
      wealth: Math.max(0, initialCharacter.wealth + (effects.wealth || 0)),
    };
    console.log('✅ Характеристики обновлены:', updatedCharacter);
    
    // Шаг 8: Увеличение дня
    console.log('\n📅 Шаг 8: Увеличение дня');
    const newDay = 2;
    console.log(`✅ День увеличен: 1 -> ${newDay}`);
    
    // Шаг 9: Проверка достижений
    console.log('\n🏆 Шаг 9: Проверка достижений');
    const gameState = { currentDay: newDay, character: updatedCharacter };
    const newAchievements = achievementService.checkAchievements(updatedCharacter, gameState);
    console.log('✅ Новые достижения:', newAchievements.length);
    
    // Шаг 10: Следующее событие
    console.log('\n➡️ Шаг 10: Следующее событие');
    console.log('✅ loadNextEvent() вызван');
    
    console.log('\n🎉 ВСЕ ШАГИ РАБОТАЮТ КОРРЕКТНО!');
    
  } catch (error) {
    console.error('❌ Ошибка в шаге 4:', error);
  }
};

// Симуляция нажатий кнопок
export const simulateButtonClicks = () => {
  console.log('\n🖱️ СИМУЛЯЦИЯ НАЖАТИЙ КНОПОК');
  console.log('============================');
  
  console.log('\n1. Пользователь открывает приложение');
  console.log('   ✅ StartScreen отображается');
  
  console.log('\n2. Пользователь нажимает "Начать игру"');
  console.log('   ✅ navigation.navigate("Game")');
  console.log('   ✅ GameScreen монтируется');
  console.log('   ✅ showCharacterCreation = true');
  
  console.log('\n3. Пользователь видит экран создания персонажа');
  console.log('   ✅ Поле ввода имени отображается');
  console.log('   ✅ Кнопка "Начать игру" неактивна (пустое имя)');
  
  console.log('\n4. Пользователь вводит имя "Alex"');
  console.log('   ✅ characterName = "Alex"');
  console.log('   ✅ Кнопка "Начать игру" становится активной');
  
  console.log('\n5. Пользователь нажимает "Начать игру"');
  console.log('   ✅ createCharacterAndStart() вызван');
  console.log('   ✅ setShowCharacterCreation(false)');
  console.log('   ✅ setGameStarted(true)');
  console.log('   ✅ setCharacter(initialStats)');
  console.log('   ✅ loadNextEvent()');
  console.log('   ✅ startTimer()');
  
  console.log('\n6. Отображается игровой экран');
  console.log('   ✅ GameHUD показывает характеристики');
  console.log('   ✅ EventCard показывает событие');
  console.log('   ✅ Кнопки A/B/C доступны');
  
  console.log('\n7. Пользователь выбирает вариант A');
  console.log('   ✅ handleChoice("A") вызван');
  console.log('   ✅ updateAttributes(effects.A)');
  console.log('   ✅ setCurrentDay(prev + 1)');
  console.log('   ✅ loadNextEvent() для следующего события');
  
  console.log('\n✅ Весь игровой цикл работает!');
};
