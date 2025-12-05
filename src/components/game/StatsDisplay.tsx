// Компонент отображения характеристик - Sprint 3 Task 2
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CharacterStats } from '../../types/game';

interface StatsDisplayProps {
  stats: CharacterStats;
  previousStats?: CharacterStats;
  showChanges?: boolean;
  compact?: boolean;
}

interface StatConfig {
  key: keyof CharacterStats;
  name: string;
  icon: string;
  color: string;
  maxValue: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  previousStats,
  showChanges = true,
  compact = false
}) => {
  const statConfigs: StatConfig[] = [
    { key: 'health', name: 'Здоровье', icon: '❤️', color: '#ef4444', maxValue: 100 },
    { key: 'happiness', name: 'Счастье', icon: '😊', color: '#f59e0b', maxValue: 100 },
    { key: 'wealth', name: 'Богатство', icon: '💰', color: '#10b981', maxValue: 10000 },
    { key: 'energy', name: 'Энергия', icon: '⚡', color: '#3b82f6', maxValue: 100 },
  ];

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {statConfigs.map((config) => {
        const value = stats[config.key];
        const previousValue = previousStats?.[config.key] ?? value;
        const change = value - previousValue;
        const percentage = (value / config.maxValue) * 100;
        const isPositive = change > 0;
        const isNegative = change < 0;

        return (
          <StatBar
            key={config.key}
            config={config}
            value={value}
            percentage={percentage}
            change={showChanges ? change : 0}
            compact={compact}
          />
        );
      })}
    </View>
  );
};

interface StatBarProps {
  config: StatConfig;
  value: number;
  percentage: number;
  change: number;
  compact: boolean;
}

const StatBar: React.FC<StatBarProps> = ({ config, value, percentage, change, compact }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const changeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация прогресс-бара
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Анимация изменения
    if (change !== 0) {
      changeOpacity.setValue(1);
      Animated.timing(changeOpacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }
  }, [percentage, change, animatedWidth, changeOpacity]);

  const getBarColor = (): string => {
    if (percentage >= 80) return config.color;
    if (percentage >= 40) return config.color;
    return '#ef4444'; // Красный для низких значений
  };

  const getStatusText = (): string => {
    if (percentage >= 80) return 'Отлично';
    if (percentage >= 60) return 'Хорошо';
    if (percentage >= 40) return 'Нормально';
    if (percentage >= 20) return 'Плохо';
    return 'Критично';
  };

  const getStatusColor = (): string => {
    if (percentage >= 60) return '#10b981';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={[styles.statContainer, compact && styles.statContainerCompact]}>
      {/* Header */}
      <View style={styles.statHeader}>
        <View style={styles.statInfo}>
          <Text style={styles.statIcon}>{config.icon}</Text>
          <Text style={styles.statName}>{config.name}</Text>
        </View>
        
        <View style={styles.statValues}>
          <Text style={styles.statValue}>{value}</Text>
          {!compact && (
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: getBarColor(),
              },
            ]}
          />
        </View>
        
        {/* Percentage text */}
        {!compact && (
          <Text style={styles.percentageText}>
            {Math.round(percentage)}%
          </Text>
        )}
      </View>

      {/* Change indicator */}
      {change !== 0 && (
        <Animated.View
          style={[
            styles.changeIndicator,
            { opacity: changeOpacity },
          ]}
        >
          <Text style={[
            styles.changeText,
            change > 0 ? styles.changePositive : styles.changeNegative
          ]}>
            {change > 0 ? '+' : ''}{change}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  containerCompact: {
    padding: 12,
    gap: 8,
  },
  statContainer: {
    gap: 8,
  },
  statContainerCompact: {
    gap: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 16,
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statValues: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
  changeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  changePositive: {
    color: '#10b981',
  },
  changeNegative: {
    color: '#ef4444',
  },
});

export default StatsDisplay;
