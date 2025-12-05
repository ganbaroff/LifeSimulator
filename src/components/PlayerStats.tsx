import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatBarProps = {
  value: number;
  max: number;
  color: string;
  label: string;
  showNumber?: boolean;
};

const StatBar: React.FC<StatBarProps> = ({
  value,
  max,
  color,
  label,
  showNumber = true,
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <View style={styles.statContainer}>
      <View style={styles.statLabelContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        {showNumber && (
          <Text style={styles.statValue}>
            {Math.round(value)}/{max}
          </Text>
        )}
      </View>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

type PlayerStatsProps = {
  health: number;
  energy: number;
  happiness: number;
  money: number;
  age: number;
  day: number;
};

export const PlayerStats: React.FC<PlayerStatsProps> = ({
  health,
  energy,
  happiness,
  money,
  age,
  day,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{age}</Text>
          <Text style={styles.statLabelSmall}>Age</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${money.toLocaleString()}</Text>
          <Text style={styles.statLabelSmall}>Money</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>Day {day}</Text>
          <Text style={styles.statLabelSmall}>Progress</Text>
        </View>
      </View>

      <View style={styles.barsContainer}>
        <StatBar
          value={health}
          max={100}
          color="#e74c3c"
          label="Health"
          showNumber={false}
        />
        <StatBar
          value={energy}
          max={100}
          color="#f39c12"
          label="Energy"
          showNumber={false}
        />
        <StatBar
          value={happiness}
          max={100}
          color="#2ecc71"
          label="Happiness"
          showNumber={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabelSmall: {
    color: '#bdc3c7',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barsContainer: {
    marginTop: 8,
  },
  statContainer: {
    marginBottom: 12,
  },
  statLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    color: '#ecf0f1',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#bdc3c7',
    fontSize: 12,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#34495e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
