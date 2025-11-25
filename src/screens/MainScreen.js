// MainScreen.js - Главный экран: создание персонажа и выбор уровня
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCharacter } from '../context/CharacterContext';
import { useGame, LEVELS } from '../context/GameContext';

const COUNTRIES = ['USA', 'Russia', 'China', 'India', 'Germany', 'Japan', 'Brazil', 'UK', 'France', 'Canada'];
const PROFESSIONS = ['PMP', 'Programmer', 'Doctor', 'Teacher', 'Engineer', 'Artist', 'Business Owner', 'None'];

const MainScreen = ({ navigation }) => {
  const { character, createCharacter, loading: charLoading } = useCharacter();
  const { gameState, startLevel, loading: gameLoading } = useGame();

  const [showCreation, setShowCreation] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('USA');
  const [birthYear, setBirthYear] = useState('2000');
  const [profession, setProfession] = useState('Programmer');

  useEffect(() => {
    // Если персонажа нет, показываем форму создания
    if (!charLoading && !character.name) {
      setShowCreation(true);
    }
  }, [character, charLoading]);

  // Создание персонажа
  const handleCreateCharacter = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    const year = parseInt(birthYear);
    if (year < 1850 || year > 2025) {
      alert('Birth year must be between 1850 and 2025');
      return;
    }

    await createCharacter(name, country, year, profession);
    setShowCreation(false);
  };

  // Начать уровень
  const handleStartLevel = async (levelId) => {
    try {
      await startLevel(levelId);
      navigation.navigate('Game');
    } catch (error) {
      alert(error.message);
    }
  };

  // Рендер карточки уровня
  const LevelCard = ({ levelId, levelData }) => {
    const isLocked = !gameState.unlockedLevels.includes(levelId);
    const levelNumber = levelId === 'demo' ? 0 : parseInt(levelId.split('_')[1]);

    return (
      <TouchableOpacity
        style={[styles.levelCard, isLocked && styles.levelCardLocked]}
        onPress={() => !isLocked && handleStartLevel(levelId)}
        disabled={isLocked}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isLocked ? ['#334155', '#1e293b'] : ['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelGradient}
        >
          <View style={styles.levelHeader}>
            <Text style={styles.levelName}>{levelData.name}</Text>
            {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
          </View>

          <View style={styles.levelStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⏱️ Duration:</Text>
              <Text style={styles.statValue}>{Math.floor(levelData.duration / 60)}min</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>☠️ Risk:</Text>
              <Text style={styles.statValue}>{Math.floor(levelData.deathChance * 100)}%</Text>
            </View>
            {levelData.requiredCrystals > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>💎 Required:</Text>
                <Text style={[
                  styles.statValue,
                  gameState.crystals < levelData.requiredCrystals && styles.insufficientCrystals
                ]}>
                  {levelData.requiredCrystals}
                </Text>
              </View>
            )}
          </View>

          {!isLocked && (
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶ Play</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (charLoading || gameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>LifeSim GSL</Text>
          <Text style={styles.subtitle}>18+ Dark Realism Life Simulator</Text>
        </View>

        {/* Информация о персонаже */}
        {character.name && (
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterDetails}>
              Born {character.birthYear} in {character.country}
            </Text>
            <View style={styles.crystalDisplay}>
              <Text style={styles.crystalIcon}>💎</Text>
              <Text style={styles.crystalCount}>{gameState.crystals} Crystals</Text>
            </View>
          </View>
        )}

        {/* Список уровней */}
        <ScrollView style={styles.levelsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Choose Level</Text>
          
          {Object.entries(LEVELS).map(([key, levelData]) => (
            <LevelCard key={key} levelId={levelData.id} levelData={levelData} />
          ))}

          {/* Кнопка новой игры */}
          {character.name && (
            <TouchableOpacity
              style={styles.newGameButton}
              onPress={() => setShowCreation(true)}
            >
              <Text style={styles.newGameText}>🔄 New Character</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Модальное окно создания персонажа */}
        <Modal
          visible={showCreation}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Your Character</Text>

              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Country</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.optionButton, country === c && styles.optionButtonSelected]}
                    onPress={() => setCountry(c)}
                  >
                    <Text style={[styles.optionText, country === c && styles.optionTextSelected]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Birth Year (1850-2025)</Text>
              <TextInput
                style={styles.input}
                placeholder="2000"
                placeholderTextColor="#64748b"
                value={birthYear}
                onChangeText={setBirthYear}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Profession</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {PROFESSIONS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.optionButton, profession === p && styles.optionButtonSelected]}
                    onPress={() => setProfession(p)}
                  >
                    <Text style={[styles.optionText, profession === p && styles.optionTextSelected]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.createButton} onPress={handleCreateCharacter}>
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createGradient}
                >
                  <Text style={styles.createButtonText}>Create Character</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    fontSize: 18,
    color: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    letterSpacing: 1,
  },
  characterInfo: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  characterDetails: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  crystalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  crystalIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  crystalCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#60a5fa',
  },
  levelsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 16,
  },
  levelCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  levelCardLocked: {
    opacity: 0.6,
  },
  levelGradient: {
    padding: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  lockIcon: {
    fontSize: 24,
  },
  levelStats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  insufficientCrystals: {
    color: '#ef4444',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  newGameButton: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  newGameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#f8fafc',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 8,
  },
  optionsScroll: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  optionText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  createGradient: {
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default MainScreen;
