import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity } from '../store/slices/activitiesSlice';

type ActivityCardProps = {
  activity: Activity;
  onPress: (activityId: string) => void;
  disabled?: boolean;
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onPress(activity.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        disabled && styles.disabledCard,
        { borderLeftColor: getCategoryColor(activity.category) },
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{activity.name}</Text>
        <Text style={styles.description}>{activity.description}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.stat}>⏱️ {formatDuration(activity.duration)}</Text>
          <Text style={styles.stat}>⚡ {activity.energyCost}</Text>
          
          {activity.dailyLimit && (
            <Text style={styles.stat}>
              {activity.dailyLimit - (activity.dailyCount || 0)}/{activity.dailyLimit} per day
            </Text>
          )}
        </View>
        
        {Object.entries(activity.effects).map(([key, value]) => (
          <Text key={key} style={styles.effect}>
            {getEffectEmoji(key)} {value > 0 ? '+' : ''}{value} {key}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    work: '#4a90e2',
    rest: '#50e3c2',
    social: '#f5a623',
    health: '#e74c3c',
    learning: '#9b59b6',
  };
  return colors[category] || '#cccccc';
};

const getEffectEmoji = (effect: string): string => {
  const emojis: Record<string, string> = {
    energy: '⚡',
    money: '💰',
    health: '❤️',
    happiness: '😊',
    skill: '📚',
  };
  return emojis[effect] || '➡️';
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    opacity: 0.9,
  },
  disabledCard: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  stat: {
    color: '#ecf0f1',
    fontSize: 12,
    marginRight: 12,
    marginBottom: 4,
  },
  effect: {
    color: '#2ecc71',
    fontSize: 12,
    marginTop: 4,
  },
});
