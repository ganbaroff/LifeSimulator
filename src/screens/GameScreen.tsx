import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { EventEffects, Event } from '../types';
import { EventCard } from '../components/EventCard';
import { GameHUD } from '../components/GameHUD';
import { AchievementModal } from '../components/AchievementModal';
import { generateEvent as generateAIGameEvent } from '../services/AIEngine';
import { getFallbackEvent } from '../services/AIEngine';
import achievementService from '../services/AchievementService';

type FinalStats = {
  age: number;
  wealth: number;
  achievements: string[];
  success?: boolean;
  crystalsEarned?: number;
};

export default function GameScreen({ route }: any) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Получаем параметры из route
  const { characterSeed, difficulty } = route.params || {};
  
  console.log('🎮 GameScreen получил параметры:', { characterSeed, difficulty });
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [crystals, setCrystals] = useState(0);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [showCharacterCreation, setShowCharacterCreation] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventCountRef = useRef<number>(0);

  // Character state - используем правильный тип
  const [character, setCharacter] = useState({
    age: 0, // Начинаем с рождения!
    health: 100,
    energy: 100,
    happiness: 100,
    wealth: 1000,
    name: characterSeed?.name || '',
    country: characterSeed?.country || 'USA',
    birthYear: characterSeed?.yearBase || 1990,
    profession: characterSeed?.profession || 'none',
    skills: 0,
    isAlive: true,
    deathCause: null,
    avatarUrl: null,
    history: [],
  });

  // Helper functions for age management
const getLifeStage = (age: number): string => {
  if (age < 5) return 'младенчество';
  if (age < 12) return 'детство';
  if (age < 18) return 'подростковый возраст';
  if (age < 25) return 'юность';
  if (age < 40) return 'молодость';
  if (age < 60) return 'зрелость';
  if (age < 75) return 'пожилой возраст';
  return 'старость';
};

const getAgeIncrease = (currentAge: number): number => {
  // В младенчестве и детстве возраст растет быстрее
  if (currentAge < 5) return 1;
  if (currentAge < 12) return 1;
  // В подростковом возрасте тоже быстрее
  if (currentAge < 18) return 1;
  // Во взрослом возрасте - стандартно
  if (currentAge < 60) return 1;
  // В пожилом возрасте может быть быстрее
  return 1;
};

const getAgeEventInterval = (age: number): number => {
  // Сколько событий нужно для увеличения возраста
  if (age < 5) return 2;  // Каждые 2 события в младенчестве
  if (age < 12) return 3; // Каждые 3 события в детстве
  if (age < 18) return 4; // Каждые 4 события в подростковом возрасте
  if (age < 30) return 5; // Каждые 5 событий в юности
  if (age < 50) return 6; // Каждые 6 событий в молодости
  if (age < 70) return 8; // Каждые 8 событий в зрелости
  return 10; // Каждые 10 событий в старости
};

