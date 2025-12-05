// Главный игровой экран по Agile методологии - Sprint 3 Final
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import GameLoopManager from './GameLoopManager';
import EventCard from './EventCard';
import GameLoop from './GameLoop';
import StatsScreen from './StatsScreen';
import TravelScreen from './TravelScreen';
import HistoryScreen from './HistoryScreen';
import ProfessionScreen from './ProfessionScreen';

const Tab = createBottomTabNavigator();

interface GameScreenAgileProps {
  onGameOver?: (deathCause: string) => void;
}

const GameScreenAgile: React.FC<GameScreenAgileProps> = ({ onGameOver }) => {
  const navigation = useNavigation();
  const character = useSelector((state: RootState) => state.character?.current);
  const game = useSelector((state: RootState) => state.game);
  const currentEvent = useSelector((state: RootState) => state.gameLoop.currentEvent);

  // Если character не существует, показываем загрузку
  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка персонажа...</Text>
      </View>
    );
  }

  // Handle game over
  const handleGameOver = useCallback((deathCause: string) => {
    console.log('💀 Обработка окончания игры:', deathCause);
    
    // Переход к экрану окончания игры
    navigation.navigate('Start' as never, { gameOver: true, deathCause } as never);
    onGameOver?.(deathCause);
  }, [navigation, onGameOver]);

  if (!character || game.status !== 'playing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка игры...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GameLoopManager>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Life Simulator</Text>
          <Text style={styles.headerSubtitle}>{character.name}, {character.age} лет</Text>
        </View>

        {/* Event Display or Game Content */}
        {currentEvent ? (
          <EventCard event={currentEvent} />
        ) : (
          <View style={styles.noEventContainer}>
            <Text style={styles.noEventText}>Ждите следующих событий...</Text>
            <Text style={styles.noEventSubtext}>События происходят каждые 15 секунд</Text>
          </View>
        )}
        
        {/* Tab Navigation */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Game') {
                iconName = focused ? 'game-controller' : 'game-controller-outline';
              } else if (route.name === 'Stats') {
                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              } else if (route.name === 'Travel') {
                iconName = focused ? 'airplane' : 'airplane-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'time' : 'time-outline';
              } else if (route.name === 'Profession') {
                iconName = focused ? 'briefcase' : 'briefcase-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: styles.tabBar,
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="Game" 
            component={GameLoop}
            options={{ title: 'Игра' }}
          />
          <Tab.Screen 
            name="Stats" 
            component={StatsScreen}
            options={{ title: 'Статистика' }}
          />
          <Tab.Screen 
            name="Travel" 
            component={TravelScreen}
            options={{ title: 'Путешествия' }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ title: 'История' }}
          />
          <Tab.Screen 
            name="Profession" 
            component={ProfessionScreen}
            options={{ title: 'Профессия' }}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </GameLoopManager>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  noEventContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noEventText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  noEventSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 8,
    paddingTop: 8,
  },
});

export default GameScreenAgile;
