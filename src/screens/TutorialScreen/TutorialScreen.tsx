import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Добро пожаловать в Life Simulator!',
    description: 'Исследуйте жизнь вашего персонажа, принимайте решения и смотрите, как они влияют на его судьбу.',
    image: require('../../../assets/images/tutorial1.png')
  },
  {
    id: '2',
    title: 'Принимайте решения',
    description: 'Выбирайте, как будет развиваться жизнь вашего персонажа. Каждое решение имеет последствия!',
    image: require('../../../assets/images/tutorial2.png')
  },
  {
    id: '3',
    title: 'Развивайте навыки',
    description: 'Повышайте навыки персонажа, чтобы открывать новые возможности и карьерные перспективы.',
    image: require('../../../assets/images/tutorial3.png')
  },
  {
    id: '4',
    title: 'Взаимодействуйте с персонажами',
    description: 'Стройте отношения с другими персонажами, которые могут помочь или помешать вашему успеху.',
    image: require('../../../assets/images/tutorial4.png')
  },
];

const TutorialScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.goBack();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipTutorial = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#283593', '#3949ab']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.skipButton} onPress={skipTutorial}>
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>

          <View style={styles.slideContainer}>
            <Image 
              source={slides[currentSlide].image} 
              style={styles.image} 
              resizeMode="contain"
            />
            <Text style={styles.title}>{slides[currentSlide].title}</Text>
            <Text style={styles.description}>{slides[currentSlide].description}</Text>
          </View>

          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  index === currentSlide && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={[styles.navButton, styles.prevButton, currentSlide === 0 && styles.disabledButton]} 
              onPress={prevSlide}
              disabled={currentSlide === 0}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.nextButton]} 
              onPress={nextSlide}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Готово' : 'Далее'}
              </Text>
              {currentSlide < slides.length - 1 && (
                <MaterialIcons name="arrow-forward" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.5,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  navButton: {
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  prevButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TutorialScreen;
