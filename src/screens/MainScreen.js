import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../context/CharacterContext';

const MainScreen = ({ navigation }) => {
  const { character, createCharacter, loading } = useCharacter();
  const [name, setName] = useState('');

  const handleNewGame = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter a name.');
      return;
    }
    await createCharacter(name.trim());
    navigation.navigate('Game');
  };

  const handleContinue = () => {
    navigation.navigate('Game');
  };

  if (loading) {
    return <View style={styles.container}><Text style={styles.text}>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Life Simulator</Text>
      {character ? (
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue as {character.name}</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.button} onPress={handleNewGame}>
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  title: { fontSize: 32, color: '#fff', marginBottom: 40 },
  text: { color: '#fff' },
  input: { width: 250, height: 40, borderColor: '#555', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, color: '#fff', borderRadius: 5 },
  button: { backgroundColor: '#333', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default MainScreen;
