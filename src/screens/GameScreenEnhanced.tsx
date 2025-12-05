// Улучшенный GameScreen с реальным функционалом
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { GameEvent } from '../types/game';
import { characterActions } from '../store/slices/characterSlice';
import { gameActions } from '../store/slices/gameSliceNew';
import { generateEvent } from '../services/AIEngine';
import { RealTimeStats } from '../components/RealTimeStats';
import { InteractiveChoices } from '../components/InteractiveChoices';
import { LifeTimeline } from '../components/LifeTimeline';
import { AchievementSystem } from '../components/AchievementSystem';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { useSoundEffects } from '../utils/soundEffects';

const GameScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { playButton, playChoice, playError, playLevelUp } = useSoundEffects();

  // Redux selectors
  const character = useAppSelector(state => state.character.current);
  const currentEvent = useAppSelector(state => state.game.currentEvent);
  const isGameActive = useAppSelector(state => state.game.isGameActive);
  const isGameOver = useAppSelector(state => state.game.isGameOver);
  const isLoading = useAppSelector(state => state.game.isLoading);

  // Local state
  const [activeTab, setActiveTab] = useState<'game' | 'stats' | 'timeline' | 'achievements'>('game');
  const [previousStats, setPreviousStats] = useState(character?.stats);

  // Инициализация игры
  useEffect(() => {
    if (!character && isGameActive) {
      // Если игра активна но персонажа нет, возвращаем на старт
      console.log('❌ Нет персонажа при активной игре');
      navigation.navigate('Start' as never);
      return;
    }

    if (character && isGameActive && !currentEvent && !isLoading) {
      // Загружаем первое событие
      loadNextEvent();
    }
  }, [character, isGameActive, currentEvent, isLoading]);

  // Загрузка следующего события
  const loadNextEvent = async () => {
    if (!character) return;

    try {
      console.log('🔄 Загрузка нового события...');
      const event = await generateEvent(character, {
        currentDay: 1,
        currentEvent: null,
        eventCount: 0,
        isGameActive: true,
        isGameOver: false,
        difficulty: 'medium',
        characterSeed: {
          name: character.name,
          country: character.country,
          yearBase: character.birthYear || 2000,
          profession: character.profession || 'none',
        },
      });

      dispatch(gameActions.setCurrentEvent(event));
      console.log('✅ Событие загружено:', event.situation);
    } catch (error) {
      console.error('❌ Ошибка загрузки события:', error);
      playError();
      Alert.alert('Ошибка', 'Не удалось загрузить событие');
    }
  };

  // Обработка выбора
  const handleChoice = async (choice: 'A' | 'B' | 'C') => {
    if (!currentEvent || !character) return;

    try {
      playChoice();
      
      // Сохраняем предыдущие статы для отображения изменений
      setPreviousStats(character.stats);

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
      await loadNextEvent();
    } catch (error) {
      console.error('❌ Ошибка обработки выбора:', error);
      playError();
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
      playLevelUp();
    }

    // Проверка на все характеристики 100+
    if (Object.values(newStats).every(stat => stat >= 100)) {
      Alert.alert('🌟 Идеальная жизнь!', 'Все ваши характеристики достигли максимума! Вы живете идеальной жизнью!');
      playLevelUp();
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
              <InteractiveChoices
                event={currentEvent}
                onChoiceMade={handleChoice}
                isLoading={isLoading}
              />
            ) : (
              <Text style={styles.loadingText}>Загрузка события...</Text>
            )}
          </View>
        );

      case 'stats':
        return (
          <View style={styles.tabContent}>
            <RealTimeStats
              showChanges={!!previousStats}
              previousStats={previousStats}
            />
          </View>
        );

      case 'timeline':
        return (
          <View style={styles.tabContent}>
            <LifeTimeline maxEvents={20} showFilters={true} />
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.tabContent}>
            <AchievementSystem />
          </View>
        );

      default:
        return null;
    }
  };

  if (!character) {
    return (
      <AnimatedScreen animationType="fadeIn">
        <View style={styles.container}>
          <Text style={styles.loadingText}>Загрузка персонажа...</Text>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen animationType="fadeIn">
      <View style={styles.container}>
        {/* Header с информацией о персонаже */}
        <View style={styles.header}>
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterDetails}>
              Возраст: {character.age} | {character.country}
            </Text>
            <Text style={styles.characterDetails}>
              {character.profession || 'Безработный'} | {character.educationLevel || 'Нет образования'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              playButton();
              navigation.navigate('Start' as never);
            }}
          >
            <Text style={styles.menuButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>

        {/* Табы навигации */}
        <View style={styles.tabs}>
          {[
            { key: 'game', label: '🎮 Игра', icon: '🎮' },
            { key: 'stats', label: '📊 Статы', icon: '📊' },
            { key: 'timeline', label: '📅 История', icon: '📅' },
            { key: 'achievements', label: '🏆 Достижения', icon: '🏆' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => {
                playButton();
                setActiveTab(tab.key as any);
              }}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Контент активной вкладки */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderActiveTab()}
        </ScrollView>

        {/* Footer с быстрой статистикой */}
        <View style={styles.footer}>
          <View style={styles.quickStats}>
            <Text style={styles.quickStatText}>
              ❤️ {character.stats.health} | 😊 {character.stats.happiness}
            </Text>
            <Text style={styles.quickStatText}>
              💰 {character.stats.wealth} | ⚡ {character.stats.energy}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedScreen>
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
    marginBottom: 2,
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
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    // Таб текст остается без изменений
  },
  activeTabLabel: {
    color: '#3b82f6',
    fontWeight: '600',
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
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default GameScreenEnhanced;
