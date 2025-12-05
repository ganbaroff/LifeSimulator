import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { COUNTRY_DATA } from '../../data/countries';
import { PROFESSIONS } from '../../data/professions';
import { LIFE_GOALS } from '../../data/goals';

const SetupStep = ({
  name,
  setName,
  yearBase,
  setYearBase,
  yearOffset,
  setYearOffset,
  actualYear,
  country,
  setCountry,
  countryMeta,
  profession,
  setProfession,
  proUnlocked,
  lifeGoal,
  setLifeGoal,
  savingCharacter,
  onContinue,
}) => {
  const randomYearOffset = () => Math.floor(Math.random() * 11) - 5;

  return (
    <View style={styles.setupContainer}>
      <Text style={styles.sectionTitle}>Choose your origin</Text>
      <Text style={styles.sectionSubtitle}>
        Your starting year and country influence the entire saga.
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.countryScroll}
        >
          {COUNTRY_DATA.map((item) => {
            const isSelected = country === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.countryCard,
                  isSelected && styles.countryCardSelected,
                ]}
                onPress={() => setCountry(item.code)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text
                  style={[
                    styles.countryName,
                    isSelected && styles.countryNameSelected,
                  ]}
                >
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
        <Text style={styles.inputLabel}>Life Goal</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.countryScroll}
        >
          {LIFE_GOALS.map((item) => {
            const isSelected = lifeGoal === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                onPress={() => setLifeGoal(item.id)}
              >
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalDescription}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Profession (Levels 6+ unlock Pro mode)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.professionScroll}>
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
                <Text
                  style={[
                    styles.professionText,
                    isSelected && styles.professionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          savingCharacter && styles.disabledButton,
        ]}
        onPress={onContinue}
        disabled={savingCharacter}
      >
        <Text style={styles.primaryButtonText}>
          {savingCharacter ? 'Saving...' : 'Lock my saga'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  setupContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
  },
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
  goalCard: {
    width: 150,
    marginRight: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#111827',
    justifyContent: 'space-between',
  },
  goalCardSelected: { borderWidth: 2, borderColor: '#22c55e' },
  goalTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  goalDescription: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
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
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10, // Added margin
  },
  primaryButtonText: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
  disabledButton: { opacity: 0.6 },
});

export default SetupStep;
