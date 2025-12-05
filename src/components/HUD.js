// HUD.js - (Пересборка для стабильности. Фаза 1)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Упрощенный HUD, который отображает только базовые параметры
const HUD = ({ character }) => {
  if (!character) return null;

  const StatBar = ({ label, value, color }) => (
    <View style={styles.statContainer}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBar}>
        <View style={[styles.statFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatBar label="❤️ Health" value={character.health} color="#ef4444" />
      <StatBar label="😊 Happiness" value={character.happiness} color="#fbbf24" />
      <StatBar label="🎓 Skills" value={character.skills} color="#3b82f6" />
      <View style={styles.wealthContainer}>
        <Text style={styles.wealthLabel}>💰 Wealth: ${character.wealth.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    width: 90,
    color: '#cbd5e1',
    fontSize: 12,
  },
  statBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    marginHorizontal: 8,
  },
  statFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    width: 30,
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  wealthContainer: {
      marginTop: 8,
      alignItems: 'center',
  },
  wealthLabel: {
      color: '#22c55e',
      fontSize: 14,
      fontWeight: 'bold',
  }
});

export default HUD;
