import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CharacterProvider } from './src/context/CharacterContext';
import { GameProvider } from './src/context/GameContext';
import MainScreen from './src/screens/MainScreen';
import GameScreen from './src/screens/GameScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

export default function App() {
  return (
    <CharacterProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator 
            initialRouteName="Main"
            screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#020617' } }}
          >
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </CharacterProvider>
  );
}
