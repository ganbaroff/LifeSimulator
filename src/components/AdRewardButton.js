// AdRewardButton.js - Кнопка для просмотра рекламы за награду
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import adService from '../services/AdService';
import audioService from '../services/AudioService';
import analyticsService from '../services/AnalyticsService';

const AdRewardButton = ({ onReward, rewardAmount = 10, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (disabled || isLoading) return;

    // Проверка доступности рекламы
    if (!adService.isRewardedAdReady()) {
      Alert.alert('Ad Not Ready', 'Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    await audioService.playSoundEffect('button_click', true);

    // Показ рекламы
    const success = await adService.showRewardedAd((reward) => {
      // Награда получена
      analyticsService.logAdView('rewarded', true);
      audioService.playSoundEffect('reward', true);

      if (onReward) {
        onReward(rewardAmount);
      }

      Alert.alert('🎉 Reward Earned!', `You received ${rewardAmount} crystals!`, [{ text: 'OK' }]);
    });

    if (!success) {
      Alert.alert('Error', 'Failed to show ad. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled || isLoading}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📺</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Watch Ad</Text>
          <Text style={styles.reward}>+{rewardAmount} 💎</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reward: {
    fontSize: 14,
    color: '#fbbf24',
    marginTop: 2,
  },
});

export default AdRewardButton;
