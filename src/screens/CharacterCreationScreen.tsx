import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { CharacterSeed } from '../types/game';
import { createCharacter, updateCharacterName } from '../store/unified/slices/characterSlice';
import { startNewGame, setGameCharacter } from '../store/unified/slices/gameSlice';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { useSoundEffects } from '../utils/soundEffects';
import { COUNTRIES_DATA } from '../data/countries';

const DIFFICULTY_LEVELS = [
  {
    id: 'easy' as const,
    name: 'Легкий',
    description: 'Отдыхайте и наслаждайтесь жизнью без лишних рисков',
    deathChanceMultiplier: 0.1, // Очень низкий шанс смерти
    historicalDensity: 0.2, // Меньше исторических событий
    startingBonus: { health: 20, happiness: 20, energy: 10, wealth: 2000 },
  },
  {
    id: 'medium' as const,
    name: 'Средний',
    description: 'Баланс вызовов и возможностей для интересной игры',
    deathChanceMultiplier: 0.3, // Умеренный шанс смерти
    historicalDensity: 0.5, // Стандартное количество событий
    startingBonus: { health: 10, happiness: 10, energy: 5, wealth: 1000 },
  },
  {
    id: 'hard' as const,
    name: 'Сложный',
    description: 'Только для самых стойких - каждый выбор имеет значение',
    deathChanceMultiplier: 0.6, // Высокий шанс смерти
    historicalDensity: 0.8, // Больше исторических событий
    startingBonus: { health: 0, happiness: 0, energy: 0, wealth: 500 },
  },
];

const YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const CharacterCreationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { playButton, playChoice } = useSoundEffects();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [characterName, setCharacterName] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_LEVELS[1]);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES_DATA[0]?.id || 'usa');
  const [selectedYear, setSelectedYear] = useState(2000);

  const steps = [
    { id: 1, title: 'Имя персонажа', subtitle: 'Как вас будут звать в этой жизни?' },
    { id: 2, title: 'Уровень сложности', subtitle: 'Выберите свою судьбу' },
    { id: 3, title: 'Место рождения', subtitle: 'Где начнется ваша история?' },
    { id: 4, title: 'Год рождения', subtitle: 'В какую эпоху вы родитесь?' },
  ];

  const handleNext = () => {
    playButton();
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
      // Создание персонажа через unified Redux
      const characterInfo = {
        id: `character_${Date.now()}`,
        name: characterSeed.name,
        age: 0,
        birthYear: characterSeed.yearBase,
        birthCity: 'Baku', // Will be updated later
        gender: 'male' as const, // Will be updated later
      };
      
      try {
        // Dispatch character creation
        const characterResult = await (dispatch as any)(createCharacter(characterInfo));
        
        // Начало игры через unified Redux
        const difficultyLevel = selectedDifficulty.id as 'easy' | 'normal' | 'hard' | 'extreme';
        const gameResult = await (dispatch as any)(startNewGame(difficultyLevel));
        
        // Extract results safely
        const characterPayload = characterResult.payload;
        const gamePayload = gameResult.payload;
        
        // Link character to game
        if (characterPayload && gamePayload) {
          dispatch(setGameCharacter(characterPayload));
        }
      } catch (error) {
        console.error('Redux dispatch error:', error);
        throw error;
      }
      
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
            <TextInput
              style={styles.nameInput}
              value={characterName}
              onChangeText={setCharacterName}
              placeholder="Например: Александр Иванов"
              placeholderTextColor="#64748b"
              maxLength={30}
            />
            <Text style={styles.helperText}>
              Имя будет отображаться в игре и сохранениях
            </Text>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Выберите уровень сложности</Text>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.optionCard,
                  selectedDifficulty.id === level.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedDifficulty(level)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.optionName}>{level.name}</Text>
                  <Text style={styles.radioButton}>
                    {selectedDifficulty.id === level.id ? '●' : '○'}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{level.description}</Text>
                <View style={styles.statsContainer}>
                  <Text style={styles.statText}>Шанс смерти: {level.deathChanceMultiplier}x</Text>
                  <Text style={styles.statText}>Исторические события: {(level.historicalDensity * 100).toFixed(0)}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Выберите страну рождения</Text>
            <ScrollView style={styles.countriesContainer}>
              {COUNTRIES_DATA.map((country) => (
                <TouchableOpacity
                  key={country.id}
                  style={[
                    styles.countryCard,
                    selectedCountry === country.id && styles.selectedCard,
                  ]}
                  onPress={() => {
                    setSelectedCountry(country.id);
                    playChoice();
                  }}
                >
                  <View style={styles.countryContent}>
                    <View style={styles.countryHeader}>
                      <Text style={styles.countryFlag}>{country.flag}</Text>
                      <Text style={styles.countryName}>{country.name}</Text>
                      <Text style={styles.radioButton}>
                        {selectedCountry === country.id ? '●' : '○'}
                      </Text>
                    </View>
                    <Text style={styles.countryDescription}>{country.description}</Text>
                    <View style={styles.bonusContainer}>
                      <Text style={styles.bonusTitle}>Бонусы:</Text>
                      <View style={styles.bonusRow}>
                        <Text style={styles.bonusText}>❤️ +{country.bonuses.health}</Text>
                        <Text style={styles.bonusText}>😊 +{country.bonuses.happiness}</Text>
                        <Text style={styles.bonusText}>💰 +{country.bonuses.wealth}</Text>
                        <Text style={styles.bonusText}>⚡ +{country.bonuses.energy}</Text>
                      </View>
                    </View>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>
                        {country.difficulty === 'easy' && '😊 Легко'}
                        {country.difficulty === 'medium' && '🎯 Средне'}
                        {country.difficulty === 'hard' && '🔥 Сложно'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                    {year === 1950 && 'Послевоенное восстановление, бэби-бум'}
                    {year === 1960 && 'Холодная война, космическая гонка'}
                    {year === 1970 && 'Нефтяной кризис, культурная революция'}
                    {year === 1980 && 'Рейганомика, цифровая эра'}
                    {year === 1990 && 'Падение Берлинской стены, интернет'}
                    {year === 2000 && 'Война с террором, глобализация'}
                    {year === 2010 && 'Смартфоны, социальные сети'}
                    {year === 2020 && 'COVID, удаленная работа'}
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
    <AnimatedScreen animationType="slideIn" duration={600}>
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
                  step.id <= currentStep && styles.activeDot,
                ]}
              />
            ))}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Step Info */}
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>
            {steps.find((s) => s.id === currentStep)?.title}
          </Text>
          <Text style={styles.stepSubtitle}>
            {steps.find((s) => s.id === currentStep)?.subtitle}
          </Text>
        </View>

        {/* Step Content */}
        <ScrollView style={styles.content}>
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
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#10b981',
  },
  stepInfo: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  nameInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
  },
  optionCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#064e3b',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  radioButton: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#10b981',
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
  countriesContainer: {
    maxHeight: 350,
  },
  countryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryContent: {
    gap: 12,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryFlag: {
    fontSize: 32,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  countryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  bonusContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 8,
  },
  bonusTitle: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bonusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  difficultyText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
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
    backgroundColor: '#10b981',
  },
  disabledButton: {
    backgroundColor: '#334155',
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

export default CharacterCreationScreen;
