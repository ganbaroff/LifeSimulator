// Экран истории решений - Sprint 3 Task 6
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { GameHistory } from '../../types/game';

interface HistoryScreenProps {}

const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  const character = useSelector((state: RootState) => state.character.current);
  const game = useSelector((state: RootState) => state.game);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GameHistory | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const history = character?.history || [];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Фильтрация истории
  const filteredHistory = useMemo(() => {
    if (filter === 'all') return history;
    
    return history.filter(item => {
      const effects = item.effects;
      const totalEffect = (effects.health || 0) + (effects.happiness || 0) + 
                         (effects.wealth || 0) + (effects.energy || 0);
      
      return filter === 'positive' ? totalEffect > 0 : totalEffect < 0;
    });
  }, [history, filter]);

  // Статистика по истории
  const historyStats = useMemo(() => {
    const totalEvents = history.length;
    const positiveEvents = history.filter(item => {
      const effects = item.effects;
      const totalEffect = (effects.health || 0) + (effects.happiness || 0) + 
                         (effects.wealth || 0) + (effects.energy || 0);
      return totalEffect > 0;
    }).length;
    const negativeEvents = totalEvents - positiveEvents;

    return {
      totalEvents,
      positiveEvents,
      negativeEvents,
      positivePercentage: totalEvents > 0 ? Math.round((positiveEvents / totalEvents) * 100) : 0,
    };
  }, [history]);

  // Форматирование даты
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Получение эмодзи для выбора
  const getChoiceEmoji = (choice: 'A' | 'B' | 'C'): string => {
    switch (choice) {
      case 'A': return '🎯';
      case 'B': return '⚡';
      case 'C': return '🔥';
      default: return '❓';
    }
  };

  // Получение цвета для эффекта
  const getEffectColor = (value: number): string => {
    if (value > 0) return '#10b981';
    if (value < 0) return '#ef4444';
    return '#64748b';
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Персонаж не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>История решений</Text>
          <Text style={styles.subtitle}>{character.name}</Text>
        </View>

        {/* Статистика */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Статистика решений</Text>
          <View style={styles.statsGrid}>
            <StatItem
              label="Всего событий"
              value={historyStats.totalEvents}
              icon="📝"
              color="#3b82f6"
            />
            <StatItem
              label="Позитивные"
              value={historyStats.positiveEvents}
              icon="😊"
              color="#10b981"
            />
            <StatItem
              label="Негативные"
              value={historyStats.negativeEvents}
              icon="😔"
              color="#ef4444"
            />
            <StatItem
              label="% позитивных"
              value={`${historyStats.positivePercentage}%`}
              icon="📊"
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Фильтры */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Фильтр событий</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive
              ]}>
                Все ({historyStats.totalEvents})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'positive' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('positive')}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'positive' && styles.filterButtonTextActive
              ]}>
                Позитивные ({historyStats.positiveEvents})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'negative' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('negative')}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'negative' && styles.filterButtonTextActive
              ]}>
                Негативные ({historyStats.negativeEvents})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* История событий */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>
            {filter === 'all' && 'Все события'}
            {filter === 'positive' && 'Позитивные события'}
            {filter === 'negative' && 'Негативные события'}
            ({filteredHistory.length})
          </Text>

          {filteredHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {filter === 'all' && 'У вас пока нет событий в истории'}
                {filter === 'positive' && 'У вас пока нет позитивных событий'}
                {filter === 'negative' && 'У вас пока нет негативных событий'}
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.map((item, index) => (
                <HistoryItem
                  key={item.timestamp}
                  item={item}
                  index={index}
                  isSelected={selectedEvent?.timestamp === item.timestamp}
                  onSelect={() => setSelectedEvent(item)}
                  onDeselect={() => setSelectedEvent(null)}
                  getChoiceEmoji={getChoiceEmoji}
                  getEffectColor={getEffectColor}
                  formatDate={formatDate}
                />
              ))}
            </View>
          )}
        </View>

        {/* Детали выбранного события */}
        {selectedEvent && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Детали события</Text>
            <EventDetails
              event={selectedEvent}
              getChoiceEmoji={getChoiceEmoji}
              getEffectColor={getEffectColor}
              formatDate={formatDate}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Компонент для отображения статистики
interface StatItemProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color }) => {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// Компонент для отображения элемента истории
interface HistoryItemProps {
  item: GameHistory;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  getChoiceEmoji: (choice: 'A' | 'B' | 'C') => string;
  getEffectColor: (value: number) => string;
  formatDate: (timestamp: number) => string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onDeselect,
  getChoiceEmoji,
  getEffectColor,
  formatDate
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.historyItem,
        isSelected && styles.historyItemSelected
      ]}
      onPress={isSelected ? onDeselect : onSelect}
    >
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyIndex}>#{index + 1}</Text>
          <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.historyChoice}>
          <Text style={styles.choiceEmoji}>{getChoiceEmoji(item.choice)}</Text>
          <Text style={styles.choiceText}>Выбор {item.choice}</Text>
        </View>
      </View>

      <Text style={styles.historySituation} numberOfLines={2}>
        {item.event.situation}
      </Text>

      <View style={styles.historyEffects}>
        {item.effects.health !== undefined && (
          <Text style={[styles.effectText, { color: getEffectColor(item.effects.health) }]}>
            ❤️ {item.effects.health > 0 ? '+' : ''}{item.effects.health}
          </Text>
        )}
        {item.effects.happiness !== undefined && (
          <Text style={[styles.effectText, { color: getEffectColor(item.effects.happiness) }]}>
            😊 {item.effects.happiness > 0 ? '+' : ''}{item.effects.happiness}
          </Text>
        )}
        {item.effects.wealth !== undefined && (
          <Text style={[styles.effectText, { color: getEffectColor(item.effects.wealth) }]}>
            💰 {item.effects.wealth > 0 ? '+' : ''}{item.effects.wealth}
          </Text>
        )}
        {item.effects.energy !== undefined && (
          <Text style={[styles.effectText, { color: getEffectColor(item.effects.energy) }]}>
            ⚡ {item.effects.energy > 0 ? '+' : ''}{item.effects.energy}
          </Text>
        )}
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>Выбрано</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Компонент для отображения деталей события
interface EventDetailsProps {
  event: GameHistory;
  getChoiceEmoji: (choice: 'A' | 'B' | 'C') => string;
  getEffectColor: (value: number) => string;
  formatDate: (timestamp: number) => string;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  getChoiceEmoji,
  getEffectColor,
  formatDate
}) => {
  return (
    <View style={styles.eventDetails}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Дата:</Text>
        <Text style={styles.detailValue}>{formatDate(event.timestamp)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Ситуация:</Text>
        <Text style={styles.detailValue}>{event.event.situation}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Ваш выбор:</Text>
        <View style={styles.choiceDetail}>
          <Text style={styles.choiceEmoji}>{getChoiceEmoji(event.choice)}</Text>
          <Text style={styles.choiceText}>{event.choice}: {event.event[event.choice]}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Эффекты:</Text>
        <View style={styles.effectsDetail}>
          {event.effects.health !== undefined && (
            <Text style={[styles.effectDetailText, { color: getEffectColor(event.effects.health) }]}>
              Здоровье: {event.effects.health > 0 ? '+' : ''}{event.effects.health}
            </Text>
          )}
          {event.effects.happiness !== undefined && (
            <Text style={[styles.effectDetailText, { color: getEffectColor(event.effects.happiness) }]}>
              Счастье: {event.effects.happiness > 0 ? '+' : ''}{event.effects.happiness}
            </Text>
          )}
          {event.effects.wealth !== undefined && (
            <Text style={[styles.effectDetailText, { color: getEffectColor(event.effects.wealth) }]}>
              Богатство: {event.effects.wealth > 0 ? '+' : ''}{event.effects.wealth}
            </Text>
          )}
          {event.effects.energy !== undefined && (
            <Text style={[styles.effectDetailText, { color: getEffectColor(event.effects.energy) }]}>
              Энергия: {event.effects.energy > 0 ? '+' : ''}{event.effects.energy}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Источник:</Text>
        <Text style={styles.detailValue}>
          {event.event.source === 'openai' && '🤖 AI'}
          {event.event.source === 'gemini' && '🧠 Gemini'}
          {event.event.source === 'fallback' && '📚 История'}
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
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  historyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyIndex: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  historyChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  choiceEmoji: {
    fontSize: 14,
  },
  choiceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  historySituation: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 20,
  },
  historyEffects: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  effectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  choiceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  effectsDetail: {
    gap: 4,
  },
  effectDetailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default HistoryScreen;