// Generate game event
  const generateEvent = async (characterData: any, gameStateData: any): Promise<Event> => {
    try {
      const aiEvent = await generateAIGameEvent(characterData, gameStateData);
      return aiEvent;
    } catch (error) {
      return getFallbackEvent();
    }
  };

  // Age up the character
  const ageUp = async (years: number) => {
    setCharacter(prev => ({
      ...prev,
      age: prev.age + years,
    }));
  };

  // Get remaining game time
  const getRemainingTime = () => {
    return Math.max(0, timeRemaining);
  };

  // Check risk outcome
  const checkCRiskOutcome = (effects: EventEffects, gameStateData: any): { isDeath: boolean; deathCause?: string } => {
    const healthRisk = effects.health && effects.health < -50;
    const isDead = Boolean(healthRisk && character.health <= 0);
    return { 
      isDeath: isDead,
      deathCause: isDead ? 'Critical health failure' : undefined
    };
  };

  // Update character attributes
  const updateAttributes = async (effects: EventEffects) => {
    const updatedCharacter = {
      ...character,
      health: Math.max(0, Math.min(100, character.health + (effects.health || 0))),
      energy: Math.max(0, Math.min(100, character.energy + (effects.energy || 0))),
      happiness: Math.max(0, Math.min(100, character.happiness + (effects.happiness || 0))),
      wealth: Math.max(0, character.wealth + (effects.wealth || 0)),
      // Сохраняем все остальные поля Character
      name: character.name,
      age: character.age,
      country: character.country,
      birthYear: character.birthYear,
      profession: character.profession,
      skills: character.skills,
      isAlive: character.isAlive,
      deathCause: character.deathCause,
      avatarUrl: character.avatarUrl,
      history: character.history,
    };
    
    setCharacter(updatedCharacter);

    // Check for achievements after updating character
    const gameStateForAchievements = {
      currentDay,
      character: updatedCharacter,
    };
    const newAchievements = achievementService.checkAchievements(updatedCharacter, gameStateForAchievements);
    
    if (newAchievements.length > 0) {
      // Show achievement notification for the first new achievement
      const achievement = newAchievements[0];
      setCurrentAchievement(achievement);
      setAchievementModalVisible(true);
      
      // Award crystals from achievement
      if (achievement.reward.crystals) {
        setCrystals(prev => prev + (achievement.reward.crystals || 0));
      }
    }

    return updatedCharacter;
  };

  // Handle game end
  const handleGameEnd = async (success: boolean, reason: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setGameOver(true);
    setGameOverReason(reason);
    
    // Get all unlocked achievements for final stats
    const unlockedAchievements = achievementService.getUnlockedAchievements();
    const totalCrystalsFromAchievements = achievementService.getTotalCrystalsEarned();
    
    const result = await endGame(success, character.age, character.wealth);
    setFinalStats({
      success,
      age: character.age,
      wealth: character.wealth,
      crystalsEarned: crystals + totalCrystalsFromAchievements + result.crystalsEarned,
      achievements: unlockedAchievements.map(a => a.title),
    });
  };

  // Add event to history (placeholder)
  const addEvent = async (event: any) => {
    console.log('Event added to history:', event);
  };

  // End game
  const endGame = async (success: boolean, age: number, wealth: number) => {
    return {
      crystalsEarned: success ? 50 : 0,
    };
  };

  // Get current level info (placeholder)
  const getCurrentLevelInfo = () => {
    return {};
  };

  // Clear event cache (placeholder)
  const clearEventCache = () => {};

  // Reset character (placeholder)
  const resetCharacter = async (stats: any) => {};

  // Запуск игры при монтировании
  useEffect(() => {
    console.log('🎮 GameScreen монтируется');
    console.log('👤 showCharacterCreation:', showCharacterCreation);
    console.log('🎮 gameStarted:', gameStarted);
    console.log('📦 Параметры:', { characterSeed, difficulty });
    
    // Если переданы параметры создания персонажа - сразу начинаем игру
    if (characterSeed && difficulty) {
      console.log('🚀 Запускаем игру с переданными параметрами');
      setShowCharacterCreation(false);
      setGameStarted(true);
      startGameWithParams(characterSeed, difficulty);
    }
  }, []);

  // Запуск игры с параметрами из CharacterCreationScreen
  const startGameWithParams = async (seed: any, diff: any) => {
    console.log('🎮 startGameWithParams вызван');
    console.log('🌱 Seed:', seed);
    console.log('🎯 Difficulty:', diff);
    
    setIsLoading(true);
    
    // Сброс достижений для новой игры
    achievementService.resetAchievements();
    
    // Установка персонажа с правильными параметрами
    const initialCharacter = {
      age: 0, // Начинаем с рождения!
      health: 100 + (diff.bonus?.health || 0),
      energy: 100 + (diff.bonus?.energy || 0),
      happiness: 100 + (diff.bonus?.happiness || 0),
      wealth: 1000 + (diff.bonus?.wealth || 0),
      name: seed.name,
      country: seed.country,
      birthYear: seed.yearBase,
      profession: seed.profession,
      skills: 0,
      isAlive: true,
      deathCause: null,
      avatarUrl: null,
      history: [],
    };
    
    console.log('👤 Установка персонажа:', initialCharacter);
    setCharacter(initialCharacter);
    
    // Установка времени и дня
    setTimeRemaining(600);
    setCurrentDay(1);
    setGameOver(false);
    setCrystals(0);
    
    // Сохраняем сложность для использования в событиях
    // gameState.difficulty = diff; // Удалим это, gameState не определен
    
    console.log('🎲 Загрузка первого события');
    loadNextEvent();
    
    console.log('⏱️ Запуск таймера');
    startTimer();
    
    setIsLoading(false);
    console.log('✅ Игра с параметрами запущена');
  };

  // Создание персонажа и запуск игры
  const createCharacterAndStart = () => {
    console.log('🚀 createCharacterAndStart вызван');
    console.log('📝 Имя персонажа:', characterName);
    
    if (!characterName.trim()) {
      console.log('❌ Имя персонажа пустое');
      Alert.alert('Ошибка', 'Пожалуйста, введите имя персонажа');
      return;
    }

    console.log('✅ Имя персонажа валидное');
    setIsLoading(true);
    setShowCharacterCreation(false);
    setGameStarted(true);

    console.log('🔄 Сброс достижений');
    // Сброс достижений для новой игры
    achievementService.resetAchievements();

    console.log('👤 Установка начальных характеристик');
    // Сброс состояния персонажа с именем
    setCharacter({
      age: 0, // Начинаем с рождения!
      health: 100,
      energy: 100,
      happiness: 100,
      wealth: 1000,
      name: characterName,
      country: 'USA', // По умолчанию
      birthYear: 1990, // По умолчанию
      profession: 'none', // По умолчанию
      skills: 0,
      isAlive: true,
      deathCause: null,
      avatarUrl: null,
      history: [],
    });

    console.log('⏰ Установка времени и дня');
    // Сброс времени и дня
    setTimeRemaining(600);
    setCurrentDay(1);
    setGameOver(false);
    setCrystals(0);

    console.log('🎲 Загрузка первого события');
    // Первое событие
    loadNextEvent();

    console.log('⏱️ Запуск таймера');
    // Запуск таймера
    startTimer();

    setIsLoading(false);
    console.log('✅ Игра запущена');
  };

  // Запуск игры
  const startGame = async () => {
    setIsLoading(true);

    // Сброс состояния персонажа
    setCharacter({
      age: 0, // Начинаем с рождения!
      health: 100,
      energy: 100,
      happiness: 100,
      wealth: 1000,
      name: '',
      country: 'USA',
      birthYear: 1990,
      profession: 'none',
      skills: 0,
      isAlive: true,
      deathCause: null,
      avatarUrl: null,
      history: [],
    });

    // Сброс времени и дня
    setTimeRemaining(600);
    setCurrentDay(1);
    setGameOver(false);
    setCrystals(0);

    // Первое событие
    await loadNextEvent();

    // Запуск таймера
    startTimer();

    setIsLoading(false);
  };

  // Таймер уровня
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const remaining = prev - 1;
        
        // Время истекло - успешное завершение
        if (remaining <= 0) {
          handleGameEnd(true, 'Time completed!');
          return 0;
        }
        
        return remaining;
      });
    }, 1000);
  };

  // Загрузка следующего события
  const loadNextEvent = async () => {
    console.log('🎲 loadNextEvent вызван');
    try {
      setIsLoading(true);

      console.log('🤖 Генерация события...');
      // Генерация события через AI или fallback с актуальным character
      console.log('📊 character:', character);
      console.log('📅 currentDay:', currentDay);
      const gameState = { currentDay, character };
      const event = await generateEvent(character, gameState);
      console.log('✅ Событие сгенерировано:', event.id);

      setCurrentEvent(event);
      eventCountRef.current += 1;

      // Умная логика увеличения возраста в зависимости от этапа жизни
      const ageIncrease = getAgeIncrease(character.age);
      if (eventCountRef.current % getAgeEventInterval(character.age) === 0) {
        await ageUp(ageIncrease);
        console.log(`🎂 Возраст увеличен до ${character.age + ageIncrease} лет (${getLifeStage(character.age + ageIncrease)})`);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading event:', error);
      Alert.alert('Error', 'Failed to load event. Please try again.');
      navigation.goBack();
    }
  };

  // Обработка выбора игрока (A/B/C)
  const handleChoice = async (choice: string): Promise<void> => {
    if (!currentEvent || isLoading) return;

    try {
      setIsLoading(true);

      const choiceKey = choice as 'A' | 'B' | 'C';
      const effects = currentEvent.effects[choiceKey];
      
      if (!effects) {
        throw new Error(`Invalid choice: ${choice}`);
      }
      
      let outcome: { isDeath: boolean; effects: EventEffects; deathCause?: string } = {
        isDeath: false,
        effects,
      };

      // Для C-выбора проверяем риск смерти
      if (choice === 'C' && effects?.deathChance) {
        const gameState = { currentDay, character };
        const riskOutcome = checkCRiskOutcome(effects, gameState);
        outcome = { ...outcome, ...riskOutcome };
      }

      // Применяем эффекты
      const updatedChar = await updateAttributes(outcome.effects);

      // Увеличиваем день после каждого выбора
      setCurrentDay(prev => prev + 1);

      // Сохраняем событие в истории
      await addEvent({
        event: currentEvent,
        choice: choiceKey,
        effects: outcome.effects,
        isDeath: outcome.isDeath,
      });

      // Проверка смерти
      if (outcome.isDeath || updatedChar.health <= 0) {
        const deathCause =
          outcome.deathCause || (updatedChar.health <= 0 ? 'Health reached zero' : 'Unknown');
        handleGameEnd(false, deathCause);
        return;
      }

      // Следующее событие
      await loadNextEvent();
    } catch (error) {
      console.error('Error processing choice:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  // Achievement modal close handler
  const handleAchievementModalClose = () => {
    setAchievementModalVisible(false);
    setCurrentAchievement(null);
  };

  // Navigate to achievements screen
  const handleAchievementsPress = () => {
    navigation.navigate('Achievements' as never);
  };

  // Рендер Game Over модала
  const GameOverModal = () => (
    <Modal visible={gameOver} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={finalStats?.success ? ['#22c55e', '#16a34a'] : ['#ef4444', '#dc2626']}
          style={styles.gameOverContainer}
        >
          <Text style={styles.gameOverTitle}>
            {finalStats?.success ? '🎉 Victory!' : '💀 Game Over'}
          </Text>

          <Text style={styles.gameOverReason}>{gameOverReason}</Text>

          {finalStats && (
            <View style={styles.finalStatsContainer}>
              <View style={styles.finalStat}>
                <Text style={styles.finalStatLabel}>Age Reached</Text>
                <Text style={styles.finalStatValue}>{finalStats.age} years</Text>
              </View>
              <View style={styles.finalStat}>
                <Text style={styles.finalStatLabel}>Final Wealth</Text>
                <Text style={styles.finalStatValue}>${finalStats.wealth}</Text>
              </View>
              <View style={styles.finalStat}>
                <Text style={styles.finalStatLabel}>Crystals Earned</Text>
                <Text style={styles.finalStatValue}>💎 {finalStats.crystalsEarned}</Text>
              </View>
            </View>
          )}

          <View style={styles.gameOverButtons}>
            <TouchableOpacity
              style={styles.gameOverButton}
              onPress={() => {
                setGameOver(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.gameOverButtonText}>Main Menu</Text>
            </TouchableOpacity>

            {!finalStats?.success && (
              <TouchableOpacity
                style={[styles.gameOverButton, styles.rewindButton]}
                onPress={() => {
                  // TODO: Implement Rewind with IAP
                  Alert.alert('Rewind', 'Coming soon: Rewind feature with IAP');
                }}
              >
                <Text style={styles.gameOverButtonText}>⏮️ Rewind (💎 50)</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );

  if (isLoading && !currentEvent) {
    console.log('⏳ Показываем loading screen');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Generating life event...</Text>
      </View>
    );
  }

  if (showCharacterCreation) {
    console.log('👤 Показываем экран создания персонажа');
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
          <View style={styles.characterCreationContainer}>
            <Text style={styles.creationTitle}>Создание персонажа</Text>
            <Text style={styles.creationSubtitle}>Начните свою уникальную историю</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Имя персонажа</Text>
              <TextInput
                style={styles.nameInput}
                value={characterName}
                onChangeText={(text) => {
                  console.log('⌨️ TextInput изменен:', text);
                  setCharacterName(text);
                }}
                placeholder="Введите имя..."
                placeholderTextColor="#64748b"
                maxLength={20}
              />
            </View>

            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => {
                console.log('🔘 Кнопка "Начать игру" нажата');
                console.log('📝 characterName:', characterName);
                console.log('✅ characterName.trim():', characterName.trim());
                console.log('🚫 disabled состояние:', !characterName.trim());
                createCharacterAndStart();
              }}
              disabled={!characterName.trim()}
            >
              <Text style={styles.startButtonText}>Начать игру</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Назад</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        {(() => {
          console.log('🎮 Показываем основной игровой экран');
          return null;
        })()}
        {/* HUD */}
        <GameHUD
          character={character}
          timeRemaining={timeRemaining}
          currentDay={currentDay}
          crystals={crystals}
          onMenuPress={() => navigation.goBack()}
          onPausePress={() => setIsPaused(!isPaused)}
          onAchievementsPress={handleAchievementsPress}
          isPaused={isPaused}
        />

        {/* Event Card */}
        <View style={styles.eventContainer}>
          {currentEvent && (
            <EventCard
              event={currentEvent}
              onChoice={handleChoice}
              disabled={isLoading}
              currentDay={currentDay}
            />
          )}
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {/* Game Over Modal */}
        <GameOverModal />

        {/* Achievement Modal */}
        <AchievementModal
          visible={achievementModalVisible}
          achievement={currentAchievement}
          onClose={handleAchievementModalClose}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    fontSize: 16,
    color: '#f8fafc',
  },
  eventContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverContainer: {
    width: '100%',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  gameOverReason: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  finalStatsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  finalStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  finalStatLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  finalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gameOverButtons: {
    width: '100%',
    gap: 12,
  },
  gameOverButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewindButton: {
    backgroundColor: '#fbbf24',
  },
  gameOverButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  characterCreationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  creationTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  creationSubtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
