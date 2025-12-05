// Упрощенная версия CharacterCreationScreen для отладки
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { CharacterSeed } from '../types/game';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';

const DIFFICULTY_LEVELS = [
  {
    id: 'easy' as const,
    name: 'Легкий',
    description: 'Отдыхайте и наслаждайтесь жизнью без лишних рисков',
    deathChanceMultiplier: 0.1,
    historicalDensity: 0.2,
    startingBonus: { health: 20, happiness: 20, energy: 10, wealth: 2000 },
  },
  {
    id: 'medium' as const,
    name: 'Средний',
    description: 'Сбалансированная игра с вызовами и возможностями',
    deathChanceMultiplier: 0.3,
    historicalDensity: 0.5,
    startingBonus: { health: 10, happiness: 10, energy: 5, wealth: 1000 },
  },
  {
    id: 'hard' as const,
    name: 'Сложный',
    description: 'Только для самых стойких - каждый выбор имеет значение',
    deathChanceMultiplier: 0.6,
    historicalDensity: 0.8,
    startingBonus: { health: 0, happiness: 0, energy: 0, wealth: 500 },
  },
];

const SIMPLE_COUNTRIES = [
  { id: 'usa', name: 'США', flag: '🇺🇸' },
  { id: 'russia', name: 'Россия', flag: '🇷🇺' },
  { id: 'japan', name: 'Япония', flag: '🇯🇵' },
  { id: 'germany', name: 'Германия', flag: '🇩🇪' },
  { id: 'france', name: 'Франция', flag: '🇫🇷' },
  { id: 'uk', name: 'Великобритания', flag: '🇬🇧' },
];

const YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const CharacterCreationScreenSimple: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [characterName, setCharacterName] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_LEVELS[1]);
  const [selectedCountry, setSelectedCountry] = useState(SIMPLE_COUNTRIES[0].id);
  const [selectedYear, setSelectedYear] = useState(2000);

  const steps = [
    { id: 1, title: 'Имя персонажа', subtitle: 'Как вас будут звать в этой жизни?' },
    { id: 2, title: 'Уровень сложности', subtitle: 'Выберите свою судьбу' },
    { id: 3, title: 'Место рождения', subtitle: 'Где начнется ваша история?' },
    { id: 4, title: 'Год рождения', subtitle: 'В какую эпоху вы родитесь?' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartGame();
    }
  };

  const handleStartGame = async () => {
    if (characterName.trim().length < 2) {
      alert('Введите имя персонажа (минимум 2 символа)');
      return;
    }

    const characterSeed: CharacterSeed = {
      name: characterName.trim(),
      country: selectedCountry,
      yearBase: selectedYear,
      profession: 'none',
    };

    console.log('🎮 Создание персонажа:', characterSeed);
    console.log('🎯 Уровень сложности:', selectedDifficulty);
    
    try {
      // Создание персонажа через Redux
      await dispatch(characterActions.createCharacter({ seed: characterSeed, difficulty: selectedDifficulty }));
      
      // Начало игры через Redux
      await dispatch(gameActions.startGame({ seed: characterSeed, difficulty: selectedDifficulty }));
      
      // Небольшая задержка для инициализации Redux
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Переходим к игровому экрану
      navigation.navigate('Game' as never);
    } catch (error) {
      console.error('❌ Ошибка при создании персонажа:', error);
      alert('Ошибка при создании персонажа. Попробуйте еще раз.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return characterName.trim().length >= 2;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Введите имя персонажа</Text>
            <Text style={styles.helperText}>
              Это имя будет сопровождать вас на протяжении всей жизни
            </Text>
            <TextInput
              style={styles.nameInput}
              value={characterName}
              onChangeText={setCharacterName}
              placeholder="Введите имя..."
              placeholderTextColor="#64748b"
              maxLength={20}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Выберите уровень сложности</Text>
            {DIFFICULTY_LEVELS.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.optionCard,
                  selectedDifficulty.id === difficulty.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.optionName}>{difficulty.name}</Text>
                  <Text style={styles.radioButton}>
                    {selectedDifficulty.id === difficulty.id ? '●' : '○'}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{difficulty.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Выберите страну рождения</Text>
            {SIMPLE_COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={[
                  styles.optionCard,
                  selectedCountry === country.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedCountry(country.id)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.optionName}>{country.flag} {country.name}</Text>
                  <Text style={styles.radioButton}>
                    {selectedCountry === country.id ? '●' : '○'}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>
                  Исторические события этой страны повлияют на вашу жизнь
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Выберите decade рождения</Text>
            <Text style={styles.helperText}>
              От этого зависят исторические события и условия жизни
            </Text>
            <ScrollView style={styles.yearsContainer}>
              {YEARS.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearCard,
                    selectedYear === year && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.optionName}>{year}-е годы</Text>
                    <Text style={styles.radioButton}>
                      {selectedYear === year ? '●' : '○'}
                    </Text>
                  </View>
                  <Text style={styles.optionDescription}>
                    {year === 1950 && 'Послевоенное восстановление и начало холодной войны'}
                    {year === 1960 && 'Космическая гонка и культурная революция'}
                    {year === 1970 && 'Энергетический кризис и расцвет рок-музыки'}
                    {year === 1980 && 'Эпоха персональных компьютеров и новой волны'}
                    {year === 1990 && 'Падение железного занавеса и рождение интернета'}
                    {year === 2000 && 'Начало 21 века и цифровая революция'}
                    {year === 2010 && 'Социальные сети и мобильная эра'}
                    {year === 2020 && 'Пандемия и новая реальность'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {steps.map((step) => (
              <View
                key={step.id}
                style={[
                  styles.progressDot,
                  currentStep >= step.id && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Step Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{steps[currentStep - 1].title}</Text>
            <Text style={styles.stepSubtitle}>{steps[currentStep - 1].subtitle}</Text>
          </View>

          {renderStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, styles.backNavButton]}
            onPress={handleBack}
          >
            <Text style={styles.backNavText}>Назад</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextNavButton,
              !canProceed() && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextNavText}>
              {currentStep === 4 ? 'Начать игру' : 'Далее'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  stepContainer: {
    gap: 16,
  },
  helperText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  radioButton: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  yearsContainer: {
    maxHeight: 300,
  },
  yearCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backNavButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextNavButton: {
    backgroundColor: '#3b82f6',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backNavText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextNavText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CharacterCreationScreenSimple;
