import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

type ScenarioCardProps = {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onPress: () => void;
};

const difficultyColors = {
  easy: '#4CAF50',
  medium: '#FFC107',
  hard: '#F44336',
};

const difficultyLabels = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  title, 
  description, 
  difficulty,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftWidth: 4, borderLeftColor: difficultyColors[difficulty] }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.difficulty}>
        Сложность: <Text style={{ color: difficultyColors[difficulty] }}>
          {difficultyLabels[difficulty]}
        </Text>
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  difficulty: {
    color: '#BBBBBB',
    fontSize: 12,
    marginBottom: 8,
  },
  description: {
    color: '#DDDDDD',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ScenarioCard;
