import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

const GameScreen = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initGame = async () => {
      try {
        // Initialize game state here if needed
        setIsLoading(false);
      } catch (error) {
        console.error('Game initialization error:', error);
        setIsLoading(false);
      }
    };

    initGame();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Life Simulator</Text>
      <Text>Day: {gameState?.currentDay || 1}</Text>
      <Text>Health: {gameState?.player?.health || 100}</Text>
      <Text>Energy: {gameState?.player?.energy || 100}</Text>
      <Text>Money: ${gameState?.player?.money || 0}</Text>
      
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
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 200,
  },
});

export default GameScreen;
