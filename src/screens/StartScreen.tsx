import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { useSoundEffects } from '../utils/soundEffects';

const { width, height } = Dimensions.get('window');

const StartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { playButton, playAchievement } = useSoundEffects();
  
  // Анимации для элементов
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Последовательная анимация элементов
    const animateElements = () => {
      Animated.sequence([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateElements();
  }, [titleAnim, subtitleAnim, buttonsAnim]);

  const handleStartGame = () => {
    playButton();
    navigation.navigate('CharacterCreation' as never);
  };

  const handleAchievements = () => {
    playAchievement();
    navigation.navigate('Achievements' as never);
  };

  const handleTutorial = () => {
    playButton();
    // TODO: Добавить экран обучения
    console.log('Обучение нажато');
  };

  return (
    <AnimatedScreen animationType="fadeIn" duration={1000}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Заголовок с анимацией */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleAnim,
                transform: [{ translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }) }],
              },
            ]}
          >
            <Text style={styles.title}>Life Simulator</Text>
            <Text style={styles.subtitle}>Создай свою уникальную историю</Text>
          </Animated.View>

          {/* Подзаголовок с анимацией */}
          <Animated.View
            style={[
              styles.descriptionContainer,
              {
                opacity: subtitleAnim,
                transform: [{ translateY: subtitleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }) }],
              },
            ]}
          >
            <Text style={styles.description}>
              От рождения до старости — каждый выбор имеет значение
            </Text>
            <Text style={styles.features}>
              🎭 Создай персонажа • 🌍 Выбери эпоху • 👥 Найди друзей • 💼 Построй карьеру
            </Text>
          </Animated.View>

          {/* Кнопки с анимацией */}
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonsAnim,
                transform: [{ translateY: buttonsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }) }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleStartGame}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Начать игру</Text>
              <Text style={styles.buttonSubtext}>Создать нового персонажа</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleTutorial}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Обучение</Text>
              <Text style={styles.buttonSubtext}>Как играть</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleAchievements}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Достижения</Text>
              <Text style={styles.buttonSubtext}>Мои рекорды</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Версия игры */}
          <View style={styles.versionContainer}>
            <Text style={styles.version}>v1.0.0</Text>
            <Text style={styles.copyright}> 2024 Life Simulator</Text>
          </View>
        </View>
      </LinearGradient>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    opacity: 0.8,
  },
  features: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 15,
    marginBottom: 40,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  versionContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 5,
  },
});

export default StartScreen;
