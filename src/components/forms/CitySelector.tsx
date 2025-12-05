// Компонент выбора города - Sprint 2 Task 2
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CITIES } from '../../data/azerbaijanData';

interface CitySelectorProps {
  selectedCity: string;
  onCitySelect: (cityId: string) => void;
  isLoading?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onCitySelect,
  isLoading = false
}) => {
  const handleCitySelect = useCallback((cityId: string) => {
    if (!isLoading) {
      onCitySelect(cityId);
    }
  }, [isLoading, onCitySelect]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите город рождения</Text>
      <Text style={styles.subtitle}>
        Город влияет на стартовые бонусы и доступные события
      </Text>

      <ScrollView 
        style={styles.citiesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.citiesListContent}
      >
        {CITIES.map((city) => (
          <TouchableOpacity
            key={city.id}
            style={[
              styles.cityCard,
              selectedCity === city.id && styles.selectedCityCard,
              isLoading && styles.disabledCard
            ]}
            onPress={() => handleCitySelect(city.id)}
            disabled={isLoading}
          >
            <View style={styles.cityHeader}>
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>🇦🇿 {city.name}</Text>
                <Text style={styles.cityRegion}>{city.region}</Text>
              </View>
              <View style={styles.radioButton}>
                <Text style={[
                  styles.radioText,
                  selectedCity === city.id && styles.radioTextSelected
                ]}>
                  {selectedCity === city.id ? '●' : '○'}
                </Text>
              </View>
            </View>

            <Text style={styles.cityDescription}>{city.description}</Text>

            <View style={styles.bonusContainer}>
              <Text style={styles.bonusTitle}>Стартовые бонусы:</Text>
              <View style={styles.bonusRow}>
                <Text style={styles.bonusText}>
                  ❤️ {city.bonuses.health}
                </Text>
                <Text style={styles.bonusText}>
                  😊 {city.bonuses.happiness}
                </Text>
                <Text style={styles.bonusText}>
                  ⚡ {city.bonuses.energy}
                </Text>
                <Text style={styles.bonusText}>
                  💰 {city.bonuses.wealth}
                </Text>
              </View>
            </View>

            <View style={styles.populationContainer}>
              <Text style={styles.populationText}>
                Население: {city.population.toLocaleString()} человек
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  citiesList: {
    flex: 1,
  },
  citiesListContent: {
    gap: 12,
  },
  cityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCityCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  disabledCard: {
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
  radioButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
  },
  radioTextSelected: {
    color: '#3b82f6',
  },
  cityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  bonusContainer: {
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
  populationContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  populationText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default CitySelector;
