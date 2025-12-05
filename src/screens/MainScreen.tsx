// MainScreen.tsx - Life Saga launcher (Demo -> Setup -> Level Select)
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useCharacter } from '../context/CharacterContext';
import { useGame, LEVELS } from '../context/GameContext';
import { generateRandomCharacterSeed } from '../services/CharacterService';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Main: undefined;
  Game: undefined;
  Settings: undefined;
};

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

interface FlowStep {
  id: string;
  label: string;
  description: string;
}

interface DemoTimelineItem {
  age: string;
  title: string;
  detail: string;
  icon: string;
  tone: [string, string];
}

interface CountryData {
  code: string;
  name: string;
  flag: string;
  hook: string;
  vibe: string;
}

interface Profession {
  id: string;
  label: string;
  requiresPro: boolean;
}

const FLOW_STEPS: FlowStep[] = [
  { id: 'demo', label: 'Demo', description: 'Watch the 0→40 rush' },
  { id: 'setup', label: 'Year & Origin', description: 'Lock your saga start' },
  { id: 'levels', label: 'Difficulty', description: 'Choose your pain' },
];

const DEMO_TIMELINE: DemoTimelineItem[] = [
  {
    age: 'Age 5',
    title: 'Music lessons vs. street football',
    detail: 'Parents push piano, friends want chaos. +10 skills, +10 happiness if you run outside.',
    icon: '🎒',
    tone: ['#38bdf8', '#0ea5e9'],
  },
  {
    age: 'Age 17',
    title: 'Skip school for the mall?',
    detail:
      'Cut class, meet the wrong crowd, maybe steal. Low risk, low reward — the demo keeps it tame.',
    icon: '🛹',
    tone: ['#a855f7', '#7c3aed'],
  },
  {
    age: 'Age 28',
    title: 'Startup vs. safe salary',
    detail: '1998 Russia default hits. Boring job = survival, hustle = wealth with 30% burnout.',
    icon: '🚬',
    tone: ['#f97316', '#ea580c'],
  },
  {
    age: 'Age 40',
    title: 'Rewind or die trying',
    detail: 'Risky C-choice shows death, rewind teases the paywall. Welcome to Life Saga.',
    icon: '💀',
    tone: ['#f43f5e', '#be123c'],
  },
];

const COUNTRY_DATA: CountryData[] = [
  {
    code: 'USA',
    name: 'USA',
    flag: '🇺🇸',
    hook: 'Boom & bust cycles',
    vibe: 'Silicon Valley + riots',
  },
  {
    code: 'Russia',
    name: 'Russia',
    flag: '🇷🇺',
    hook: 'Collapse & oligarchs',
    vibe: 'Vodka, war, winters',
  },
  {
    code: 'China',
    name: 'China',
    flag: '🇨🇳',
    hook: 'Dynasty to superpower',
    vibe: 'Planning & revolution',
  },
  {
    code: 'India',
    name: 'India',
    flag: '🇮🇳',
    hook: 'License Raj to IT boom',
    vibe: 'Chaos, color, jugaad',
  },
  {
    code: 'Germany',
    name: 'Germany',
    flag: '🇩🇪',
    hook: 'Hyperinflation & order',
    vibe: 'War scars + engineering',
  },
  {
    code: 'Japan',
    name: 'Japan',
    flag: '🇯🇵',
    hook: 'Miracle → Lost decade',
    vibe: 'Discipline, disaster, neon',
  },
  {
    code: 'Brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    hook: 'Coup to carnival',
    vibe: 'Favela hustle, rainforest luck',
  },
  { code: 'UK', name: 'UK', flag: '🇬🇧', hook: 'Empire hangover', vibe: 'Punk, fog, finance' },
  {
    code: 'France',
    name: 'France',
    flag: '🇫🇷',
    hook: 'Revolutions forever',
    vibe: 'Art, strikes, wine',
  },
  {
    code: 'Nigeria',
    name: 'Nigeria',
    flag: '🇳🇬',
    hook: 'Oil & insurgency',
    vibe: 'Afrobeats vs. corruption',
  },
];

