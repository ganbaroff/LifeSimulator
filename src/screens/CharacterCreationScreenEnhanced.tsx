// 🎨 Enhanced Character Creation Screen - Design System
// Создано: Developer (Agile Team)
// Версия: 1.0.0

import React, { useState } from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { CharacterSeed } from '../types/game';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';
import { Button, Card, StatsBar, Theme, Typography } from '../components/ui';
import { CITIES } from '../data/azerbaijanData';

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
    description: 'Баланс вызовов и возможностей для интересной игры',
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

const YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const CharacterCreationScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [characterName, setCharacterName] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_LEVELS[1]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]?.id || 'baku');
  const [selectedYear, setSelectedYear] = useState(2000);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCharacter = async () => {
    if (!characterName.trim()) {
      alert('Пожалуйста, введите имя персонажа');
      return;
    }

    setIsLoading(true);
    
    try {
      const characterSeed: CharacterSeed = {
        name: characterName.trim(),
        country: 'azerbaijan',
        profession: 'none',
        birthCity: selectedCity,
      };

      await dispatch(characterActions.createCharacter({ 
        seed: characterSeed, 
        difficulty: selectedDifficulty.id,
        birthCity: selectedCity
      }));
      
      await dispatch(gameActions.startGame({ seed: characterSeed, difficulty: selectedDifficulty.id }));
      
      navigation.navigate('Game' as never);
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Ошибка при создании персонажа');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card title="Шаг 1: Имя персонажа">
            <TextInput
              style={{
                backgroundColor: Theme.Colors.background.card,
                borderRadius: Theme.BorderRadius.md,
                borderWidth: 1,
                borderColor: Theme.Colors.border.primary,
                padding: Theme.Spacing.md,
                color: Theme.Colors.text.primary,
                fontSize: Typography.body.fontSize,
                marginBottom: Theme.Spacing.lg,
              }}
              placeholder="Введите имя персонажа"
              placeholderTextColor={Theme.Colors.text.muted}
              value={characterName}
              onChangeText={setCharacterName}
              maxLength={30}
            />
            
            <Button
              title="Далее"
              onPress={() => setCurrentStep(2)}
              disabled={!characterName.trim()}
            />
          </Card>
        );

      case 2:
        return (
          <Card title="Шаг 2: Уровень сложности">
            {DIFFICULTY_LEVELS.map((difficulty) => (
              <Button
                key={difficulty.id}
                title={difficulty.name}
                onPress={() => setSelectedDifficulty(difficulty)}
                variant={selectedDifficulty.id === difficulty.id ? 'primary' : 'secondary'}
                style={{ marginBottom: Theme.Spacing.sm }}
              />
            ))}
            
            <View style={{ marginTop: Theme.Spacing.lg }}>
              <Text style={[Typography.body, { marginBottom: Theme.Spacing.md }]}>
                {selectedDifficulty.description}
              </Text>
              
              <StatsBar
                health={selectedDifficulty.startingBonus.health}
                happiness={selectedDifficulty.startingBonus.happiness}
                energy={selectedDifficulty.startingBonus.energy}
                wealth={selectedDifficulty.startingBonus.wealth}
              />
            </View>
            
            <View style={{ flexDirection: 'row', marginTop: Theme.Spacing.lg, gap: Theme.Spacing.sm }}>
              <Button
                title="Назад"
                onPress={() => setCurrentStep(1)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title="Далее"
                onPress={() => setCurrentStep(3)}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        );

      case 3:
        return (
          <Card title="Шаг 3: Город рождения">
            <ScrollView style={{ maxHeight: 300 }}>
              {CITIES.map((city) => (
                <Button
                  key={city.id}
                  title={`🇦🇿 ${city.name}`}
                  onPress={() => setSelectedCity(city.id)}
                  variant={selectedCity === city.id ? 'primary' : 'secondary'}
                  style={{ marginBottom: Theme.Spacing.sm }}
                />
              ))}
            </ScrollView>
            
            {selectedCity && (
              <View style={{ marginTop: Theme.Spacing.lg }}>
                <Text style={[Typography.body, { marginBottom: Theme.Spacing.sm }]}>
                  {CITIES.find(c => c.id === selectedCity)?.description}
                </Text>
                
                <StatsBar
                  health={CITIES.find(c => c.id === selectedCity)?.bonuses.health || 0}
                  happiness={CITIES.find(c => c.id === selectedCity)?.bonuses.happiness || 0}
                  energy={CITIES.find(c => c.id === selectedCity)?.bonuses.energy || 0}
                  wealth={CITIES.find(c => c.id === selectedCity)?.bonuses.wealth || 0}
                />
              </View>
            )}
            
            <View style={{ flexDirection: 'row', marginTop: Theme.Spacing.lg, gap: Theme.Spacing.sm }}>
              <Button
                title="Назад"
                onPress={() => setCurrentStep(2)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title="Далее"
                onPress={() => setCurrentStep(4)}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        );

      case 4:
        return (
          <Card title="Шаг 4: Год рождения">
            <ScrollView style={{ maxHeight: 200 }}>
              {YEARS.map((year) => (
                <Button
                  key={year}
                  title={`${year} год`}
                  onPress={() => setSelectedYear(year)}
                  variant={selectedYear === year ? 'primary' : 'secondary'}
                  style={{ marginBottom: Theme.Spacing.sm }}
                />
              ))}
            </ScrollView>
            
            <View style={{ flexDirection: 'row', marginTop: Theme.Spacing.lg, gap: Theme.Spacing.sm }}>
              <Button
                title="Назад"
                onPress={() => setCurrentStep(3)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title="Создать персонажа"
                onPress={handleCreateCharacter}
                loading={isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[Theme.containers.screen, { padding: Theme.Spacing.lg }]}>
      <Text style={[Typography.header, { textAlign: 'center', marginBottom: Theme.Spacing.xl }]}>
        Создание персонажа
      </Text>
      
      <Text style={[Typography.body, { textAlign: 'center', marginBottom: Theme.Spacing.lg }]}>
        Шаг {currentStep} из 4
      </Text>
      
      {renderStep()}
    </View>
  );
};

export default CharacterCreationScreenEnhanced;
