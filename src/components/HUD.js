// HUD.js - Heads-Up Display с 4 прогресс-барами (Health, Happiness, Wealth, Skills)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * КОМПОНЕНТ: HUD - Отображение атрибутов персонажа
 * @param {Object} character - Персонаж с атрибутами
 * @param {number} timeRemaining - Оставшееся время уровня (секунды)
 */
const HUD = ({ character, timeRemaining }) => {
  // Форматирование времени MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Цвет бара в зависимости от значения
  const getBarColor = (value, type) => {
    if (type === 'health') {
      if (value > 70) return ['#4ade80', '#22c55e']; // green
      if (value > 40) return ['#fbbf24', '#f59e0b']; // yellow
      return ['#ef4444', '#dc2626']; // red
    }
    if (type === 'happiness') {
      if (value > 70) return ['#60a5fa', '#3b82f6']; // blue
      if (value > 40) return ['#a78bfa', '#8b5cf6']; // purple
      return ['#94a3b8', '#64748b']; // gray
    }
    if (type === 'wealth') {
      return ['#fbbf24', '#f59e0b']; // gold
    }
    if (type === 'skills') {
      return ['#a78bfa', '#8b5cf6']; // purple
    }
    return ['#94a3b8', '#64748b'];
  };

  // Компонент отдельного бара
  const AttributeBar = ({ label, value, max, type, icon }) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const colors = getBarColor(value, type);

    return (
      <View style={styles.attributeContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.attributeIcon}>{icon}</Text>
          <Text style={styles.attributeLabel}>{label}</Text>
          <Text style={styles.attributeValue}>
            {Math.floor(value)}/{max}
          </Text>
        </View>
        <View style={styles.barBackground}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${percentage}%` }]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Верхняя строка: Имя, возраст, таймер */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.nameText}>{character.name}</Text>
          <Text style={styles.ageText}>
            Age {character.age} • {character.country}
          </Text>
        </View>
        {timeRemaining !== undefined && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        )}
      </View>

      {/* Атрибуты */}
      <View style={styles.attributesContainer}>
        <AttributeBar
          label="Health"
          value={character.health}
          max={100}
          type="health"
          icon="❤️"
        />
        <AttributeBar
          label="Happiness"
          value={character.happiness}
          max={100}
          type="happiness"
          icon="😊"
        />
        <AttributeBar
          label="Wealth"
          value={character.wealth}
          max={100000}
          type="wealth"
          icon="💰"
        />
        <AttributeBar
          label="Skills"
          value={character.skills}
          max={100}
          type="skills"
          icon="🎓"
        />
      </View>

      {/* Профессия */}
      {character.profession && (
        <View style={styles.professionContainer}>
          <Text style={styles.professionText}>
            💼 {character.profession}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  ageText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fbbf24',
  },
  attributesContainer: {
    gap: 12,
  },
  attributeContainer: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  attributeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  attributeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  attributeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  barBackground: {
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  professionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  professionText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default HUD;
