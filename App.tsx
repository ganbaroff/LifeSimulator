import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/index';
import { useAppDispatch, useAppSelector } from './src/store/index';
import StartScreen from './src/screens/StartScreen';
import CharacterCreationScreenAgile from './src/screens/CharacterCreationScreenAgile';
import GameScreenAgileMain from './src/screens/GameScreenAgile';
import AchievementsScreen from './src/screens/AchievementsScreen';
import ProfessionScreen from './src/components/game/ProfessionScreen';
import LocationScreen from './src/screens/LocationScreen';
import { RootStackParamList } from './src/navigation/types';

type TabParamList = {
  Home: undefined;
  Activities: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Main App Navigation
const AppStack = () => (
  <Stack.Navigator 
    initialRouteName="Start"
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}
  >
    <Stack.Screen name="Start" component={StartScreen} />
    <Stack.Screen name="CharacterCreation" component={CharacterCreationScreenAgile} />
    <Stack.Screen name="Game" component={GameScreenAgileMain} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
    <Stack.Screen name="Professions" component={ProfessionScreen} />
    <Stack.Screen name="Profession" component={ProfessionScreen} />
    <Stack.Screen name="LocationSelection" component={LocationScreen} />
  </Stack.Navigator>
);

function HomeScreen() {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) => state.character.current);
  const gameStatus = useAppSelector((state) => state.game.status);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Life Simulator</Text>
      
      <View style={styles.statsContainer}>
        {character && (
          <>
            <Text style={styles.stat}>Name: {character.name}</Text>
            <Text style={styles.stat}>Age: {character.age}</Text>
            <Text style={styles.stat}>Health: {character.stats.health}%</Text>
            <Text style={styles.stat}>Happiness: {character.stats.happiness}%</Text>
            <Text style={styles.stat}>Wealth: ${character.stats.wealth}</Text>
            <Text style={styles.stat}>Energy: {character.stats.energy}%</Text>
          </>
        )}
        <Text style={styles.stat}>Game Status: {gameStatus}</Text>
      </View>
    </View>
  );
}

function StatsScreen() {
  const character = useAppSelector((state) => state.character.current);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <View style={styles.statsContainer}>
        {character && (
          <>
            <Text style={styles.stat}>Name: {character.name}</Text>
            <Text style={styles.stat}>Age: {character.age}</Text>
            <Text style={styles.stat}>Wealth: ${character.stats.wealth}</Text>
            <Text style={styles.stat}>Profession: {character.profession || 'None'}</Text>
            <Text style={styles.stat}>Education: {character.educationLevel || 'None'}</Text>
            <Text style={styles.stat}>Health: {character.stats.health}%</Text>
            <Text style={styles.stat}>Happiness: {character.stats.happiness}%</Text>
            <Text style={styles.stat}>Energy: {character.stats.energy}%</Text>
          </>
        )}
      </View>
    </View>
  );
}

function ActivitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activities</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen 
        name="Activities" 
        component={ActivitiesScreen} 
        options={{ 
          title: 'Activities',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{ 
          title: 'Statistics',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const linking = {
    prefixes: ['http://localhost:8086'],
    config: {
      screens: {
        Start: '',
        CharacterCreation: 'create',
        Game: 'game',
        Achievements: 'achievements',
      },
    },
  };

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer linking={linking}>
          <StatusBar style="light" />
          <AppStack />
        </NavigationContainer>
      </PersistGate>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  stat: {
    fontSize: 18,
    marginVertical: 5,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  currentActivity: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
  },
  currentActivityText: {
    color: '#0d47a1',
    textAlign: 'center',
    fontWeight: '500',
  },
});