const PROFESSIONS: Profession[] = [
  { id: 'none', label: 'No profession (Levels 1-5)', requiresPro: false },
  { id: 'Programmer', label: 'Programmer', requiresPro: true },
  { id: 'PMP', label: 'Project Manager (PMP)', requiresPro: true },
  { id: 'Doctor', label: 'Doctor', requiresPro: true },
  { id: 'Entrepreneur', label: 'Entrepreneur', requiresPro: true },
  { id: 'Teacher', label: 'Teacher', requiresPro: true },
];

const randomYearOffset = (): number => Math.floor(Math.random() * 11) - 5;
const clampYear = (value: number): number => Math.min(2025, Math.max(1850, value));
const formatDuration = (seconds: number): string => {
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};
const formatPercent = (value: number): string => `${Math.round((value || 0) * 100)}%`;
const formatCurrency = (value: number): string => (value ? `$${value.toFixed(2)}` : '—');

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { character, createCharacter, loading: charLoading } = useCharacter();
  const { gameState, startLevel, loading: gameLoading } = useGame();

  const [flowStep, setFlowStep] = useState<string>('demo');
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [demoComplete, setDemoComplete] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [country, setCountry] = useState<string>(COUNTRY_DATA[0].code);
  const [profession, setProfession] = useState<string>('none');
  const [yearBase, setYearBase] = useState<number>(2000);
  const [yearOffset, setYearOffset] = useState<number>(randomYearOffset());
  const [savingCharacter, setSavingCharacter] = useState<boolean>(false);
  const [hasCreatedCharacter, setHasCreatedCharacter] = useState<boolean>(false);

  const actualYear = useMemo(() => clampYear(yearBase + yearOffset), [yearBase, yearOffset]);

  useEffect(() => {
    if (!charLoading && character?.name) {
      setName(character.name);
      setCountry(character.country || country);
      setYearBase(character.birthYear || yearBase);
      setYearOffset(0);
      setHasCreatedCharacter(true);
      setFlowStep('levels');
    }
  }, [charLoading, character]);

  useEffect(() => {
    if (flowStep !== 'demo') return;
    setDemoComplete(false);
    setDemoIndex(0);
    const timer = setInterval(() => {
      setDemoIndex((prev) => {
        if (prev >= DEMO_TIMELINE.length - 1) {
          clearInterval(timer);
          setDemoComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [flowStep]);

  const countryMeta = useMemo(
    () => COUNTRY_DATA.find((c) => c.code === country) || COUNTRY_DATA[0],
    [country],
  );

  const playableLevels = useMemo(
    () => Object.values(LEVELS).filter((lvl) => lvl.id !== 'demo'),
    [],
  );
  const proUnlocked = useMemo(
    () => (gameState?.unlockedLevels || []).includes('level_6'),
    [gameState?.unlockedLevels],
  );

  const handleSkipDemo = () => {
    setDemoComplete(true);
    setFlowStep('setup');
  };

  const handleSetupContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Name missing', 'Give your saga a name.');
      return;
    }
    setSavingCharacter(true);
    try {
      await createCharacter(name.trim());
      setHasCreatedCharacter(true);
      setFlowStep('levels');
    } catch (error) {
      Alert.alert('Failed to save', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSavingCharacter(false);
    }
  };

  const handleRandomize = () => {
    const seed = generateRandomCharacterSeed({ proUnlocked });
    setName(seed.name);
    setCountry(seed.country);
    setYearBase(seed.yearBase);
    setYearOffset(randomYearOffset());
    setProfession(seed.profession);
  };

  const handleStartLevel = async (levelId: string) => {
    if (!hasCreatedCharacter) {
      Alert.alert('Finish setup', 'Choose your year, country, and name first.');
      setFlowStep('setup');
      return;
    }
    try {
      await startLevel(levelId);
      navigation.navigate('Game');
    } catch (error) {
      Alert.alert('Cannot start', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex((step) => step.id === flowStep);

  const FlowStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {FLOW_STEPS.map((step, index) => {
        const isActive = flowStep === step.id;
        const isCompleted = index < currentStepIndex;
        return (
          <View key={step.id} style={styles.stepIndicatorItem}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleDone,
              ]}
            >
              <Text style={styles.stepCircleText}>{isCompleted ? '✓' : index + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        );
      })}
    </View>
  );

  const renderDemoStep = () => {
    const progress = ((demoIndex + 1) / DEMO_TIMELINE.length) * 100;
    return (
      <View style={styles.demoContainer}>
        <Text style={styles.sectionTitle}>5-minute auto demo</Text>
        <Text style={styles.sectionSubtitle}>
          0 → 40 years in 4 cards. Avatar ages, death is real, Rewind teases you.
        </Text>
        <View style={styles.demoProgressBar}>
          <View style={[styles.demoProgressFill, { width: `${progress}%` }]} />
        </View>
        {DEMO_TIMELINE.map((event, index) => {
          const isActive = index === demoIndex;
          const isPast = index < demoIndex;
          return (
            <LinearGradient
              key={event.age}
              colors={event.tone}
              style={[
                styles.demoEventCard,
                isActive && styles.demoEventCardActive,
                isPast && styles.demoEventCardPast,
              ]}
            >
              <View style={styles.demoEventHeader}>
                <Text style={styles.demoEventIcon}>{event.icon}</Text>
                <Text style={styles.demoEventAge}>{event.age}</Text>
              </View>
              <Text style={styles.demoEventTitle}>{event.title}</Text>
              <Text style={styles.demoEventDetail}>{event.detail}</Text>
            </LinearGradient>
          );
        })}
        <View style={styles.demoActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipDemo}>
            <Text style={styles.secondaryButtonText}>Skip Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, !demoComplete && styles.disabledButton]}
            disabled={!demoComplete}
            onPress={() => setFlowStep('setup')}
          >
            <Text style={styles.primaryButtonText}>I want my saga</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSetupStep = () => (
    <View style={styles.setupContainer}>
      <Text style={styles.sectionTitle}>Choose your origin</Text>
      <Text style={styles.sectionSubtitle}>
        Slider snaps every 10 years, Life Saga adds ±5 years chaos automatically.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Callsign</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Morgan Blackwater"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.randomizeRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRandomize}>
          <Text style={styles.secondaryButtonText}>Randomize character</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Birth year</Text>
        <Slider
          style={styles.slider}
          minimumValue={1850}
          maximumValue={2025}
          step={10}
          minimumTrackTintColor="#8b5cf6"
          maximumTrackTintColor="#1e293b"
          thumbTintColor="#a855f7"
          value={yearBase}
          onValueChange={(value) => {
            setYearBase(value);
            setYearOffset(randomYearOffset());
          }}
        />
        <View style={styles.yearRow}>
          <Text style={styles.yearBaseText}>Base: {yearBase}</Text>
          <TouchableOpacity
            style={styles.shuffleButton}
            onPress={() => setYearOffset(randomYearOffset())}
          >
            <Text style={styles.shuffleButtonText}>Randomize ±5</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.actualYearText}>
          Actual start year: <Text style={styles.highlightedText}>{actualYear}</Text>
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Country</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
          {COUNTRY_DATA.map((item) => {
            const isSelected = country === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.countryCard, isSelected && styles.countryCardSelected]}
                onPress={() => setCountry(item.code)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
                  {item.name}
                </Text>
                <Text style={styles.countryHook}>{item.hook}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.countryInfoBox}>
          <Text style={styles.countryInfoTitle}>
            {countryMeta.flag} {countryMeta.name}
          </Text>
          <Text style={styles.countryInfoText}>{countryMeta.vibe}</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Profession (Levels 6+ unlock Pro mode)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.professionScroll}
        >
          {PROFESSIONS.map((item) => {
            const locked = item.requiresPro && !proUnlocked;
            const isSelected = profession === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.professionChip,
                  isSelected && styles.professionChipSelected,
                  locked && styles.professionChipLocked,
                ]}
                onPress={() => !locked && setProfession(item.id)}
              >
                <Text style={[styles.professionText, isSelected && styles.professionTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, savingCharacter && styles.disabledButton]}
        onPress={handleSetupContinue}
        disabled={savingCharacter}
      >
        <Text style={styles.primaryButtonText}>
          {savingCharacter ? 'Saving...' : 'Lock my saga'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLevelsStep = () => (
    <View style={styles.levelsContainer}>
      <Text style={styles.sectionTitle}>Dark Souls difficulty curve</Text>
      <Text style={styles.sectionSubtitle}>
        Finish a level to unlock the next. Level 6+ enables Pro Mode (real PMP/dev/med cases with
        Choice D grading).
      </Text>
      <View style={styles.levelGrid}>
        {playableLevels.map((level) => {
          const isLocked = !gameState?.unlockedLevels?.includes(level.id);
          const insufficientCrystals = (gameState?.crystals || 0) < (level.requiredCrystals || 0);
          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.levelCard, isLocked && styles.levelCardLocked]}
              onPress={() => !isLocked && handleStartLevel(level.id)}
              activeOpacity={0.85}
              disabled={isLocked}
            >
              <LinearGradient
                colors={isLocked ? ['#1f2937', '#111827'] : ['#3b82f6', '#1d4ed8']}
                style={styles.levelGradient}
              >
                <View style={styles.levelHeaderRow}>
                  <View>
                    <Text style={styles.levelName}>{level.name}</Text>
                    <Text style={styles.levelSubtitle}>
                      {level.proMode ? 'Professional mode' : 'Story mode'}
                    </Text>
                  </View>
                  {isLocked ? (
                    <Text style={styles.lockIcon}>🔒</Text>
                  ) : (
                    <Text style={styles.lockIcon}>▶</Text>
                  )}
                </View>

                <View style={styles.levelStatRow}>
                  <Text style={styles.levelStatLabel}>Time</Text>
                  <Text style={styles.levelStatValue}>{formatDuration(level.duration)}</Text>
                </View>
                <View style={styles.levelStatRow}>
                  <Text style={styles.levelStatLabel}>Risk (Choice C)</Text>
                  <Text style={styles.levelStatValue}>{formatPercent(level.deathChance)}</Text>
                </View>
                <View style={styles.levelStatRow}>
                  <Text style={styles.levelStatLabel}>Historical density</Text>
                  <Text style={styles.levelStatValue}>
                    {formatPercent(level.historicalDensity)}
                  </Text>
                </View>
                <View style={styles.levelStatRow}>
                  <Text style={styles.levelStatLabel}>Rewind</Text>
                  <Text style={styles.levelStatValue}>{formatCurrency(level.rewindPriceUSD)}</Text>
                </View>
                <View style={styles.levelStatRow}>
                  <Text style={styles.levelStatLabel}>Reward</Text>
                  <Text style={styles.levelStatValue}>+{level.rewardCrystals} 💎</Text>
                </View>
                {level.requiredCrystals > 0 && (
                  <View style={styles.levelStatRow}>
                    <Text style={styles.levelStatLabel}>Crystals needed</Text>
                    <Text
                      style={[styles.levelStatValue, insufficientCrystals && styles.warningText]}
                    >
                      {level.requiredCrystals}
                    </Text>
                  </View>
                )}
                <Text style={styles.perkText}>{level.perks}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (charLoading || gameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0f172a']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Life Saga</Text>
              <Text style={styles.subtitle}>One life. One chance. One Rewind.</Text>
            </View>
            <TouchableOpacity style={styles.replayButton} onPress={() => setFlowStep('demo')}>
              <Text style={styles.replayButtonText}>Replay demo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.crystalDisplay}>
              <Text style={styles.crystalIcon}>💎</Text>
              <Text style={styles.crystalCount}>{gameState?.crystals ?? 0} Crystals</Text>
            </View>
            <TouchableOpacity
              style={styles.leaderboardButton}
              onPress={() =>
                Alert.alert('Leaderboards', 'Global leaderboards arrive in the next build.')
              }
            >
              <Text style={styles.leaderboardText}>Leaderboards</Text>
            </TouchableOpacity>
          </View>

          <FlowStepIndicator />

          <View style={styles.stepContent}>
            {flowStep === 'demo' && renderDemoStep()}
            {flowStep === 'setup' && renderSetupStep()}
            {flowStep === 'levels' && renderLevelsStep()}
          </View>
        </ScrollView>
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
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  loadingText: { color: '#f8fafc', fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 1,
  },
  subtitle: { color: '#f87171', marginTop: 6, letterSpacing: 1 },
  replayButton: {
    borderColor: '#f8fafc',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  replayButtonText: { color: '#f8fafc', fontSize: 12, fontWeight: '600' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  crystalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  crystalIcon: { fontSize: 20, marginRight: 8 },
  crystalCount: { color: '#60a5fa', fontWeight: '700' },
  leaderboardButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#a855f7',
  },
  leaderboardText: {
    color: '#f8fafc',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  stepIndicatorItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: { borderColor: '#fbbf24' },
  stepCircleDone: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  stepCircleText: { color: '#f8fafc', fontWeight: '700' },
  stepLabel: { color: '#f8fafc', fontWeight: '700', marginBottom: 2 },
  stepDescription: { color: '#94a3b8', fontSize: 11, textAlign: 'center' },
  stepContent: { gap: 24 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  demoContainer: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
  },
  demoProgressBar: {
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 999,
    marginBottom: 16,
  },
  demoProgressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 999,
  },
  demoEventCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    opacity: 0.4,
  },
  demoEventCardActive: { opacity: 1, borderWidth: 1.5, borderColor: '#fbbf24' },
  demoEventCardPast: { opacity: 0.8 },
  demoEventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  demoEventIcon: { fontSize: 20, marginRight: 8 },
  demoEventAge: { color: '#f8fafc', fontWeight: '700' },
  demoEventTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  demoEventDetail: { color: '#f8fafc', opacity: 0.85, marginTop: 4 },
  demoActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    flex: 1,
    borderColor: '#94a3b8',
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#94a3b8', fontWeight: '600' },
  randomizeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  disabledButton: { opacity: 0.6 },
  setupContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#94a3b8', marginBottom: 6, fontWeight: '600' },
  textInput: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    fontSize: 16,
  },
  slider: { width: '100%', height: 40 },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  yearBaseText: { color: '#94a3b8', fontSize: 14 },
  shuffleButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#a855f7',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  shuffleButtonText: { color: '#a855f7', fontSize: 12, fontWeight: '700' },
  actualYearText: { color: '#f8fafc', marginTop: 6 },
  highlightedText: { color: '#fbbf24', fontWeight: '700' },
  countryScroll: { marginTop: 8 },
  countryCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#111827',
  },
  countryCardSelected: { borderWidth: 2, borderColor: '#fbbf24' },
  countryFlag: { fontSize: 24, marginBottom: 6 },
  countryName: { color: '#94a3b8', fontWeight: '600' },
  countryNameSelected: { color: '#f8fafc' },
  countryHook: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  countryInfoBox: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
  },
  countryInfoTitle: { color: '#f8fafc', fontWeight: '700', marginBottom: 4 },
  countryInfoText: { color: '#94a3b8' },
  professionScroll: { marginTop: 8 },
  professionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginRight: 10,
  },
  professionChipSelected: { borderColor: '#22c55e', backgroundColor: '#1f2937' },
  professionChipLocked: { opacity: 0.4 },
  professionText: { color: '#94a3b8' },
  professionTextSelected: { color: '#22c55e', fontWeight: '700' },
  levelsContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
  },
  levelGrid: { gap: 16 },
  levelCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  levelCardLocked: { opacity: 0.6 },
  levelGradient: { padding: 18 },
  levelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelName: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  levelSubtitle: { color: '#cbd5f5', fontSize: 12 },
  lockIcon: { color: '#f8fafc', fontSize: 18 },
  levelStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelStatLabel: { color: '#cbd5f5', fontSize: 12 },
  levelStatValue: { color: '#f8fafc', fontWeight: '700' },
  warningText: { color: '#f87171' },
  perkText: {
    marginTop: 8,
    color: '#fbbf24',
    fontStyle: 'italic',
  },
});

export default MainScreen;
