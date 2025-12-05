// src/components/CharacterHistory.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CharacterHistoryProps {
  history: Array<{
    event: {
      id: string;
      situation: string;
      A: string;
      B: string;
      C: string;
    };
    choice: 'A' | 'B' | 'C';
    effects: {
      health?: number;
      happiness?: number;
      wealth?: number;
      energy?: number;
    };
    timestamp: number;
  }>;
  onClose: () => void;
}

const CharacterHistory: React.FC<CharacterHistoryProps> = ({ history, onClose }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEffectText = (effects: any) => {
    const effectTexts = [];
    
    if (effects.health) {
      effectTexts.push(`Здоровье ${effects.health > 0 ? '+' : ''}${effects.health}`);
    }
    if (effects.happiness) {
      effectTexts.push(`Счастье ${effects.happiness > 0 ? '+' : ''}${effects.happiness}`);
    }
    if (effects.wealth) {
      effectTexts.push(`Богатство ${effects.wealth > 0 ? '+' : ''}${effects.wealth}`);
    }
    if (effects.energy) {
      effectTexts.push(`Энергия ${effects.energy > 0 ? '+' : ''}${effects.energy}`);
    }
    
    return effectTexts.length > 0 ? effectTexts.join(', ') : 'Без изменений';
  };

  const getChoiceColor = (choice: 'A' | 'B' | 'C') => {
    switch (choice) {
      case 'A': return '#FF6B6B';
      case 'B': return '#4ECDC4';
      case 'C': return '#45B7D1';
      default: return '#FFFFFF';
    }
  };

  const getChoiceText = (choice: 'A' | 'B' | 'C', event: any) => {
    switch (choice) {
      case 'A': return event.A;
      case 'B': return event.B;
      case 'C': return event.C;
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.backgroundGradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>История персонажа</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>История пока пуста</Text>
              <Text style={styles.emptySubtext}>Сделайте выборы чтобы увидеть их здесь</Text>
            </View>
          ) : (
            history.map((item, index) => (
              <View key={item.timestamp} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyIndex}>
                    <Text style={styles.historyIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
                </View>
                
                <Text style={styles.historySituation}>{item.event.situation}</Text>
                
                <View style={styles.choiceContainer}>
                  <View style={[styles.choiceBadge, { backgroundColor: getChoiceColor(item.choice) }]}>
                    <Text style={styles.choiceText}>Выбор: {item.choice}</Text>
                  </View>
                  <Text style={styles.choiceDetail}>{getChoiceText(item.choice, item.event)}</Text>
                </View>
                
                <View style={styles.effectsContainer}>
                  <Text style={styles.effectsTitle}>Эффекты:</Text>
                  <Text style={styles.effectsText}>{getEffectText(item.effects)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIndexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  historySituation: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  choiceContainer: {
    marginBottom: 8,
  },
  choiceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  choiceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  choiceDetail: {
    fontSize: 13,
    color: '#E0E0E0',
    lineHeight: 18,
  },
  effectsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
  },
  effectsTitle: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  effectsText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default CharacterHistory;
