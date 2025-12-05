import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { generateEvent, checkCRiskOutcome } from '../services/AIEngine';

const GameScreen = ({ navigation }) => {
  const { character, updateAttributes, endCurrentCharacter, addEventToHistory } = useCharacter();
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleEndGame = useCallback((reason) => {
    Alert.alert('Game Over', reason, [
        { text: 'OK', onPress: () => { endCurrentCharacter(); navigation.goBack(); } },
    ]);
  }, [endCurrentCharacter, navigation]);

  const loadNextEvent = useCallback(async () => {
    if (!character) return;
    setLoading(true);
    try {
      const event = await generateEvent(character, null);
      setCurrentEvent(event);
    } catch (error) {
      handleEndGame('AI failed to generate an event.');
    } finally {
      setLoading(false);
    }
  }, [character, handleEndGame]);

  useEffect(() => {
    loadNextEvent();
  }, [loadNextEvent]);

  const handleChoice = async (choice) => {
    if (!currentEvent || loading || !character) return;

    setLoading(true);
    let outcome = checkCRiskOutcome(currentEvent.effects[choice]);
    const updatedChar = await updateAttributes(outcome.effects);
    
    if (updatedChar) {
        await addEventToHistory({ event: currentEvent, choice, effects: outcome.effects, age: updatedChar.age, timestamp: Date.now() });
        if (!updatedChar.isAlive) {
            handleEndGame(outcome.deathCause || 'You have died.');
        } else {
            loadNextEvent();
        }
    } 
    setLoading(false);
  };

  if (loading || !currentEvent || !character) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{character.name}, Age {character.age}</Text>
        <Text style={styles.headerText}>❤️{character.health} 😊{character.happiness} 🎓{character.skills} 💰${character.wealth}</Text>
      </View>
      <View style={styles.eventContainer}>
        <Text style={styles.situationText}>{currentEvent.situation}</Text>
        <TouchableOpacity style={styles.choiceButton} onPress={() => handleChoice('A')}><Text style={styles.choiceText}>{currentEvent.A}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.choiceButton} onPress={() => handleChoice('B')}><Text style={styles.choiceText}>{currentEvent.B}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.choiceButton} onPress={() => handleChoice('C')}><Text style={styles.choiceText}>{currentEvent.C}</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', paddingTop: 60, paddingHorizontal: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
    header: { marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
    headerText: { color: '#cbd5e1', textAlign: 'center', fontSize: 16, marginBottom: 10 },
    eventContainer: { flex: 1, justifyContent: 'center' },
    situationText: { color: '#f8fafc', fontSize: 22, textAlign: 'center', marginBottom: 40, lineHeight: 32 },
    choiceButton: { backgroundColor: '#1e293b', padding: 20, borderRadius: 10, marginBottom: 15 },
    choiceText: { color: '#e2e8f0', fontSize: 16, textAlign: 'center' },
});

export default GameScreen;
