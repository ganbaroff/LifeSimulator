// Игровой экран для Азербайджанской версии с историческими событиями
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';
import { AzerbaijanEventGenerator } from '../utils/azerbaijanEventGenerator';
import { CITIES, getCityById } from '../data/azerbaijanData';

const GameScreenAzerbaijan: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Redux selectors
  const character = useAppSelector(state => state.character.current);
  const currentEvent = useAppSelector(state => state.game.currentEvent);
  const isGameActive = useAppSelector(state => state.game.isGameActive);
  const isGameOver = useAppSelector(state => state.game.isGameOver);
  const isLoading = useAppSelector(state => state.game.isLoading);

  // Локальное состояние
  const [activeTab, setActiveTab] = useState<'game' | 'stats' | 'history' | 'travel'>('game');
  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [currentCity, setCurrentCity] = useState<string>('baku');
  const [currentYear, setCurrentYear] = useState<number>(1991);
  const [eventGenerator] = useState(() => AzerbaijanEventGenerator.getInstance());

  // Инициализация игры
  useEffect(() => {
    if (!character && isGameActive) {
      console.log('❌ Нет персонажа при активной игре');
      navigation.navigate('Start' as never);
      return;
    }

    if (character && isGameActive && !currentEvent && !isLoading && !isGameOver) {
      // Устанавливаем начальный город и год
      const birthCity = character.birthCity || 'baku';
      const birthYear = character.yearBase || 1991;
      const age = character.age || 18;
      
      setCurrentCity(birthCity);
      setCurrentYear(birthYear + age);
      
      console.log('🇦🇿 Загрузка первого события для Азербайджана');
      loadHistoricalEvent();
    }
  }, [character, isGameActive, currentEvent, isLoading, isGameOver, navigation]);

  // Загрузка исторического события
  const loadHistoricalEvent = useCallback(() => {
    if (!character || isGameOver) return;

    try {
      const location = {
        currentCity,
        birthCity: character.birthCity || 'baku',
        age: character.age || 18,
        year: currentYear
      };

      const event = eventGenerator.generateEvent(location);
      
      if (event) {
        dispatch(gameActions.setCurrentEvent(event));
        console.log('✅ Историческое событие загружено:', event.situation.substring(0, 50) + '...');
        setError(null);
      } else {
        // Если нет событий, генерируем бытовое
        loadLifeEvent();
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки события:', err);
      setError('Tarixi hadisə yüklənmədi');
      loadLifeEvent();
    }
  }, [character, currentCity, currentYear, eventGenerator, dispatch, isGameOver]);

  // Загрузка бытового события
  const loadLifeEvent = useCallback(() => {
    if (!character || isGameOver) return;

    try {
      const location = {
        currentCity,
        birthCity: character.birthCity || 'baku',
        age: character.age || 18,
        year: currentYear
      };

      const event = eventGenerator.generateEvent(location);
      
      if (event) {
        dispatch(gameActions.setCurrentEvent(event));
        console.log('✅ Həyat hadisəsi yükləndi');
        setError(null);
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки бытового события:', err);
      setError('Hadisə yüklənmədi');
    }
  }, [character, currentCity, currentYear, eventGenerator, dispatch, isGameOver]);

  // Обработка выбора
  const handleChoice = useCallback(async (choice: 'A' | 'B' | 'C') => {
    if (!currentEvent || !character || isProcessingChoice || isGameOver) {
      console.log('❌ Невозможно обработать выбор:', { 
        hasEvent: !!currentEvent, 
        hasCharacter: !!character, 
        isProcessing: isProcessingChoice,
        isGameOver 
      });
      return;
    }

    setIsProcessingChoice(true);
    setError(null);

    try {
      console.log('🎯 Выбор сделан:', choice);
      
      // Применяем эффекты
      const effects = currentEvent.effects[choice];
      dispatch(characterActions.updateStats(effects));

      // Добавляем в историю
      dispatch(characterActions.addToHistory({
        event: currentEvent,
        choice,
      }));

      // Увеличиваем счетчик событий
      const newEventCount = eventCount + 1;
      setEventCount(newEventCount);

      // Увеличиваем год каждые 3 события
      let newYear = currentYear;
      if (newEventCount % 3 === 0) {
        newYear = currentYear + 1;
        setCurrentYear(newYear);
        console.log(`📅 Год изменен на ${newYear}`);
      }

      // Увеличиваем возраст каждые 5 событий
      if (newEventCount % 5 === 0) {
        const newAge = character.age + 1;
        dispatch(characterActions.ageUp({ years: 1 }));
        Alert.alert('🎂 Ad günü!', `Təbrik edirik! Siz ${newAge} yaşa doldunuz!`);
      }

      // Проверяем особые условия
      await checkSpecialConditions(effects, newEventCount);

      // Загружаем следующее событие
      setTimeout(() => {
        if (!isGameOver) {
          loadHistoricalEvent();
        }
        setIsProcessingChoice(false);
      }, 1500);

    } catch (error) {
      console.error('❌ Ошибка обработки выбора:', error);
      setError('Seçim emil edilə bilmədi');
      setIsProcessingChoice(false);
      
      // Восстанавливаем загрузку события
      setTimeout(() => {
        loadHistoricalEvent();
      }, 2000);
    }
  }, [currentEvent, character, isProcessingChoice, isGameOver, eventCount, currentYear, dispatch, loadHistoricalEvent]);

  // Проверка особых условий
  const checkSpecialConditions = useCallback(async (effects: any, currentEventCount: number) => {
    if (!character) return;

    try {
      const newStats = {
        health: character.stats.health + (effects.health || 0),
        happiness: character.stats.happiness + (effects.happiness || 0),
        wealth: character.stats.wealth + (effects.wealth || 0),
        energy: character.stats.energy + (effects.energy || 0),
      };

      console.log('📊 Новые статы:', newStats);

      // Проверка на критическое здоровье
      if (newStats.health <= 0) {
        console.log('💔 Критическое здоровье detected');
        dispatch(gameActions.endGame({ deathCause: 'Sizin sağlığınız sıfıra düşdü. Təəssüf ki, həyatınız bitdi.' }));
        Alert.alert('💔 Oyun bitdi', 'Sizin sağlığınız sıfıra düşdü. Təəssüf ki, həyatınız bitdi.');
        return;
      }

      // Проверка на банкротство
      if (newStats.wealth <= 0 && character.stats.wealth > 0) {
        Alert.alert('💰 Müflislik', 'Siz müflis oldunuz! Bu gələcək həyatınızı ciddi şəkildə təsir edəcək.');
      }

      // Проверка на достижение совершеннолетия
      if (character.age === 17) {
        Alert.alert('🎓 Yetkinlik', 'Təbrik edirik! Siz 18 yaşa doldunuz. Yeni imkanlar sizin üçün açılır!');
      }

      // Проверка на идеальные характеристики
      if (Object.values(newStats).every(stat => stat >= 100)) {
        Alert.alert('🌟 İdeal həyat!', 'Bütün xarakteristikalarınız maksimuma çatdı! Siz ideal həyat yaşayırsınız!');
      }

    } catch (error) {
      console.error('❌ Ошибка проверки условий:', error);
    }
  }, [character, dispatch]);

  // Переезд в другой город
  const handleMoveToCity = useCallback((targetCity: string) => {
    if (!character) return;

    const cityInfo = getCityById(targetCity);
    if (!cityInfo) return;

    // Проверяем возможность переезда
    const moveCost = 50; // Базовая стоимость переезда
    if (character.stats.wealth < moveCost) {
      Alert.alert('❌ Pul çatmır', `Şəhərə köçmək üçün ${moveCost} manat lazımdır.`);
      return;
    }

    Alert.alert(
      '🏠 Şəhərə köçmək',
      `${cityInfo.name} şəhərinə köçmək istəyirsiniz? Bu ${moveCost} manat başa gələcək.`,
      [
        { text: 'Ləğv et', style: 'cancel' },
        { 
          text: 'Köç', 
          onPress: () => {
            dispatch(characterActions.updateStats({ wealth: -moveCost }));
            setCurrentCity(targetCity);
            Alert.alert('✅ Köçürüldünüz', `Siz ${cityInfo.name} şəhərinə köçdünüz!`);
          }
        }
      ]
    );
  }, [character, dispatch]);

  // Проверка окончания игры
  useEffect(() => {
    if (isGameOver) {
      console.log('🎮 Игра окончена, показываем диалог');
      Alert.alert(
        '🎮 Oyun bitdi',
        `Sizin həyatınız ${character?.age || 'bilinməyən'} yaşında bitdi.`,
        [
          { text: 'Yeni oyun', onPress: () => navigation.navigate('CharacterCreation' as never) },
          { text: 'Əsas menyu', onPress: () => navigation.navigate('Start' as never) },
        ]
      );
    }
  }, [isGameOver, character?.age, navigation]);

  // Сброс ошибок при смене вкладки
  const handleTabChange = (tab: 'game' | 'stats' | 'history' | 'travel') => {
    setActiveTab(tab);
    setError(null);
  };

  // Рендеринг активной вкладки
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'game':
        return (
          <View style={styles.tabContent}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => {
                    setError(null);
                    loadHistoricalEvent();
                  }}
                >
                  <Text style={styles.retryButtonText}>Yenidən cəhd et</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentEvent && !isGameOver ? (
              <View style={styles.eventContainer}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventNumber}>Hadisə #{eventCount + 1}</Text>
                  <Text style={styles.eventYear}>{currentYear} il</Text>
                  <Text style={styles.eventCity}>{getCityById(currentCity)?.name || 'Bakı'}</Text>
                </View>
                
                <Text style={styles.situation}>{currentEvent.situation}</Text>
                
                <View style={styles.choicesContainer}>
                  {(['A', 'B', 'C'] as const).map((choice) => (
                    <TouchableOpacity
                      key={choice}
                      style={[
                        styles.choiceButton,
                        isProcessingChoice && styles.disabledChoice
                      ]}
                      onPress={() => handleChoice(choice)}
                      disabled={isProcessingChoice || isGameOver}
                    >
                      <View style={styles.choiceHeader}>
                        <Text style={styles.choiceLetter}>{choice}</Text>
                        <View style={styles.effectsContainer}>
                          {Object.entries(currentEvent.effects[choice]).map(([stat, value]) => (
                            <Text key={stat} style={styles.effectText}>
                              {stat === 'health' && '❤️'}
                              {stat === 'happiness' && '😊'}
                              {stat === 'wealth' && '💰'}
                              {stat === 'energy' && '⚡'}
                              {' '}
                              {value > 0 ? `+${value}` : value}
                            </Text>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.choiceText}>
                        {currentEvent[choice]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {isProcessingChoice && (
                  <View style={styles.processingOverlay}>
                    <Text style={styles.processingText}>Seçim emil edilir...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  {isGameOver ? 'Oyun bitdi' : 'Hadisə yüklənir...'}
                </Text>
                {!isGameOver && (
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={loadHistoricalEvent}
                  >
                    <Text style={styles.retryButtonText}>Hadisə yüklə</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );

      case 'travel':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🏠 Şəhərlər</Text>
            <Text style={styles.currentCityText}>Hazırkı şəhər: {getCityById(currentCity)?.name || 'Bakı'}</Text>
            
            <View style={styles.citiesContainer}>
              {CITIES.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.cityCard,
                    city.id === currentCity && styles.currentCityCard
                  ]}
                  onPress={() => city.id !== currentCity && handleMoveToCity(city.id)}
                  disabled={city.id === currentCity}
                >
                  <View style={styles.cityHeader}>
                    <Text style={styles.cityName}>🇦🇿 {city.name}</Text>
                    {city.id === currentCity && (
                      <Text style={styles.currentBadge}>Hazırda</Text>
                    )}
                  </View>
                  <Text style={styles.cityDescription}>{city.description}</Text>
                  <View style={styles.cityBonuses}>
                    <Text style={styles.bonusText}>❤️ {city.bonuses.health} | 😊 {city.bonuses.happiness} | ⚡ {city.bonuses.energy} | 💰 {city.bonuses.wealth}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'stats':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Xarakteristikalar</Text>
            {character && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>❤️ Sağlamlıq</Text>
                    <Text style={styles.statValue}>{character.stats.health}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(100, Math.max(0, character.stats.health))}%`,
                          backgroundColor: character.stats.health <= 20 ? '#ef4444' : 
                                         character.stats.health <= 50 ? '#f97316' : '#10b981'
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>😊 Xoşbəxtlik</Text>
                    <Text style={styles.statValue}>{character.stats.happiness}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(100, Math.max(0, character.stats.happiness))}%`,
                          backgroundColor: character.stats.happiness <= 20 ? '#ef4444' : 
                                         character.stats.happiness <= 50 ? '#f97316' : '#10b981'
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>💰 Sərvət</Text>
                    <Text style={styles.statValue}>{character.stats.wealth} manat</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(100, Math.max(0, character.stats.wealth / 100))}%`,
                          backgroundColor: character.stats.wealth <= 100 ? '#ef4444' : 
                                         character.stats.wealth <= 500 ? '#f97316' : '#f59e0b'
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>⚡ Enerji</Text>
                    <Text style={styles.statValue}>{character.stats.energy}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(100, Math.max(0, character.stats.energy))}%`,
                          backgroundColor: character.stats.energy <= 20 ? '#ef4444' : 
                                         character.stats.energy <= 50 ? '#f97316' : '#8b5cf6'
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Tarixçə</Text>
            {character?.history && character.history.length > 0 ? (
              <View style={styles.historyContainer}>
                {character.history.slice(-10).reverse().map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyEventNumber}>#{character.history.length - index}</Text>
                      <Text style={styles.historyChoice}>Seçim: {item.choice}</Text>
                    </View>
                    <Text style={styles.historyEvent}>{item.event.situation}</Text>
                    <Text style={styles.historyDecision}>Siz seçdiniz: {item.event[item.choice]}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sizin hələ tarixçəniz yoxdur</Text>
                <Text style={styles.emptySubtext}>Qərarlar qəbul edin ki, burada görəsiniz</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (!character) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Personaj yüklənir...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterDetails}>
            Yaş: {character.age} | {getCityById(currentCity)?.name || 'Bakı'} | İl: {currentYear}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Start' as never)}
        >
          <Text style={styles.menuButtonText}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Табы навигации */}
      <View style={styles.tabs}>
        {[
          { key: 'game', label: '🎮 Oyun' },
          { key: 'stats', label: '📊 Statlar' },
          { key: 'travel', label: '🏠 Səyahət' },
          { key: 'history', label: '📅 Tarixçə' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => handleTabChange(tab.key as any)}
          >
            <Text style={styles.tabText}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Контент */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderActiveTab()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ❤️ {character.stats.health} | 😊 {character.stats.happiness} | 💰 {character.stats.wealth} | ⚡ {character.stats.energy}
        </Text>
        {isGameOver && (
          <Text style={styles.gameOverText}>Oyun bitdi</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  tabText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  eventContainer: {
    gap: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventNumber: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  eventYear: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  eventCity: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  situation: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledChoice: {
    opacity: 0.5,
  },
  choiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  choiceLetter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  effectsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  effectText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  choiceText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  currentCityText: {
    fontSize: 16,
    color: '#10b981',
    marginBottom: 16,
    textAlign: 'center',
  },
  citiesContainer: {
    gap: 12,
  },
  cityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentCityCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  currentBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  cityBonuses: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    padding: 8,
  },
  bonusText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    gap: 16,
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyContainer: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyEventNumber: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  historyChoice: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  historyEvent: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  historyDecision: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  gameOverText: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default GameScreenAzerbaijan;
