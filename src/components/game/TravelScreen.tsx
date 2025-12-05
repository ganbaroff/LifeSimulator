// Экран путешествий - Sprint 3 Task 5
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { characterActions } from '../../store/slices/characterSlice';
import { gameActions } from '../../store/slices/gameSlice';
import { CITIES } from '../../data/azerbaijanData';

interface TravelScreenProps {}

const TravelScreen: React.FC<TravelScreenProps> = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character.current);
  const game = useSelector((state: RootState) => state.game);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Персонаж не найден</Text>
      </View>
    );
  }

  const currentCity = character.birthCity || 'baku';
  const currentCityData = CITIES.find(city => city.id === currentCity);
  const selectedCityData = selectedCity ? CITIES.find(city => city.id === selectedCity) : null;

  // Расчет стоимости переезда
  const calculateTravelCost = (fromCity: string, toCity: string): number => {
    const fromData = CITIES.find(city => city.id === fromCity);
    const toData = CITIES.find(city => city.id === toCity);
    
    if (!fromData || !toData) return 0;
    
    // Базовая стоимость + расстояние
    const baseCost = 50;
    const distanceMultiplier = Math.abs(fromData.population - toData.population) / 100000;
    return Math.round(baseCost + (baseCost * distanceMultiplier));
  };

  // Обработка переезда
  const handleTravel = useCallback(async () => {
    if (!selectedCity || selectedCity === currentCity || !character) return;

    const travelCost = calculateTravelCost(currentCity, selectedCity);
    
    if (character.stats.wealth < travelCost) {
      Alert.alert('Недостаточно средств', `Для переезда нужно ${travelCost} манат`);
      return;
    }

    setIsTraveling(true);

    try {
      console.log(`🚗 Переезд из ${currentCity} в ${selectedCity} за ${travelCost} манат`);

      // Вычитаем стоимость переезда
      await dispatch(characterActions.updateStats({ wealth: -travelCost }));

      // Обновляем город рождения (в данном случае - текущий город)
      await dispatch(characterActions.updateCharacter({ birthCity: selectedCity }));

      // Добавляем событие в историю
      const travelEvent = {
        id: `travel_${Date.now()}`,
        source: 'fallback' as const,
        situation: `Вы переехали из ${currentCityData?.name} в ${selectedCityData?.name}`,
        A: 'Осмотреться в новом городе',
        B: 'Найти жилье',
        C: 'Искать работу',
        effects: {
          A: { energy: -10, happiness: 10 },
          B: { wealth: -20, energy: -5 },
          C: { wealth: 30, energy: -15 }
        },
      };

      await dispatch(characterActions.addToHistory({
        event: travelEvent,
        choice: 'A',
        effects: { energy: -10, happiness: 10 },
        timestamp: Date.now(),
      }));

      Alert.alert(
        'Переезд выполнен!',
        `Вы успешно переехали в ${selectedCityData?.name}. Потрачено: ${travelCost} манат.`,
        [{ text: 'OK' }]
      );

      setSelectedCity(null);
      
    } catch (error) {
      console.error('❌ Ошибка при переезде:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить переезд');
    } finally {
      setIsTraveling(false);
    }
  }, [selectedCity, currentCity, character, currentCityData, selectedCityData, dispatch]);

  // Получение доступных городов (кроме текущего)
  const availableCities = CITIES.filter(city => city.id !== currentCity);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Путешествия</Text>
          <Text style={styles.subtitle}>Переезжайте между городами Азербайджана</Text>
        </View>

        {/* Текущий город */}
        <View style={styles.currentCityContainer}>
          <Text style={styles.currentCityTitle}>Ваше местоположение</Text>
          {currentCityData && (
            <View style={styles.currentCityCard}>
              <View style={styles.currentCityHeader}>
                <Text style={styles.currentCityName}>🇦🇿 {currentCityData.name}</Text>
                <Text style={styles.currentCityBadge}>Текущий город</Text>
              </View>
              <Text style={styles.currentCityDescription}>{currentCityData.description}</Text>
              <View style={styles.currentCityStats}>
                <Text style={styles.currentCityStat}>Население: {currentCityData.population.toLocaleString()}</Text>
                <Text style={styles.currentCityStat}>Регион: {currentCityData.region}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Баланс */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Ваш баланс</Text>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceAmount}>{character.stats.wealth} манат</Text>
            <Text style={styles.balanceDescription}>Доступно для путешествий</Text>
          </View>
        </View>

        {/* Выбор города */}
        <View style={styles.citiesContainer}>
          <Text style={styles.citiesTitle}>Выберите город для переезда</Text>
          
          {availableCities.map((city) => {
            const travelCost = calculateTravelCost(currentCity, city.id);
            const canAfford = character.stats.wealth >= travelCost;
            const isSelected = selectedCity === city.id;

            return (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.cityCard,
                  isSelected && styles.selectedCityCard,
                  !canAfford && styles.disabledCityCard
                ]}
                onPress={() => canAfford && setSelectedCity(city.id)}
                disabled={!canAfford}
              >
                <View style={styles.cityHeader}>
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>🇦🇿 {city.name}</Text>
                    <Text style={styles.cityRegion}>{city.region}</Text>
                  </View>
                  <View style={styles.cityCost}>
                    <Text style={[
                      styles.costText,
                      !canAfford && styles.costTextDisabled
                    ]}>
                      💰 {travelCost}
                    </Text>
                    <Text style={styles.costLabel}>манат</Text>
                  </View>
                </View>

                <Text style={styles.cityDescription}>{city.description}</Text>

                <View style={styles.cityBonuses}>
                  <Text style={styles.bonusTitle}>Бонусы города:</Text>
                  <View style={styles.bonusRow}>
                    <Text style={styles.bonusText}>❤️ +{city.bonuses.health}</Text>
                    <Text style={styles.bonusText}>😊 +{city.bonuses.happiness}</Text>
                    <Text style={styles.bonusText}>⚡ +{city.bonuses.energy}</Text>
                    <Text style={styles.bonusText}>💰 +{city.bonuses.wealth}</Text>
                  </View>
                </View>

                {!canAfford && (
                  <View style={styles.insufficientFunds}>
                    <Text style={styles.insufficientText}>Недостаточно средств</Text>
                  </View>
                )}

                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>Выбрано</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Кнопка переезда */}
      {selectedCity && selectedCity !== currentCity && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.travelButton, isTraveling && styles.travelButtonDisabled]}
            onPress={handleTravel}
            disabled={isTraveling}
          >
            <Text style={styles.travelButtonText}>
              {isTraveling ? 'Переезд...' : `Переехать за ${calculateTravelCost(currentCity, selectedCity)} манат`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  currentCityContainer: {
    padding: 20,
  },
  currentCityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  currentCityCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  currentCityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentCityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  currentCityBadge: {
    fontSize: 12,
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentCityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  currentCityStats: {
    gap: 4,
  },
  currentCityStat: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  balanceCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  balanceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  citiesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  citiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  cityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCityCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  disabledCityCard: {
    opacity: 0.5,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cityRegion: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cityCost: {
    alignItems: 'flex-end',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  costTextDisabled: {
    color: '#ef4444',
  },
  costLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  cityBonuses: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  bonusTitle: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 6,
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bonusText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  insufficientFunds: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  insufficientText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  travelButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  travelButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  travelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default TravelScreen;
