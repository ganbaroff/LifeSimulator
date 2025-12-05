import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TimelineEvent = ({ event }) => {
  const choiceMap = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
  };

  return (
    <View style={styles.container}>
      <View style={styles.ageCircle}>
        <Text style={styles.ageText}>{event.age}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.situationText}>{event.event.situation}</Text>
        <Text style={styles.choiceText}>
          Выбор {choiceMap[event.choice] || event.choice}: {event.event[event.choice]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  ageCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  ageText: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 18,
  },
  eventDetails: {
    flex: 1,
  },
  situationText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 5,
  },
  choiceText: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default TimelineEvent;
