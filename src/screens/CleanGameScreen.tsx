import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const CleanGameScreen = () => {
  // Get game state from Redux
  const gameState = useSelector((state: RootState) => state.game);
  
  // Simple player stats with fallbacks
  const playerStats = {
    health: gameState?.player?.health || 100,
    energy: gameState?.player?.energy || 100,
    money: gameState?.player?.money || 100,
    day: gameState?.currentDay || 1
  };

  // Render the game screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Life Simulator</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Day: {playerStats.day}</Text>
        <Text style={styles.statText}>Health: {playerStats.health}</Text>
        <Text style={styles.statText}>Energy: {playerStats.energy}</Text>
        <Text style={styles.statText}>Money: ${playerStats.money}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Next Day" 
          onPress={() => console.log('Next day')} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#444',
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 200,
  },
});

export default CleanGameScreen;
