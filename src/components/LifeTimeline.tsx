// Компонент временной шкалы жизни с реальными событиями
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useAppSelector } from '../store/indexRedux';
import { GameHistory } from '../types/game';

interface LifeTimelineProps {
  maxEvents?: number;
  showFilters?: boolean;
}

export const LifeTimeline: React.FC<LifeTimelineProps> = ({ 
  maxEvents = 10, 
  showFilters = true 
}) => {
  const character = useAppSelector(state => state.character.current);
  const history = useAppSelector(state => state.character.history);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [timelineAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Анимация появления временной шкалы
    Animated.timing(timelineAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Фильтрация событий
  const getFilteredHistory = () => {
    if (!history) return [];
    
    return history.slice(0, maxEvents).filter((item, index) => {
      if (filter === 'all') return true;
      
      const effects = item.event.effects[item.choice];
      const totalEffect = Object.values(effects).reduce((sum, value) => sum + value, 0);
      
      if (filter === 'positive') return totalEffect > 0;
      if (filter === 'negative') return totalEffect < 0;
      if (filter === 'neutral') return totalEffect === 0;
      
      return true;
    });
  };

  // Получение цвета события
  const getEventColor = (historyItem: GameHistory) => {
    const effects = historyItem.event.effects[historyItem.choice];
    const totalEffect = Object.values(effects).reduce((sum, value) => sum + value, 0);
    
    if (totalEffect > 5) return '#10b981'; // Зеленый - очень положительное
    if (totalEffect > 0) return '#22c55e'; // Светло-зеленый - положительное
    if (totalEffect === 0) return '#64748b'; // Серый - нейтральное
    if (totalEffect > -5) return '#f97316'; // Оранжевый - отрицательное
    return '#ef4444'; // Красный - очень отрицательное
  };

  // Получение эмодзи для события
  const getEventEmoji = (historyItem: GameHistory) => {
    const effects = historyItem.event.effects[historyItem.choice];
    
    if (effects.health && effects.health > 10) return '❤️';
    if (effects.happiness && effects.happiness > 10) return '😊';
    if (effects.wealth && effects.wealth > 100) return '💰';
    if (effects.energy && effects.energy > 10) return '⚡';
    
    if (effects.health && effects.health < -10) return '💔';
    if (effects.happiness && effects.happiness < -10) return '😢';
    if (effects.wealth && effects.wealth < -100) return '📉';
    if (effects.energy && effects.energy < -10) return '😴';
    
    return '📝';
  };

  // Переключение развернутого состояния
  const toggleEventExpansion = (index: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvents(newExpanded);
  };

  // Получение статистики
  const getStatistics = () => {
    if (!history) return { positive: 0, negative: 0, neutral: 0, total: 0 };
    
    const stats = { positive: 0, negative: 0, neutral: 0, total: 0 };
    
    history.forEach(item => {
      const effects = item.event.effects[item.choice];
      const totalEffect = Object.values(effects).reduce((sum, value) => sum + value, 0);
      
      if (totalEffect > 0) stats.positive++;
      else if (totalEffect < 0) stats.negative++;
      else stats.neutral++;
      
      stats.total++;
    });
    
    return stats;
  };

  const filteredHistory = getFilteredHistory();
  const statistics = getStatistics();

  if (!character || !history || history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>История жизни</Text>
        <Text style={styles.emptyText}>У вас пока нет истории. Начните принимать решения!</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: timelineAnimation }]}>
      <View style={styles.header}>
        <Text style={styles.title}>История жизни</Text>
        <Text style={styles.subtitle}>Возраст: {character.age} лет</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statistics}>
        <Text style={styles.statsTitle}>Статистика решений:</Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statItem, { color: '#10b981' }]}>
            ✅ {statistics.positive}
          </Text>
          <Text style={[styles.statItem, { color: '#64748b' }]}>
            ➖ {statistics.neutral}
          </Text>
          <Text style={[styles.statItem, { color: '#ef4444' }]}>
            ❌ {statistics.negative}
          </Text>
          <Text style={styles.statItem}>
            📊 Всего: {statistics.total}
          </Text>
        </View>
      </View>

      {/* Фильтры */}
      {showFilters && (
        <View style={styles.filters}>
          {(['all', 'positive', 'negative', 'neutral'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.activeFilter,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text style={[
                styles.filterText,
                filter === filterType && styles.activeFilterText,
              ]}>
                {filterType === 'all' && 'Все'}
                {filterType === 'positive' && '✅'}
                {filterType === 'negative' && '❌'}
                {filterType === 'neutral' && '➖'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Временная шкала */}
      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {filteredHistory.map((historyItem, index) => (
          <View key={index} style={styles.eventItem}>
            {/* Линия времени */}
            <View style={styles.timelineLine} />
            
            {/* Точка события */}
            <View style={[styles.eventDot, { backgroundColor: getEventColor(historyItem) }]} />
            
            {/* Контент события */}
            <TouchableOpacity
              style={styles.eventContent}
              onPress={() => toggleEventExpansion(index)}
              activeOpacity={0.8}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventMeta}>
                  <Text style={styles.eventEmoji}>{getEventEmoji(historyItem)}</Text>
                  <Text style={styles.eventAge}>Возраст: {character.age - (filteredHistory.length - index - 1)}</Text>
                </View>
                <Text style={styles.eventChoice}>Выбор: {historyItem.choice}</Text>
              </View>
              
              <Text style={styles.eventSituation}>{historyItem.event.situation}</Text>
              <Text style={styles.eventDecision}>Вы выбрали: {historyItem.event[historyItem.choice]}</Text>
              
              {/* Развернутые эффекты */}
              {expandedEvents.has(index) && (
                <View style={styles.expandedEffects}>
                  <Text style={styles.effectsTitle}>Последствия:</Text>
                  {Object.entries(historyItem.event.effects[historyItem.choice]).map(([stat, value]) => (
                    <Text key={stat} style={styles.effectItem}>
                      {stat === 'health' && '❤️ Здоровье'}
                      {stat === 'happiness' && '😊 Счастье'}
                      {stat === 'wealth' && '💰 Богатство'}
                      {stat === 'energy' && '⚡ Энергия'}
                      : {value > 0 ? ` +${value}` : ` ${value}`}
                    </Text>
                  ))}
                </View>
              )}
              
              <Text style={styles.expandText}>
                {expandedEvents.has(index) ? 'Скрыть детали ▲' : 'Показать детали ▼'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  statistics: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  timeline: {
    maxHeight: 400,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineLine: {
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 16,
    position: 'absolute',
    left: 6,
    top: 20,
    bottom: -20,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
    zIndex: 1,
  },
  eventContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventEmoji: {
    fontSize: 16,
  },
  eventAge: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  eventChoice: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  eventSituation: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventDecision: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  expandedEffects: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  effectsTitle: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 6,
  },
  effectItem: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  expandText: {
    fontSize: 11,
    color: '#3b82f6',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
