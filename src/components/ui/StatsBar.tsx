// 🎨 StatsBar Component - Design System
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface StatsBarProps {
  health: number;
  happiness: number;
  energy: number;
  wealth: number;
  showLabels?: boolean;
  compact?: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  health,
  happiness,
  energy,
  wealth,
  showLabels = true,
  compact = false,
}) => {
  const { theme } = useTheme();
  const StatItem: React.FC<{
    value: number;
    icon: string;
    color: string;
    label: string;
  }> = ({ value, icon, color, label }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statIcon, { color }]}>
        {icon}
      </Text>
      <Text style={styles.statValue}>
        {value}
      </Text>
      {showLabels && (
        <Text style={styles.statLabel}>
          {label}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <StatItem
        value={health}
        icon="❤️"
        color={theme.colors.stats?.health || '#ef4444'}
        label="Здоровье"
      />
      <StatItem
        value={happiness}
        icon="😊"
        color={theme.colors.stats?.happiness || '#f59e0b'}
        label="Счастье"
      />
      <StatItem
        value={energy}
        icon="⚡"
        color={theme.colors.stats?.energy || '#3b82f6'}
        label="Энергия"
      />
      <StatItem
        value={wealth}
        icon="💰"
        color={theme.colors.stats?.wealth || '#10b981'}
        label="Богатство"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  compact: {
    padding: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default StatsBar;
