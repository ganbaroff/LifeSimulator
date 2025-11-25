// GameScreen.js - Основной игровой экран с циклом событий
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCharacter } from '../context/CharacterContext';
import { useGame } from '../context/GameContext';
import { generateEvent, checkCRiskOutcome, clearEventCache } from '../services/AIEngine';
import HUD from '../components/HUD';
import EventCard from '../components/EventCard';

const GameScreen = ({ navigation }) => {
  const { character, updateAttributes, ageUp, addEvent } = useCharacter();
  const { gameState, endGame, getRemainingTime } = useGame();

  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [finalStats, setFinalStats] = useState(null);

  const timerRef = useRef(null);
  const eventCountRef = useRef(0);

  useEffect(() => {
    startGame();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Запуск игры
  const startGame = async () => {
    clearEventCache();
    setLoading(true);
    
    // Первое событие
    await loadNextEvent();
    
    // Запуск таймера
    startTimer();
    
    setLoading(false);
  };

  // Таймер уровня
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      const remaining = getRemainingTime();
      setTimeRemaining(remaining);
      
      // Время истекло - успешное завершение
      if (remaining <= 0) {
        handleGameEnd(true, 'Time completed!');
      }
    }, 1000);
  };

  // Загрузка следующего события
  const loadNextEvent = async () => {
    try {
      setLoading(true);
      
      // Генерация события через AI или fallback
      const event = await generateEvent(character, gameState);
      
      setCurrentEvent(event);
      eventCountRef.current += 1;
      
      // Каждые 3-5 событий - увеличение возраста
      if (eventCountRef.current % 4 === 0) {
        await ageUp(1);
        
        // Проверка естественной смерти от старости
        if (character.age >= 80) {
          handleGameEnd(true, 'Natural death from old age');
          return;
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event. Please try again.');
      navigation.goBack();
    }
  };

  // Обработка выбора игрока (A/B/C/D)
  const handleChoice = async (choice, customInput = null) => {
    if (!currentEvent || loading) return;

    try {
      setLoading(true);

      let effects = currentEvent.effects[choice];
      let outcome = { isDeath: false, effects };

      // Для D-выбора (пользовательский) — запрашиваем AI оценку
      if (choice === 'D' && customInput) {
        const { evaluateCustomChoice } = require('../services/AIEngine');
        const evaluation = await evaluateCustomChoice(customInput, currentEvent, character);
        
        // Показываем объяснение AI
        Alert.alert(
          evaluation.isValid ? '✅ Choice Accepted' : '❌ Choice Rejected',
          evaluation.explanation,
          [{ text: 'OK' }]
        );

        effects = evaluation.effects;
      }

      // Для C-выбора проверяем риск смерти
      if (choice === 'C' && effects.deathChance) {
        outcome = checkCRiskOutcome(effects, gameState);
      }

      // Применяем эффекты
      const updatedChar = await updateAttributes(
        outcome.isDeath
          ? outcome.effects
          : effects
      );

      // Сохраняем событие в истории
      await addEvent({
        event: currentEvent,
        choice,
        customInput: customInput || null,
        effects: outcome.effects,
        isDeath: outcome.isDeath,
      });

      // Проверка смерти
      if (outcome.isDeath || updatedChar.health <= 0) {
        const deathCause = outcome.deathCause || 
                          (updatedChar.health <= 0 ? 'Health reached zero' : 'Unknown');
        handleGameEnd(false, deathCause);
        return;
      }

      // Следующее событие
      await loadNextEvent();
    } catch (error) {
      console.error('Error processing choice:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Завершение игры
  const handleGameEnd = async (success, reason) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setGameOver(true);
    setGameOverReason(reason);

    // Расчет финальных наград
    const result = await endGame(success, character.age, character.wealth);
    setFinalStats({
      success,
      age: character.age,
      wealth: character.wealth,
      crystalsEarned: result.crystalsEarned,
    });
  };

  // Рендер Game Over модала
  const GameOverModal = () => (
    <Modal visible={gameOver} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={finalStats?.success ? ['#22c55e', '#16a34a'] : ['#ef4444', '#dc2626']}
          style={styles.gameOverContainer}
        >
          <Text style={styles.gameOverTitle}>
            {finalStats?.success ? '🎉 Victory!' : '💀 Game Over'}
          </Text>
          
          <Text style={styles.gameOverReason}>{gameOverReason}</Text>

          <View style={styles.finalStatsContainer}>
            <View style={styles.finalStat}>
              <Text style={styles.finalStatLabel}>Age Reached</Text>
              <Text style={styles.finalStatValue}>{finalStats?.age} years</Text>
            </View>
            <View style={styles.finalStat}>
              <Text style={styles.finalStatLabel}>Final Wealth</Text>
              <Text style={styles.finalStatValue}>${finalStats?.wealth}</Text>
            </View>
            <View style={styles.finalStat}>
              <Text style={styles.finalStatLabel}>Crystals Earned</Text>
              <Text style={styles.finalStatValue}>💎 {finalStats?.crystalsEarned}</Text>
            </View>
          </View>

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

  if (loading && !currentEvent) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Generating life event...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        {/* HUD */}
        <View style={styles.hudContainer}>
          <HUD character={character} timeRemaining={timeRemaining} />
        </View>

        {/* Event Card */}
        <View style={styles.eventContainer}>
          {currentEvent && (
            <EventCard
              event={currentEvent}
              onChoice={handleChoice}
              disabled={loading}
            />
          )}
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {/* Game Over Modal */}
        <GameOverModal />

        {/* Quit Button */}
        <TouchableOpacity
          style={styles.quitButton}
          onPress={() => {
            Alert.alert(
              'Quit Game',
              'Are you sure? Progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Quit', onPress: () => navigation.goBack(), style: 'destructive' },
              ]
            );
          }}
        >
          <Text style={styles.quitButtonText}>❌ Quit</Text>
        </TouchableOpacity>
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
  hudContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  eventContainer: {
    flex: 1,
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
  quitButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
});

export default GameScreen;
