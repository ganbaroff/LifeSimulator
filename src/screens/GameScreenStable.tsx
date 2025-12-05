// Стабильная версия GameScreen с полной обработкой ошибок
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { GameEvent } from '../types/game';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';

const GameScreenStable: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Redux selectors
  const character = useAppSelector(state => state.character.current);
  const currentEvent = useAppSelector(state => state.game.currentEvent);
  const isGameActive = useAppSelector(state => state.game.isGameActive);
  const isGameOver = useAppSelector(state => state.game.isGameOver);
  const isLoading = useAppSelector(state => state.game.isLoading);

  // Локальное состояние
  const [activeTab, setActiveTab] = useState<'game' | 'stats' | 'history'>('game');
  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);

  // Простые тестовые события
  const testEvents: GameEvent[] = [
    {
      id: 'morning',
      situation: 'Вы просыпаетесь утром и чувствуете...',
      A: 'Энергичность и готовность к новым свершениям',
      B: 'Легкую усталость после вчерашнего дня',
      C: 'Сильное желание остаться в постели',
      effects: {
        A: { energy: 10, happiness: 5 },
        B: { energy: 0, happiness: 0 },
        C: { energy: -5, happiness: -5 },
      },
    },
    {
      id: 'work',
      situation: 'На работе вам предлагают новый проект...',
      A: 'С радостью соглашаюсь на вызов',
      B: 'Соглашаюсь, но с опасениями',
      C: 'Вежливо отказываюсь, слишком рискованно',
      effects: {
        A: { wealth: 100, energy: -10 },
        B: { wealth: 50, energy: -5 },
        C: { wealth: 0, energy: 0 },
      },
    },
    {
      id: 'evening',
      situation: 'Вечером вы решаете как провести время...',
      A: 'Пойти в спортзал для поддержания формы',
      B: 'Встретиться с друзьями в кафе',
      C: 'Остаться дома и посмотреть сериал',
      effects: {
        A: { health: 10, energy: -5, happiness: 5 },
        B: { happiness: 10, energy: -5 },
        C: { energy: 10, happiness: 5 },
      },
    },
    {
      id: 'health',
      situation: 'Вы чувствуете недомогание. Что делать?',
      A: 'Обратиться к врачу немедленно',
      B: 'Полечиться дома народными средствами',
      C: 'Перетерпеть, само пройдет',
      effects: {
        A: { health: 15, wealth: -50 },
        B: { health: 5, wealth: -10 },
        C: { health: -10, wealth: 0 },
      },
    },
    {
      id: 'opportunity',
      situation: 'Друзья предлагают вложиться в стартап...',
      A: 'Вложить все свои сбережения',
      B: 'Вложить небольшую сумму',
      C: 'Отказаться от рискованного предложения',
      effects: {
        A: { wealth: 200, happiness: 10 },
        B: { wealth: 50, happiness: 5 },
        C: { wealth: 0, happiness: 0 },
      },
    },
  ];

  // Загрузка тестового события
  const loadTestEvent = useCallback(() => {
    try {
      const randomEvent = testEvents[Math.floor(Math.random() * testEvents.length)];
      dispatch(gameActions.setCurrentEvent(randomEvent));
      console.log('✅ Тестовое событие загружено:', randomEvent.situation);
      setError(null);
    } catch (err) {
      console.error('❌ Ошибка загрузки события:', err);
      setError('Не удалось загрузить событие');
    }
  }, [dispatch]);

  // Обработка выбора с полной защитой от ошибок
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

      // Проверяем особые условия
      await checkSpecialConditions(effects, newEventCount);

      // Загружаем следующее событие с задержкой
      setTimeout(() => {
        if (!isGameOver) {
          loadTestEvent();
        }
        setIsProcessingChoice(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Ошибка обработки выбора:', error);
      setError('Не удалось обработать выбор');
      setIsProcessingChoice(false);
      
      // Восстанавливаем загрузку события
      setTimeout(() => {
        loadTestEvent();
      }, 2000);
    }
  }, [currentEvent, character, isProcessingChoice, isGameOver, eventCount, dispatch, loadTestEvent]);

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
        dispatch(gameActions.endGame({ deathCause: 'Ваше здоровье упало до нуля. К сожалению, ваша жизнь закончилась.' }));
        Alert.alert('💔 Игра окончена', 'Ваше здоровье упало до нуля. К сожалению, ваша жизнь закончилась.');
        return;
      }

      // Проверка на банкротство
      if (newStats.wealth <= 0 && character.stats.wealth > 0) {
        Alert.alert('💰 Банкротство', 'Вы обанкротились! Это серьезно повлияет на вашу дальнейшую жизнь.');
      }

      // Увеличиваем возраст каждые 5 событий
      if (currentEventCount % 5 === 0) {
        const newAge = character.age + 1;
        dispatch(characterActions.ageUp({ years: 1 }));
        Alert.alert('🎂 День рождения!', `Поздравляем! Вам исполнилось ${newAge} лет!`);
      }

      // Проверка на достижение совершеннолетия
      if (character.age === 17) {
        Alert.alert('🎓 Совершеннолетие', 'Поздравляем! Вам исполнилось 18 лет. Новые возможности открываются перед вами!');
      }

      // Проверка на идеальные характеристики
      if (Object.values(newStats).every(stat => stat >= 100)) {
        Alert.alert('🌟 Идеальная жизнь!', 'Все ваши характеристики достигли максимума! Вы живете идеальной жизнью!');
      }

    } catch (error) {
      console.error('❌ Ошибка проверки условий:', error);
    }
  }, [character, dispatch]);

  // Инициализация игры
  useEffect(() => {
    if (!character && isGameActive) {
      console.log('❌ Нет персонажа при активной игре');
      navigation.navigate('Start' as never);
      return;
    }

    if (character && isGameActive && !currentEvent && !isLoading && !isGameOver) {
      console.log('🔄 Загрузка первого события');
      loadTestEvent();
    }
  }, [character, isGameActive, currentEvent, isLoading, isGameOver, navigation, loadTestEvent]);

  // Проверка окончания игры
  useEffect(() => {
    if (isGameOver) {
      console.log('🎮 Игра окончена, показываем диалог');
      Alert.alert(
        '🎮 Игра окончена',
        `Ваша жизнь подошла к концу в возрасте ${character?.age || 'неизвестном'} лет.`,
        [
          { text: 'Новая игра', onPress: () => navigation.navigate('CharacterCreation' as never) },
          { text: 'Главное меню', onPress: () => navigation.navigate('Start' as never) },
        ]
      );
    }
  }, [isGameOver, character?.age, navigation]);

  // Сброс ошибок при смене вкладки
  const handleTabChange = (tab: 'game' | 'stats' | 'history') => {
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
                    loadTestEvent();
                  }}
                >
                  <Text style={styles.retryButtonText}>Повторить</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentEvent && !isGameOver ? (
              <View style={styles.eventContainer}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventNumber}>Событие #{eventCount + 1}</Text>
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
                    <Text style={styles.processingText}>Обработка выбора...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  {isGameOver ? 'Игра окончена' : 'Загрузка события...'}
                </Text>
                {!isGameOver && (
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={loadTestEvent}
                  >
                    <Text style={styles.retryButtonText}>Загрузить событие</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );

      case 'stats':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Характеристики</Text>
            {character && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>❤️ Здоровье</Text>
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
                    <Text style={styles.statLabel}>😊 Счастье</Text>
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
                    <Text style={styles.statLabel}>💰 Богатство</Text>
                    <Text style={styles.statValue}>${character.stats.wealth}</Text>
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
                    <Text style={styles.statLabel}>⚡ Энергия</Text>
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
            <Text style={styles.sectionTitle}>История решений</Text>
            {character?.history && character.history.length > 0 ? (
              <View style={styles.historyContainer}>
                {character.history.slice(-10).reverse().map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyEventNumber}>#{character.history.length - index}</Text>
                      <Text style={styles.historyChoice}>Выбор: {item.choice}</Text>
                    </View>
                    <Text style={styles.historyEvent}>{item.event.situation}</Text>
                    <Text style={styles.historyDecision}>Вы выбрали: {item.event[item.choice]}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>У вас пока нет истории</Text>
                <Text style={styles.emptySubtext}>Начните принимать решения, чтобы увидеть их здесь</Text>
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
          <Text style={styles.loadingText}>Загрузка персонажа...</Text>
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
            Возраст: {character.age} | {character.country} | Событий: {eventCount}
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
          { key: 'game', label: '🎮 Игра' },
          { key: 'stats', label: '📊 Статы' },
          { key: 'history', label: '📅 История' },
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
          <Text style={styles.gameOverText}>Игра окончена</Text>
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
    fontSize: 14,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  eventNumber: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
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

export default GameScreenStable;
