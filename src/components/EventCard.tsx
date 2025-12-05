import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Event } from '../types';

type EventCardProps = {
  event: Event;
  onChoice: (choice: string) => void;
  disabled?: boolean;
  currentDay?: number;
};

const { width } = Dimensions.get('window');

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onChoice,
  disabled = false,
  currentDay = 1,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChoicePress = (choice: string) => {
    if (disabled) return;
    
    setSelectedChoice(choice);
    
    // Add haptic feedback animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Delay the callback to show the selection
    setTimeout(() => {
      onChoice(choice);
      setSelectedChoice(null);
    }, 300);
  };

  const getChoiceColor = (choice: string) => {
    if (selectedChoice === choice) return '#fbbf24';
    if (disabled) return '#6b7280';
    return '#3b82f6';
  };

  const getChoiceIcon = (choice: string) => {
    switch (choice) {
      case 'A': return 'looks-one';
      case 'B': return 'looks-two';
      case 'C': return 'looks-3';
      case 'D': return 'looks-4';
      default: return 'help';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.cardGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dayIndicator}>
            <Text style={styles.dayText}>Day {currentDay}</Text>
          </View>
          <View style={styles.eventType}>
            <Text style={styles.eventTypeText}>Life Event</Text>
          </View>
        </View>

        {/* Event Situation */}
        <View style={styles.situationContainer}>
          <Text style={styles.situationText}>{event.situation}</Text>
        </View>

        {/* Choices */}
        <View style={styles.choicesContainer}>
          {['A', 'B', 'C'].map((choice) => {
            const choiceText = event[choice as keyof Event] as string;
            if (!choiceText) return null;

            return (
              <TouchableOpacity
                key={choice}
                style={[
                  styles.choiceButton,
                  selectedChoice === choice && styles.selectedChoice,
                  disabled && styles.disabledChoice,
                ]}
                onPress={() => handleChoicePress(choice)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[getChoiceColor(choice), getChoiceColor(choice) + '80']}
                  style={styles.choiceGradient}
                >
                  <View style={styles.choiceContent}>
                    <View style={styles.choiceIcon}>
                      <Icon
                        name={getChoiceIcon(choice)}
                        size={20}
                        color="#ffffff"
                      />
                    </View>
                    <Text style={styles.choiceText}>{choiceText}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Choose wisely...</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginVertical: 10,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dayIndicator: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dayText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventType: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventTypeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  situationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  situationText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  selectedChoice: {
    elevation: 8,
    shadowOpacity: 0.4,
  },
  disabledChoice: {
    opacity: 0.5,
    elevation: 0,
  },
  choiceGradient: {
    padding: 16,
    borderRadius: 16,
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceIcon: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
