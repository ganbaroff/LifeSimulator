// Game Loop Component - Основной игровой интерфейс
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { setGameSpeed } from '../../store/slices/gameLoopSlice';
import { useTheme } from '../theme/ThemeProvider';

const GameLoop: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character.current);
  const gameLoop = useSelector((state: RootState) => state.gameLoop);
  const theme = useTheme();
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    dispatch(setGameSpeed(speed));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: theme.typography.h2.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
    },
    statsContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statsTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    statLabel: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
    },
    statValue: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    speedControlContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    speedTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    speedButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    speedButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.secondary,
    },
    speedButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    speedButtonText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontWeight: '500',
    },
    speedButtonTextActive: {
      color: theme.colors.text.inverse,
    },
    infoContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    infoTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    infoText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.body.lineHeight,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.sm,
    },
    statusDotActive: {
      backgroundColor: theme.colors.success,
    },
    statusDotInactive: {
      backgroundColor: theme.colors.text.muted,
    },
    statusText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
    },
  });

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Игровой процесс</Text>
        <Text style={styles.subtitle}>
          {character.name}, {character.age} лет • {character.country}
        </Text>
      </View>

      {/* Status */}
      <View style={styles.statusIndicator}>
        <View style={[
          styles.statusDot, 
          gameLoop.isRunning ? styles.statusDotActive : styles.statusDotInactive
        ]} />
        <Text style={styles.statusText}>
          {gameLoop.isRunning ? 'Игра активна' : 'Игра на паузе'}
        </Text>
      </View>

      {/* Stats Display */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Характеристики</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Здоровье</Text>
          <Text style={styles.statValue}>{character.stats.health}%</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Счастье</Text>
          <Text style={styles.statValue}>{character.stats.happiness}%</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Энергия</Text>
          <Text style={styles.statValue}>{character.stats.energy}%</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Богатство</Text>
          <Text style={styles.statValue}>${character.stats.wealth}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Профессия</Text>
          <Text style={styles.statValue}>{character.profession || 'Нет'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Образование</Text>
          <Text style={styles.statValue}>{character.educationLevel || 'Нет'}</Text>
        </View>
      </View>

      {/* Speed Control */}
      <View style={styles.speedControlContainer}>
        <Text style={styles.speedTitle}>Скорость игры</Text>
        <View style={styles.speedButtons}>
          <TouchableOpacity
            style={[
              styles.speedButton,
              selectedSpeed === 1 && styles.speedButtonActive
            ]}
            onPress={() => handleSpeedChange(1)}
          >
            <Text style={[
              styles.speedButtonText,
              selectedSpeed === 1 && styles.speedButtonTextActive
            ]}>
              1x
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.speedButton,
              selectedSpeed === 2 && styles.speedButtonActive
            ]}
            onPress={() => handleSpeedChange(2)}
          >
            <Text style={[
              styles.speedButtonText,
              selectedSpeed === 2 && styles.speedButtonTextActive
            ]}>
              2x
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.speedButton,
              selectedSpeed === 4 && styles.speedButtonActive
            ]}
            onPress={() => handleSpeedChange(4)}
          >
            <Text style={[
              styles.speedButtonText,
              selectedSpeed === 4 && styles.speedButtonTextActive
            ]}>
              4x
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Game Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Информация</Text>
        <Text style={styles.infoText}>
          • События происходят каждые 15 секунд{gameLoop.gameSpeed > 1 && ` (x${gameLoop.gameSpeed})`}
          {'\n'}• Возраст увеличивается каждые 30 секунд
          {'\n'}• Выбирайте события чтобы изменить характеристики
          {'\n'}• Следите за здоровьем и счастьем
        </Text>
      </View>
    </ScrollView>
  );
};

export default GameLoop;
