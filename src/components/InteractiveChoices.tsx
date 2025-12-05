// Компонент интерактивных выборов с реальными последствиями
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { GameEvent, EventEffects } from '../types/game';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';
import { useSoundEffects } from '../utils/soundEffects';

interface InteractiveChoicesProps {
  event: GameEvent;
  onChoiceMade: (choice: 'A' | 'B' | 'C') => void;
  isLoading?: boolean;
}

export const InteractiveChoices: React.FC<InteractiveChoicesProps> = ({
  event,
  onChoiceMade,
  isLoading = false,
}) => {
  const dispatch = useAppDispatch();
  const { playChoice, playError, playLevelUp } = useSoundEffects();
  const character = useAppSelector(state => state.character.current);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [choiceAnimations] = useState({
    A: new Animated.Value(1),
    B: new Animated.Value(1),
    C: new Animated.Value(1),
  });

  // Анимация выбора
  const animateChoice = (choice: 'A' | 'B' | 'C') => {
    Animated.sequence([
      Animated.timing(choiceAnimations[choice], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(choiceAnimations[choice], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Проверка доступности выбора
  const isChoiceAvailable = (choice: 'A' | 'B' | 'C'): boolean => {
    if (!character) return true;
    
    const effects = event.effects[choice];
    
    // Проверка на достаточное богатство
    if (effects.wealth && effects.wealth < 0) {
      if (character.stats.wealth + effects.wealth < 0) {
        return false;
      }
    }
    
    // Проверка на достаточное здоровье
    if (effects.health && effects.health < 0) {
      if (character.stats.health + effects.health < 0) {
        return false;
      }
    }
    
    return true;
  };

  // Получение причины недоступности выбора
  const getUnavailableReason = (choice: 'A' | 'B' | 'C'): string => {
    if (!character) return '';
    
    const effects = event.effects[choice];
    
    if (effects.wealth && effects.wealth < 0) {
      if (character.stats.wealth + effects.wealth < 0) {
        return `Недостаточно денег (нужно ${Math.abs(effects.wealth)})`;
      }
    }
    
    if (effects.health && effects.health < 0) {
      if (character.stats.health + effects.health < 0) {
        return `Слишком рискованно для здоровья`;
      }
    }
    
    return '';
  };

  // Обработка выбора
  const handleChoice = async (choice: 'A' | 'B' | 'C') => {
    if (!isChoiceAvailable(choice)) {
      playError();
      Alert.alert('Недоступно', getUnavailableReason(choice));
      return;
    }

    setSelectedChoice(choice);
    setIsProcessing(true);
    animateChoice(choice);
    playChoice();

    try {
      // Применяем эффекты к персонажу
      const effects = event.effects[choice];
      
      // Диспатчим обновление характеристик
      dispatch(characterActions.updateStats(effects));
      
      // Добавляем в историю
      dispatch(characterActions.addToHistory({
        event,
        choice,
      }));

      // Проверяем особые условия
      await checkSpecialConditions(effects);

      // Вызываем callback
      onChoiceMade(choice);
      
    } catch (error) {
      console.error('Error processing choice:', error);
      playError();
      Alert.alert('Ошибка', 'Не удалось обработать выбор');
    } finally {
      setIsProcessing(false);
    }
  };

  // Проверка особых условий
  const checkSpecialConditions = async (effects: EventEffects) => {
    if (!character) return;

    // Проверка на повышение уровня
    const oldStats = character.stats;
    const newStats = {
      health: oldStats.health + (effects.health || 0),
      happiness: oldStats.happiness + (effects.happiness || 0),
      wealth: oldStats.wealth + (effects.wealth || 0),
      energy: oldStats.energy + (effects.energy || 0),
    };

    // Если все характеристики выше 80 - уровень повышен
    if (Object.values(newStats).every(stat => stat >= 80)) {
      playLevelUp();
      Alert.alert(
        '🎉 Уровень повышен!',
        'Все ваши характеристики выше 80! Вы достигли нового уровня жизни.'
      );
    }

    // Проверка на банкротство
    if (newStats.wealth <= 0) {
      Alert.alert(
        '💔 Банкротство',
        'Вы обанкротились! Это серьезно повлияет на вашу дальнейшую жизнь.'
      );
    }

    // Проверка на критическое здоровье
    if (newStats.health <= 10) {
      Alert.alert(
        '⚠️ Опасность',
        'Ваше здоровье в критическом состоянии! Немедленно примите меры.'
      );
    }
  };

  const getChoiceColor = (choice: 'A' | 'B' | 'C') => {
    if (!isChoiceAvailable(choice)) return '#64748b';
    if (selectedChoice === choice) return '#10b981';
    return '#3b82f6';
  };

  const getChoiceStyle = (choice: 'A' | 'B' | 'C') => {
    return [
      styles.choiceButton,
      {
        opacity: isChoiceAvailable(choice) ? 1 : 0.5,
        borderColor: getChoiceColor(choice),
        transform: [{ scale: choiceAnimations[choice] }],
      },
    ];
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка события...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.situation}>{event.situation}</Text>
      
      <View style={styles.choicesContainer}>
        {(['A', 'B', 'C'] as const).map((choice) => (
          <Animated.View key={choice} style={getChoiceStyle(choice)}>
            <TouchableOpacity
              style={styles.choiceContent}
              onPress={() => handleChoice(choice)}
              disabled={isProcessing || !isChoiceAvailable(choice)}
              activeOpacity={0.8}
            >
              <View style={styles.choiceHeader}>
                <Text style={[styles.choiceLetter, { color: getChoiceColor(choice) }]}>
                  {choice}
                </Text>
                {!isChoiceAvailable(choice) && (
                  <Text style={styles.unavailableIcon}>🔒</Text>
                )}
              </View>
              
              <Text style={styles.choiceText}>
                {event[choice]}
              </Text>
              
              {/* Показываем эффекты для информированности */}
              <View style={styles.effectsContainer}>
                {Object.entries(event.effects[choice]).map(([stat, value]) => (
                  <Text key={stat} style={styles.effectText}>
                    {stat === 'health' && '❤️'}
                    {stat === 'happiness' && '😊'}
                    {stat === 'wealth' && '💰'}
                    {stat === 'energy' && '⚡'}
                    {' '}
                    {value > 0 ? `+${value}` : value}
                  </Text>
                ))}
              </View>
              
              {!isChoiceAvailable(choice) && (
                <Text style={styles.unavailableText}>
                  {getUnavailableReason(choice)}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Обработка выбора...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  situation: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  loadingText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  choiceContent: {
    padding: 16,
  },
  choiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  choiceLetter: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unavailableIcon: {
    fontSize: 16,
  },
  choiceText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 22,
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unavailableText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
