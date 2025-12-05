// Главный компонент мастера создания персонажа - Sprint 2 Task 5
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { CharacterSeed, DifficultyLevel } from '../../types/game';
import { characterActions } from '../../store/slices/characterSlice';
import { getDifficultyLevel } from '../../constants/index';
import { 
  updatePlayerName,
  updatePlayerStats,
  nextDay,
  startGame,
  togglePause,
  setGameSpeed,
  loadGame,
  resetGame,
} from '../../store/slices/gameSlice';
import CharacterForm from './CharacterForm';
import CitySelector from './CitySelector';
import YearSelector from './YearSelector';
import DifficultySelector from './DifficultySelector';

type CreationStep = 'name' | 'city' | 'year' | 'difficulty' | 'summary';

interface CharacterCreationWizardProps {
  onComplete?: () => void;
}

export const CharacterCreationWizard: React.FC<CharacterCreationWizardProps> = ({
  onComplete
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // State для формы
  const [currentStep, setCurrentStep] = useState<CreationStep>('name');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Данные персонажа
  const [characterData, setCharacterData] = useState<Partial<CharacterSeed>>({
    name: '',
    country: 'azerbaijan',
    yearBase: 1991,
    profession: 'none',
    birthCity: 'baku'
  });

  // Данные сложности
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    getDifficultyLevel('medium')!
  );

  // Определение шагов
  const steps = [
    { id: 'name', title: 'Имя персонажа', subtitle: 'Как вас будут звать в этой жизни?' },
    { id: 'city', title: 'Город рождения', subtitle: 'Где начнется ваша история?' },
    { id: 'year', title: 'Год рождения', subtitle: 'В какую эпоху вы родитесь?' },
    { id: 'difficulty', title: 'Уровень сложности', subtitle: 'Выберите свою судьбу' },
    { id: 'summary', title: 'Подтверждение', subtitle: 'Проверьте данные персонажа' }
  ];

  // Получение текущего индекса шага
  const getCurrentStepIndex = (): number => {
    return steps.findIndex(step => step.id === currentStep);
  };

  // Переход к следующему шагу
  const handleNext = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as CreationStep);
      setError(null);
    }
  }, [currentStep]);

  // Переход к предыдущему шагу
  const handleBack = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as CreationStep);
      setError(null);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  // Обновление данных персонажа
  const updateCharacterData = useCallback((data: Partial<CharacterSeed>) => {
    setCharacterData(prev => ({ ...prev, ...data }));
  }, []);

  // Создание персонажа
  const handleCreateCharacter = useCallback(async () => {
    if (!characterData.name || !characterData.birthCity || !characterData.yearBase) {
      setError('Заполните все обязательные поля');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const characterSeed: CharacterSeed = {
        name: characterData.name.trim(),
        country: 'azerbaijan',
        yearBase: characterData.yearBase,
        profession: 'none',
        birthCity: characterData.birthCity
      };

      console.log('🎮 Создание персонажа:', characterSeed);
      console.log('🎯 Уровень сложности:', selectedDifficulty);

      // Создание персонажа через Redux
      await dispatch(characterActions.createCharacter({ 
        seed: characterSeed, 
        difficulty: selectedDifficulty,
        birthCity: characterData.birthCity
      }));
      
      // Начало игры через Redux
      await dispatch(startGame({ seed: characterSeed, difficulty: selectedDifficulty }));
      
      // Задержка для инициализации Redux
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Переходим к игровому экрану
      navigation.navigate('Game' as never);
      onComplete?.();
    } catch (error) {
      console.error('❌ Ошибка при создании персонажа:', error);
      setError('Ошибка при создании персонажа. Попробуйте еще раз.');
    } finally {
      setIsCreating(false);
    }
  }, [characterData, selectedDifficulty, dispatch, navigation, onComplete]);

  // Проверка возможности перехода вперед
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 'name':
        return characterData.name && characterData.name.trim().length >= 2;
      case 'city':
        return !!characterData.birthCity;
      case 'year':
        return !!characterData.yearBase && characterData.yearBase >= 1918 && characterData.yearBase <= 2024;
      case 'difficulty':
        return !!selectedDifficulty;
      case 'summary':
        return true;
      default:
        return false;
    }
  }, [currentStep, characterData, selectedDifficulty]);

  // Рендеринг текущего шага
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <CharacterForm
            onSubmit={(data) => {
              updateCharacterData(data);
              handleNext();
            }}
            isLoading={isCreating}
            initialData={characterData}
          />
        );

      case 'city':
        return (
          <CitySelector
            selectedCity={characterData.birthCity || 'baku'}
            onCitySelect={(cityId) => {
              updateCharacterData({ birthCity: cityId });
              handleNext();
            }}
            isLoading={isCreating}
          />
        );

      case 'year':
        return (
          <YearSelector
            selectedYear={characterData.yearBase || 1991}
            onYearSelect={(year) => {
              updateCharacterData({ yearBase: year });
              handleNext();
            }}
            isLoading={isCreating}
          />
        );

      case 'difficulty':
        return (
          <DifficultySelector
            selectedDifficulty={selectedDifficulty.id}
            onDifficultySelect={(difficultyId) => {
              const difficulty = {
                easy: { id: 'easy', name: 'Легкий', deathChanceMultiplier: 0.1, historicalDensity: 0.2, startingBonus: { health: 20, happiness: 20, energy: 10, wealth: 2000 } },
                medium: { id: 'medium', name: 'Средний', deathChanceMultiplier: 0.3, historicalDensity: 0.5, startingBonus: { health: 10, happiness: 10, energy: 5, wealth: 1000 } },
                hard: { id: 'hard', name: 'Сложный', deathChanceMultiplier: 0.6, historicalDensity: 0.8, startingBonus: { health: 0, happiness: 0, energy: 0, wealth: 500 } }
              }[difficultyId];
              setSelectedDifficulty(difficulty);
              handleNext();
            }}
            isLoading={isCreating}
          />
        );

      case 'summary':
        return (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ваш персонаж</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Имя:</Text>
              <Text style={styles.summaryValue}>{characterData.name}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Город:</Text>
              <Text style={styles.summaryValue}>{characterData.birthCity}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Год рождения:</Text>
              <Text style={styles.summaryValue}>{characterData.yearBase}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Возраст:</Text>
              <Text style={styles.summaryValue}>{2024 - (characterData.yearBase || 1991)} лет</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Сложность:</Text>
              <Text style={styles.summaryValue}>{selectedDifficulty.name}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                isCreating && styles.createButtonDisabled
              ]}
              onPress={handleCreateCharacter}
              disabled={isCreating}
            >
              <Text style={styles.createButtonText}>
                {isCreating ? 'Создание...' : 'Создать персонажа и начать игру'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          disabled={isCreating}
        >
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressDot,
                getCurrentStepIndex() >= index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => setError(null)}
          >
            <Text style={styles.retryButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step Header */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>
          {steps[getCurrentStepIndex()].title}
        </Text>
        <Text style={styles.stepSubtitle}>
          {steps[getCurrentStepIndex()].subtitle}
        </Text>
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      {/* Navigation для некоторых шагов */}
      {currentStep !== 'name' && currentStep !== 'city' && currentStep !== 'year' && currentStep !== 'difficulty' && (
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, styles.backNavButton]}
            onPress={handleBack}
            disabled={isCreating}
          >
            <Text style={styles.backNavText}>Назад</Text>
          </TouchableOpacity>

          {currentStep !== 'summary' && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextNavButton,
                !canProceed() && styles.navButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!canProceed() || isCreating}
            >
              <Text style={styles.nextNavText}>Далее</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  placeholder: {
    width: 40,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backNavButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextNavButton: {
    backgroundColor: '#3b82f6',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
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

export default CharacterCreationWizard;
