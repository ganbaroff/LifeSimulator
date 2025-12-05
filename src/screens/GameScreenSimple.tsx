// Упрощенная версия GameScreen для отладки
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { GameEvent } from '../types/game';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';

const GameScreenSimple: React.FC = () => {
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

  // Простые тестовые события
  const testEvents: GameEvent[] = [
    {
      id: 'test1',
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
      id: 'test2',
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
      id: 'test3',
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
  ];

  // Инициализация игры
  useEffect(() => {
    if (!character && isGameActive) {
      console.log('❌ Нет персонажа при активной игре');
      navigation.navigate('Start' as never);
      return;
    }

    if (character && isGameActive && !currentEvent && !isLoading) {
      // Загружаем первое событие
      loadTestEvent();
    }
  }, [character, isGameActive, currentEvent, isLoading]);

  // Загрузка тестового события
  const loadTestEvent = () => {
    const randomEvent = testEvents[Math.floor(Math.random() * testEvents.length)];
    dispatch(gameActions.setCurrentEvent(randomEvent));
    console.log('✅ Тестовое событие загружено:', randomEvent.situation);
  };

  // Обработка выбора
  const handleChoice = async (choice: 'A' | 'B' | 'C') => {
    if (!currentEvent || !character) return;

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

      // Проверяем особые условия
      await checkSpecialConditions(effects);

      // Загружаем следующее событие
      await loadTestEvent();
    } catch (error) {
      console.error('❌ Ошибка обработки выбора:', error);
      Alert.alert('Ошибка', 'Не удалось обработать выбор');
    }
  };

  // Проверка особых условий
  const checkSpecialConditions = async (effects: any) => {
    if (!character) return;

    const newStats = {
      health: character.stats.health + (effects.health || 0),
      happiness: character.stats.happiness + (effects.happiness || 0),
      wealth: character.stats.wealth + (effects.wealth || 0),
      energy: character.stats.energy + (effects.energy || 0),
    };

    // Проверка на критическое здоровье
    if (newStats.health <= 0) {
      dispatch(gameActions.setGameOver(true));
      Alert.alert('💔 Игра окончена', 'Ваше здоровье упало до нуля. К сожалению, ваша жизнь закончилась.');
      return;
    }

    // Проверка на банкротство
    if (newStats.wealth <= 0 && character.stats.wealth > 0) {
      Alert.alert('💰 Банкротство', 'Вы обанкротились! Это серьезно повлияет на вашу дальнейшую жизнь.');
    }

    // Проверка на достижение совершеннолетия
    if (character.age === 17) {
      Alert.alert('🎓 Совершеннолетие', 'Поздравляем! Вам исполнилось 18 лет. Новые возможности открываются перед вами!');
    }
  };

  // Проверка окончания игры
  useEffect(() => {
    if (isGameOver) {
      Alert.alert(
        '🎮 Игра окончена',
        `Ваша жизнь подошла к концу в возрасте ${character?.age} лет.`,
        [
          { text: 'Новая игра', onPress: () => navigation.navigate('CharacterCreation' as never) },
          { text: 'Главное меню', onPress: () => navigation.navigate('Start' as never) },
        ]
      );
    }
  }, [isGameOver, character?.age]);

  // Рендеринг активной вкладки
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'game':
        return (
          <View style={styles.tabContent}>
            {currentEvent ? (
              <View style={styles.eventContainer}>
                <Text style={styles.situation}>{currentEvent.situation}</Text>
                
                <View style={styles.choicesContainer}>
                  {(['A', 'B', 'C'] as const).map((choice) => (
                    <TouchableOpacity
                      key={choice}
                      style={styles.choiceButton}
                      onPress={() => handleChoice(choice)}
                    >
                      <Text style={styles.choiceLetter}>{choice}</Text>
                      <Text style={styles.choiceText}>
                        {currentEvent[choice]}
                      </Text>
                      
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
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.loadingText}>Загрузка события...</Text>
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
                  <Text style={styles.statLabel}>❤️ Здоровье</Text>
                  <Text style={styles.statValue}>{character.stats.health}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>😊 Счастье</Text>
                  <Text style={styles.statValue}>{character.stats.happiness}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>💰 Богатство</Text>
                  <Text style={styles.statValue}>{character.stats.wealth}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>⚡ Энергия</Text>
                  <Text style={styles.statValue}>{character.stats.energy}</Text>
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
                    <Text style={styles.historyEvent}>{item.event.situation}</Text>
                    <Text style={styles.historyChoice}>Выбор: {item.choice} - {item.event[item.choice]}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>У вас пока нет истории</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка персонажа...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterDetails}>
            Возраст: {character.age} | {character.country}
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
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabText}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Контент */}
      <ScrollView style={styles.content}>
        {renderActiveTab()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ❤️ {character.stats.health} | 😊 {character.stats.happiness} | 💰 {character.stats.wealth} | ⚡ {character.stats.energy}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  loadingText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  eventContainer: {
    gap: 20,
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
  choiceLetter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 22,
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
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
  historyContainer: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  historyEvent: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  historyChoice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
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
});

export default GameScreenSimple;
