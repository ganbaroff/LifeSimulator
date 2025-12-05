import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const StartScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleStartGame = () => {
    navigation.navigate('Main');
  };

  const handleTutorial = () => {
    navigation.navigate('Tutorial');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/start-bg.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Life Simulator</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleStartGame}
            >
              <Text style={styles.buttonText}>Начать игру</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleTutorial}
            >
              <Text style={styles.buttonText}>Обучение</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.settingsButton]}
              onPress={handleSettings}
            >
              <Text style={styles.buttonText}>Настройки</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.version}>Версия 1.0.0</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  settingsButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default StartScreen;
