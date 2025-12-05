import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import TimelineEvent from '../components/TimelineEvent';
import { LinearGradient } from 'expo-linear-gradient';

const BiographyScreen = ({ navigation }) => {
  const { character } = useCharacter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0f172a']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Хроника Жизни</Text>
            <Text style={styles.characterName}>{character.name || 'Безымянный'}</Text>
            <Text style={styles.lifespan}>
              {character.birthYear} - {character.birthYear + character.age}
            </Text>
            {!character.isAlive && (
              <Text style={styles.deathCause}>Причина смерти: {character.deathCause || 'Неизвестно'}</Text>
            )}
          </View>

          {character.history && character.history.length > 0 ? (
            character.history.map((event, index) => (
              <TimelineEvent key={index} event={event} />
            ))
          ) : (
            <Text style={styles.noHistoryText}>История этой жизни еще не написана.</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra space for back button
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  characterName: {
    fontSize: 22,
    color: '#cbd5e1',
  },
  lifespan: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  deathCause: {
    fontSize: 14,
    color: '#f87171',
    fontStyle: 'italic',
    marginTop: 8,
  },
  noHistoryText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BiographyScreen;
