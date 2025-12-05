import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

type GameHUDProps = {
  character: {
    age: number;
    health: number;
    energy: number;
    happiness: number;
    wealth: number;
  };
  timeRemaining: number;
  currentDay: number;
  crystals: number;
  onMenuPress?: () => void;
  onPausePress?: () => void;
  onAchievementsPress?: () => void;
  isPaused?: boolean;
};

export const GameHUD: React.FC<GameHUDProps> = ({
  character,
  timeRemaining,
  currentDay,
  crystals,
  onMenuPress,
  onPausePress,
  onAchievementsPress,
  isPaused = false,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (health: number) => {
    if (health > 70) return '#10b981';
    if (health > 30) return '#f59e0b';
    return '#ef4444';
  };

  const getEnergyColor = (energy: number) => {
    if (energy > 70) return '#3b82f6';
    if (energy > 30) return '#f59e0b';
    return '#ef4444';
  };

  const getHappinessColor = (happiness: number) => {
    if (happiness > 70) return '#fbbf24';
    if (happiness > 30) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']}
        style={styles.gradient}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.leftSection}>
            <Text style={styles.dayText}>Day {currentDay}</Text>
          </View>

          <View style={styles.centerSection}>
            <Text style={styles.ageText}>Age {character.age}</Text>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, styles.menuButton]}
                onPress={onMenuPress}
              >
                <Icon name="menu" size={20} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={onPausePress}
              >
                <Icon name={isPaused ? "play-arrow" : "pause"} size={20} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.achievementsButton]}
                onPress={onAchievementsPress}
              >
                <Icon name="emoji-events" size={20} color="#fbbf24" />
              </TouchableOpacity>
            </View>
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          {/* Health */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="favorite" size={16} color={getHealthColor(character.health)} />
              <Text style={[styles.statLabel, { color: getHealthColor(character.health) }]}>
                Health
              </Text>
            </View>
            <Text style={styles.statValue}>{character.health}%</Text>
          </View>

          {/* Energy */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="bolt" size={16} color={getEnergyColor(character.energy)} />
              <Text style={[styles.statLabel, { color: getEnergyColor(character.energy) }]}>
                Energy
              </Text>
            </View>
            <Text style={styles.statValue}>{character.energy}%</Text>
          </View>

          {/* Happiness */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="sentiment-satisfied" size={16} color={getHappinessColor(character.happiness)} />
              <Text style={[styles.statLabel, { color: getHappinessColor(character.happiness) }]}>
                Happiness
              </Text>
            </View>
            <Text style={styles.statValue}>{character.happiness}%</Text>
          </View>

          {/* Wealth */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="attach-money" size={16} color="#10b981" />
              <Text style={[styles.statLabel, { color: '#10b981' }]}>
                Wealth
              </Text>
            </View>
            <Text style={styles.statValue}>${character.wealth.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    margin: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  pauseButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  achievementsButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
});
