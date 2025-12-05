// Компонент реального времени для статистики
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { characterActions } from '../store/slices/characterSlice';

interface RealTimeStatsProps {
  showChanges?: boolean;
  previousStats?: {
    health: number;
    happiness: number;
    wealth: number;
    energy: number;
  };
}

export const RealTimeStats: React.FC<RealTimeStatsProps> = ({ 
  showChanges = false, 
  previousStats 
}) => {
  const character = useAppSelector(state => state.character.current);
  const [animatedValues, setAnimatedValues] = useState({
    health: new Animated.Value(0),
    happiness: new Animated.Value(0),
    wealth: new Animated.Value(0),
    energy: new Animated.Value(0),
  });

  // Анимация изменений характеристик
  useEffect(() => {
    if (character && previousStats) {
      Object.keys(animatedValues).forEach((stat) => {
        const currentValue = character.stats[stat as keyof typeof character.stats];
        const previousValue = previousStats[stat as keyof typeof previousStats];
        
        if (currentValue !== previousValue) {
          // Анимация изменения
          Animated.timing(animatedValues[stat as keyof typeof animatedValues], {
            toValue: currentValue - previousValue,
            duration: 1000,
            useNativeDriver: false,
          }).start();
        }
      });
    }
  }, [character, previousStats]);

  const getStatColor = (stat: keyof typeof character.stats) => {
    if (!character) return '#64748b';
    
    const value = character.stats[stat];
    if (value >= 80) return '#10b981'; // Зеленый
    if (value >= 50) return '#f59e0b'; // Желтый
    if (value >= 25) return '#f97316'; // Оранжевый
    return '#ef4444'; // Красный
  };

  const getStatIcon = (stat: keyof typeof character.stats) => {
    switch (stat) {
      case 'health': return '❤️';
      case 'happiness': return '😊';
      case 'wealth': return '💰';
      case 'energy': return '⚡';
      default: return '📊';
    }
  };

  const getChangeIndicator = (stat: keyof typeof character.stats) => {
    if (!showChanges || !previousStats || !character) return null;
    
    const current = character.stats[stat];
    const previous = previousStats[stat];
    const change = current - previous;
    
    if (change === 0) return null;
    
    return (
      <Animated.Text
        style={[
          styles.changeText,
          change > 0 ? styles.positiveChange : styles.negativeChange,
        ]}
      >
        {change > 0 ? `+${change}` : change}
      </Animated.Text>
    );
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка характеристик...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Характеристики</Text>
      
      <View style={styles.statsGrid}>
        {Object.entries(character.stats).map(([stat, value]) => (
          <View key={stat} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>{getStatIcon(stat as keyof typeof character.stats)}</Text>
              <Text style={styles.statName}>{stat === 'health' ? 'Здоровье' : 
                                                    stat === 'happiness' ? 'Счастье' : 
                                                    stat === 'wealth' ? 'Богатство' : 'Энергия'}</Text>
            </View>
            
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: getStatColor(stat as keyof typeof character.stats) }]}>
                {value}
              </Text>
              {getChangeIndicator(stat as keyof typeof character.stats)}
            </View>
            
            {/* Прогресс бар */}
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getStatColor(stat as keyof typeof character.stats),
                    width: `${Math.min(100, Math.max(0, value))}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Дополнительная информация */}
      <View style={styles.additionalInfo}>
        <Text style={styles.infoText}>Возраст: {character.age} лет</Text>
        <Text style={styles.infoText}>Страна: {character.country}</Text>
        <Text style={styles.infoText}>Профессия: {character.profession || 'Нет'}</Text>
        <Text style={styles.infoText}>Образование: {character.educationLevel || 'Нет'}</Text>
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
});
