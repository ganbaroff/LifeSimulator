// src/screens/GameScreenRedux.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { Character, GameEvent, GameState } from '../types/game';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';
import { generateEvent } from '../services/AIEngine';
import { RealTimeStats } from '../components/RealTimeStats';
import { InteractiveChoices } from '../components/InteractiveChoices';
import { LifeTimeline } from '../components/LifeTimeline';
import { AchievementSystem } from '../components/AchievementSystem';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { useSoundEffects } from '../utils/soundEffects';

// Redux imports
import { AppDispatch, RootState } from '../store/indexRedux';
import { 
  selectCurrentCharacter, 
  selectCharacterStats,
  selectCharacterSkills,
  selectCharacterRelationships,
  selectCharacterProfession,
  selectCharacterEducation,
  selectCharacterDisease,
  selectIsCharacterAlive,
  selectCharacterAge,
  selectCharacterHistory,
  characterActions
} from '../store/slices/characterSlice';
import {
  selectCurrentEvent,
  selectGameActive,
  selectGameOver,
  selectCurrentDay,
  selectGameLoading,
  selectGameError,
  selectEventCount,
  loadNextEvent,
  makeChoice,
  gameActions
} from '../store/slices/gameSliceNew';
import { getAgeEventInterval } from '../utils/gameLogic';

// Components
import StatsDisplay from '../components/StatsDisplay';
import CharacterHistory from '../components/CharacterHistory';

// Types
import { CharacterSeed, DifficultyLevel, GameEvent } from '../types/game';

type GameScreenRouteProp = RouteProp<
  { Game: { characterSeed?: CharacterSeed; difficulty?: DifficultyLevel } },
  'Game'
>;

const GameScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const character = useSelector(selectCurrentCharacter);
  const stats = useSelector(selectCharacterStats);
  const skills = useSelector(selectCharacterSkills);
  const relationships = useSelector(selectCharacterRelationships);
  const profession = useSelector(selectCharacterProfession);
  const education = useSelector(selectCharacterEducation);
  const disease = useSelector(selectCharacterDisease);
  const isAlive = useSelector(selectIsCharacterAlive);
  const age = useSelector(selectCharacterAge);
  const history = useSelector(selectCharacterHistory);
  
  const currentEvent = useSelector(selectCurrentEvent);
  const isGameActive = useSelector(selectGameActive);
  const isGameOver = useSelector(selectGameOver);
  const currentDay = useSelector(selectCurrentDay);
  const eventCount = useSelector(selectEventCount);
  const isLoading = useSelector(selectGameLoading);
  const gameError = useSelector(selectGameError);

  // State for tracking stat changes
  const [previousStats, setPreviousStats] = useState(stats);
  const [previousSkills, setPreviousSkills] = useState(skills);
  const [previousRelationships, setPreviousRelationships] = useState(relationships);
  const [showStatChanges, setShowStatChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Animation states
  const eventOpacity = useRef(new Animated.Value(1)).current;
  const eventTranslateY = useRef(new Animated.Value(0)).current;

  const { characterSeed, difficulty } = route.params || {};
  const eventCountRef = useRef(0);

  // Инициализация игры
  useEffect(() => {
    // Проверяем Redux state вместо route.params
    const character = useAppSelector(state => state.character.current);
    const gameActive = useAppSelector(state => state.game.isGameActive);
    
    if (gameActive && !character) {
      console.log('🔄 Redux state говорит, что игра активна, но персонажа нет. Инициализация...');
      initializeGame();
    } else if (character && gameActive) {
      console.log('✅ Персонаж и игра уже загружены в Redux state');
    }
  }, []);

  // Анимация появления нового события
  const animateEventTransition = () => {
    // Fade out
    Animated.parallel([
      Animated.timing(eventOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(eventTranslateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in
      Animated.parallel([
        Animated.timing(eventOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(eventTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Загрузка первого события
  useEffect(() => {
    if (character && isGameActive && !currentEvent && !isLoading) {
      dispatch(loadNextEvent(character));
    }
  }, [character, isGameActive, currentEvent, isLoading, dispatch]);

  // Анимация при смене события
  useEffect(() => {
    if (currentEvent && !isLoading) {
      animateEventTransition();
    }
  }, [currentEvent]);

  // Проверка окончания игры
  useEffect(() => {
    if (!isAlive && isGameActive) {
      handleGameEnd();
    }
  }, [isAlive, isGameActive]);

  // УБРАЛИ АВТОМАТИЧЕСКИЙ ТАЙМЕР - события загружаются только после выбора пользователя

  const initializeGame = () => {
    if (!characterSeed || !difficulty) {
      Alert.alert('Error', 'Missing game parameters');
      navigation.goBack();
      return;
    }

    try {
      // Создание персонажа и начало игры
      dispatch(characterActions.createCharacter({ seed: characterSeed, difficulty }));
      dispatch(gameActions.startGame({ seed: characterSeed, difficulty }));
      
      console.log('🎮 Game initialized with Redux');
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
      Alert.alert('Error', 'Failed to start game');
      navigation.goBack();
    }
  };

  const handleChoice = async (choice: 'A' | 'B' | 'C') => {
    if (!currentEvent || !character) return;

    try {
      const effects = currentEvent.effects[choice];
      
      console.log('🎯 Выбор сделан:', choice);
      console.log('📊 Эффекты:', effects);
      console.log('💰 Текущие статы до:', stats);
      console.log('🧠 Текущие навыки до:', skills);
      console.log('👥 Текущие отношения до:', relationships);
      console.log('🎂 Текущий возраст:', age);
      console.log('📈 Событий обработано:', eventCount);
      
      // Сохраняем предыдущие значения для отображения изменений
      setPreviousStats(stats);
      setPreviousSkills(skills);
      setPreviousRelationships(relationships);
      setShowStatChanges(true);
      
      // Применяем эффекты к персонажу
      dispatch(characterActions.updateStats(effects));
      
      // Добавляем в историю
      dispatch(characterActions.addToHistory({
        event: currentEvent,
        choice,
        effects,
      }));

      // Проверяем нужно ли увеличивать возраст
      const ageInterval = getAgeEventInterval(age);
      const newEventCount = eventCount + 1;
      
      console.log(`📊 Интервал возраста для ${age} лет: ${ageInterval} событий`);
      console.log(`📈 Новое количество событий: ${newEventCount}`);
      
      if (newEventCount % ageInterval === 0) {
        console.log(`🎂 Увеличиваем возраст с ${age} до ${age + 1}!`);
        dispatch(characterActions.ageUp({ years: 1 }));
      }

      // Скрываем изменения через 2 секунды
      setTimeout(() => setShowStatChanges(false), 2000);

      console.log('✅ Выбор обработан, загружаем следующее событие...');

      // Загрузка следующего события
      dispatch(loadNextEvent(character));
    } catch (error) {
      console.error('❌ Choice failed:', error);
      Alert.alert('Error', 'Failed to process choice');
    }
  };

  const handleGameEnd = () => {
    const deathCause = character?.deathCause || 'Unknown causes';
    
    Alert.alert(
      'Game Over',
      `Your character has died.\nAge: ${age}\nCause: ${deathCause}\nDays lived: ${currentDay}`,
      [
        { text: 'Start New Game', onPress: () => navigation.navigate('Start' as never) },
        { text: 'View History', onPress: () => setShowHistory(true) },
      ]
    );

    dispatch(gameActions.endGame({ deathCause }));
  };

  const handleSkipEvent = () => {
    if (character) {
      dispatch(loadNextEvent(character));
    }
  };

  if (!character || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.backgroundGradient}>
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>Game Over</Text>
            <Text style={styles.gameOverText}>Your character lived {age} years</Text>
            <Text style={styles.gameOverText}>Cause: {character.deathCause}</Text>
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={() => navigation.navigate('Start' as never)}
            >
              <Text style={styles.restartButtonText}>Start New Game</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHistory ? (
        <CharacterHistory 
          history={history} 
          onClose={() => setShowHistory(false)} 
        />
      ) : (
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.backgroundGradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterInfo}>Age {age} • Day {currentDay}</Text>
        </View>

        {/* Stats Display */}
        {stats && (
          <StatsDisplay
            stats={stats}
            skills={skills}
            relationships={relationships}
            profession={profession}
            educationLevel={education}
            currentDisease={disease}
            previousStats={showStatChanges ? previousStats : undefined}
            previousSkills={showStatChanges ? previousSkills : undefined}
            previousRelationships={showStatChanges ? previousRelationships : undefined}
            showChanges={showStatChanges}
          />
        )}

        {/* Event */}
        <ScrollView style={styles.eventContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading event...</Text>
          ) : gameError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {gameError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => character && dispatch(loadNextEvent(character))}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : currentEvent ? (
            <Animated.View 
              style={[
                styles.eventCard,
                {
                  opacity: eventOpacity,
                  transform: [{ translateY: eventTranslateY }],
                }
              ]}
            >
              <Text style={styles.eventSituation}>{currentEvent.situation}</Text>
              
              <View style={styles.choicesContainer}>
                <TouchableOpacity 
                  style={styles.choiceButton}
                  onPress={() => handleChoice('A')}
                >
                  <Text style={styles.choiceText}>A: {currentEvent.A}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.choiceButton}
                  onPress={() => handleChoice('B')}
                >
                  <Text style={styles.choiceText}>B: {currentEvent.B}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.choiceButton}
                  onPress={() => handleChoice('C')}
                >
                  <Text style={styles.choiceText}>C: {currentEvent.C}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.loadingText}>Waiting for event...</Text>
          )}
        </ScrollView>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
            <Text style={styles.historyButtonText}>📜 История</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipEvent}>
            <Text style={styles.skipButtonText}>Skip Event</Text>
          </TouchableOpacity>
        </View>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  characterInfo: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  eventContainer: {
    flex: 1,
    marginVertical: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  eventSituation: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  choiceText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  historyButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.5)',
  },
  historyButtonText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  gameOverText: {
    fontSize: 18,
    color: '#B0B0B0',
    marginBottom: 8,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameScreen;
