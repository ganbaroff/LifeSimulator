// App.js - Главный файл приложения с навигацией и провайдерами
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CharacterProvider } from './src/context/CharacterContext';
import { GameProvider } from './src/context/GameContext';
import { initializeAdapty } from './src/services/MonetizationService';

// Импорт экранов
import MainScreen from './src/screens/MainScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Инициализация монетизации при запуске
    initializeAdapty();
  }, []);

  return (
    <CharacterProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#0f172a' },
              animationEnabled: true,
            }}
          >
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{
                title: 'LifeSim GSL',
              }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{
                title: 'Playing',
                gestureEnabled: false, // Запрет свайпа назад во время игры
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </CharacterProvider>
  );
}
