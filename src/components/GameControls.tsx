import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type GameControlsProps = {
  isPaused: boolean;
  onPausePress: () => void;
  onNextDayPress: () => void;
  onMenuPress: () => void;
  onStatsPress: () => void;
};

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  onPausePress,
  onNextDayPress,
  onMenuPress,
  onStatsPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.menuButton]} 
        onPress={onMenuPress}
      >
        <Icon name="menu" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.mainControls}>
        <TouchableOpacity 
          style={[styles.button, styles.pauseButton]} 
          onPress={onPausePress}
        >
          <Icon 
            name={isPaused ? 'play-arrow' : 'pause'} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.nextDayButton]} 
          onPress={onNextDayPress}
          disabled={!isPaused}
        >
          <Icon name="skip-next" size={24} color="#fff" />
          <Text style={styles.buttonText}>Next Day</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.statsButton]} 
        onPress={onStatsPress}
      >
        <Icon name="insert-chart" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 30,
    padding: 8,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainControls: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
  },
  menuButton: {
    backgroundColor: '#3498db',
    padding: 10,
    minWidth: 44,
    marginRight: 8,
  },
  pauseButton: {
    backgroundColor: '#e74c3c',
    marginRight: 8,
  },
  nextDayButton: {
    backgroundColor: '#2ecc71',
  },
  statsButton: {
    backgroundColor: '#9b59b6',
    padding: 10,
    minWidth: 44,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});
