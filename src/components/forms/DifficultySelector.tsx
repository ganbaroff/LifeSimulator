// Компонент выбора уровня сложности - Sprint 2 Task 4
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface DifficultyLevel {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  description: string;
  deathChanceMultiplier: number;
  historicalDensity: number;
  startingBonus: {
    health: number;
    happiness: number;
    energy: number;
    wealth: number;
  };
  color: string;
}

interface DifficultySelectorProps {
  selectedDifficulty: string;
  onDifficultySelect: (difficultyId: string) => void;
  isLoading?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultySelect,
  isLoading = false
}) => {
  const difficulties: DifficultyLevel[] = [
    {
      id: 'easy',
      name: 'Легкий',
      description: 'Отдыхайте и наслаждайтесь жизнью без лишних рисков',
      deathChanceMultiplier: 0.1,
      historicalDensity: 0.2,
      startingBonus: { health: 20, happiness: 20, energy: 10, wealth: 2000 },
      color: '#10b981'
    },
    {
      id: 'medium',
      name: 'Средний',
      description: 'Сбалансированная игра с вызовами и возможностями',
      deathChanceMultiplier: 0.3,
      historicalDensity: 0.5,
      startingBonus: { health: 10, happiness: 10, energy: 5, wealth: 1000 },
      color: '#f59e0b'
    },
    {
      id: 'hard',
      name: 'Сложный',
      description: 'Только для самых стойких - каждый выбор имеет значение',
      deathChanceMultiplier: 0.6,
      historicalDensity: 0.8,
      startingBonus: { health: 0, happiness: 0, energy: 0, wealth: 500 },
      color: '#ef4444'
    }
  ];

  const handleDifficultySelect = useCallback((difficultyId: string) => {
    if (!isLoading) {
      onDifficultySelect(difficultyId);
    }
  }, [isLoading, onDifficultySelect]);

  const getDifficultyIcon = (difficulty: DifficultyLevel): string => {
    switch (difficulty.id) {
      case 'easy': return '😊';
      case 'medium': return '⚖️';
      case 'hard': return '💀';
      default: return '🎮';
    }
  };

  const getDifficultyStats = (difficulty: DifficultyLevel): string => {
    const stats = [];
    if (difficulty.deathChanceMultiplier < 0.3) stats.push('Низкий риск');
    else if (difficulty.deathChanceMultiplier < 0.6) stats.push('Средний риск');
    else stats.push('Высокий риск');

    if (difficulty.historicalDensity < 0.4) stats.push('Мало событий');
    else if (difficulty.historicalDensity < 0.7) stats.push('Умеренно событий');
    else stats.push('Много событий');

    return stats.join(' • ');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите уровень сложности</Text>
      <Text style={styles.subtitle}>
        Сложность влияет на стартовые бонусы и частоту исторических событий
      </Text>

      <ScrollView 
        style={styles.difficultiesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.difficultiesListContent}
      >
        {difficulties.map((difficulty) => (
          <TouchableOpacity
            key={difficulty.id}
            style={[
              styles.difficultyCard,
              selectedDifficulty === difficulty.id && styles.selectedDifficultyCard,
              { borderColor: difficulty.color },
              selectedDifficulty === difficulty.id && { 
                backgroundColor: `${difficulty.color}20`,
                borderWidth: 3
              },
              isLoading && styles.disabledCard
            ]}
            onPress={() => handleDifficultySelect(difficulty.id)}
            disabled={isLoading}
          >
            <View style={styles.difficultyHeader}>
              <View style={styles.difficultyInfo}>
                <View style={styles.difficultyTitleRow}>
                  <Text style={styles.difficultyIcon}>
                    {getDifficultyIcon(difficulty)}
                  </Text>
                  <Text style={[
                    styles.difficultyName,
                    { color: difficulty.color }
                  ]}>
                    {difficulty.name}
                  </Text>
                </View>
                <Text style={styles.difficultyStats}>
                  {getDifficultyStats(difficulty)}
                </Text>
              </View>
              <View style={styles.radioButton}>
                <Text style={[
                  styles.radioText,
                  selectedDifficulty === difficulty.id && styles.radioTextSelected,
                  selectedDifficulty === difficulty.id && { color: difficulty.color }
                ]}>
                  {selectedDifficulty === difficulty.id ? '●' : '○'}
                </Text>
              </View>
            </View>

            <Text style={styles.difficultyDescription}>
              {difficulty.description}
            </Text>

            <View style={styles.bonusContainer}>
              <Text style={styles.bonusTitle}>Стартовые бонусы:</Text>
              <View style={styles.bonusRow}>
                <View style={styles.bonusItem}>
                  <Text style={styles.bonusIcon}>❤️</Text>
                  <Text style={styles.bonusValue}>+{difficulty.startingBonus.health}</Text>
                </View>
                <View style={styles.bonusItem}>
                  <Text style={styles.bonusIcon}>😊</Text>
                  <Text style={styles.bonusValue}>+{difficulty.startingBonus.happiness}</Text>
                </View>
                <View style={styles.bonusItem}>
                  <Text style={styles.bonusIcon}>⚡</Text>
                  <Text style={styles.bonusValue}>+{difficulty.startingBonus.energy}</Text>
                </View>
                <View style={styles.bonusItem}>
                  <Text style={styles.bonusIcon}>💰</Text>
                  <Text style={styles.bonusValue}>+{difficulty.startingBonus.wealth}</Text>
                </View>
              </View>
            </View>

            <View style={styles.difficultyDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Шанс смерти:</Text>
                <Text style={styles.detailValue}>
                  {Math.round(difficulty.deathChanceMultiplier * 100)}%
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Плотность событий:</Text>
                <Text style={styles.detailValue}>
                  {Math.round(difficulty.historicalDensity * 100)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  difficultiesList: {
    flex: 1,
  },
  difficultiesListContent: {
    gap: 12,
  },
  difficultyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedDifficultyCard: {
    // Динамические стили применяются выше
  },
  disabledCard: {
    opacity: 0.5,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  difficultyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  difficultyStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  radioButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
  },
  radioTextSelected: {
    // Динамические стили применяются выше
  },
  difficultyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  bonusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  bonusTitle: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bonusItem: {
    alignItems: 'center',
  },
  bonusIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  bonusValue: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  difficultyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default DifficultySelector;
