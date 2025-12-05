import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LEGACY_BONUSES } from '../../data/legacyBonuses';

const LegacyShop = ({ legacyPoints, onPurchase, onContinue }) => {
  const [selectedBonuses, setSelectedBonuses] = useState([]);

  const handleSelectBonus = (bonus) => {
    const isSelected = selectedBonuses.find(b => b.id === bonus.id);
    if (isSelected) {
      setSelectedBonuses(selectedBonuses.filter(b => b.id !== bonus.id));
    } else {
      setSelectedBonuses([...selectedBonuses, bonus]);
    }
  };

  const getTotalCost = () => {
    return selectedBonuses.reduce((total, bonus) => total + bonus.cost, 0);
  };

  const canAfford = () => {
    return getTotalCost() <= legacyPoints;
  };

  const handleConfirm = () => {
    if (canAfford()) {
      onPurchase(selectedBonuses, getTotalCost());
    } else {
      alert('Not enough legacy points!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Наследие Прошлых Жизней</Text>
      <Text style={styles.subtitle}>
        Ваши прошлые достижения позволяют вам начать новую жизнь с преимуществом.
      </Text>

      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>Ваши Очки Наследия: 🏆 {legacyPoints}</Text>
      </View>

      <ScrollView style={styles.bonusList}>
        {LEGACY_BONUSES.map(bonus => {
          const isSelected = selectedBonuses.some(b => b.id === bonus.id);
          return (
            <TouchableOpacity 
              key={bonus.id} 
              style={[styles.bonusCard, isSelected && styles.bonusCardSelected]}
              onPress={() => handleSelectBonus(bonus)}
            >
              <View>
                <Text style={styles.bonusName}>{bonus.name}</Text>
                <Text style={styles.bonusDescription}>{bonus.description}</Text>
              </View>
              <Text style={styles.bonusCost}>🏆 {bonus.cost}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.totalCost}>Итого: 🏆 {getTotalCost()}</Text>
        <TouchableOpacity 
          style={[styles.continueButton, !canAfford() && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={!canAfford()}
        >
          <Text style={styles.buttonText}>Применить и продолжить</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onContinue}>
            <Text style={styles.skipText}>Пропустить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  pointsContainer: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsText: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bonusList: {
    maxHeight: 300,
  },
  bonusCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bonusCardSelected: {
    borderColor: '#22c55e',
  },
  bonusName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  bonusDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  bonusCost: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#334155',
    paddingTop: 15,
  },
  totalCost: {
    color: '#f8fafc',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  skipText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default LegacyShop;
