import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const locations = [
  {
    id: 'usa',
    name: 'США',
    description: 'Классическая американская мечта с возможностями в технологиях и бизнесе',
    icon: '🇺🇸',
    difficulty: 'Средний',
    bonuses: { wealth: 1000, happiness: 5 },
  },
  {
    id: 'japan',
    name: 'Япония',
    description: 'Высокотехнологичная страна с фокусом на образовании и карьере',
    icon: '🇯🇵',
    difficulty: 'Сложный',
    bonuses: { energy: 10, skills: 5 },
  },
  {
    id: 'europe',
    name: 'Европа',
    description: 'Сбалансированный образ жизни с хорошей социальной поддержкой',
    icon: '🇪🇺',
    difficulty: 'Легкий',
    bonuses: { health: 10, happiness: 10 },
  },
  {
    id: 'russia',
    name: 'Россия',
    description: 'Вызовы и возможности в развивающейся экономике',
    icon: '🇷🇺',
    difficulty: 'Сложный',
    bonuses: { energy: 15, wealth: 500 },
  },
];

const LocationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleLocationSelect = (location: typeof locations[0]) => {
    // Сохраняем выбранную локацию в контекст
    console.log('Выбрана локация:', location.name);
    
    // Переходим к выбору уровня
    navigation.navigate('LevelSelection' as never, { location } as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Выбор локации</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Выберите страну, в которой начнется ваша история
        </Text>

        {/* Locations List */}
        <ScrollView style={styles.locationsContainer} showsVerticalScrollIndicator={false}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationCard}
              onPress={() => handleLocationSelect(location)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1e293b', '#334155']}
                style={styles.cardGradient}
              >
                <View style={styles.locationHeader}>
                  <Text style={styles.locationIcon}>{location.icon}</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.difficulty}>Сложность: {location.difficulty}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#64748b" />
                </View>
                
                <Text style={styles.locationDescription}>
                  {location.description}
                </Text>
                
                <View style={styles.bonusesContainer}>
                  <Text style={styles.bonusesTitle}>Бонусы:</Text>
                  {Object.entries(location.bonuses).map(([stat, value]) => (
                    <View key={stat} style={styles.bonusItem}>
                      <Text style={styles.bonusText}>
                        {stat === 'wealth' ? '💰' : stat === 'health' ? '❤️' : stat === 'happiness' ? '😊' : '⚡'} +{value}
                      </Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  locationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 14,
    color: '#94a3b8',
  },
  locationDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 16,
  },
  bonusesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bonusesTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 8,
  },
  bonusItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bonusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
});

export default LocationScreen;
