// EventCard.js - Карточка события с выбором A/B/C/D
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const EventCard = ({ event, onChoice, disabled = false }) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!event) return null;

  const choiceColors = { A: ['#22c55e', '#16a34a'], B: ['#3b82f6', '#2563eb'], C: ['#ef4444', '#dc2626'], D: ['#8b5cf6', '#7c3aed'] };
  const choiceIcons = { A: '🛡️', B: '⚖️', C: '🎲', D: '✍️' };

  const handleCustomChoice = () => {
    if (!customInput.trim()) {
      Alert.alert('Error', 'Please enter your choice');
      return;
    }
    onChoice('D', customInput.trim());
    setCustomInput('');
    setShowCustomInput(false);
  };

  const SuggestedChoices = () => (
    event.suggested_d_choices && event.suggested_d_choices.length > 0 && (
        <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedTitle}>AI-подсказки:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {event.suggested_d_choices.map((suggestion, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionChip}
                    onPress={() => setCustomInput(suggestion)}
                >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
            ))}
            </ScrollView>
        </View>
    )
  );

  const ChoiceButton = ({ choice, text }) => (
    <TouchableOpacity style={styles.choiceButton} onPress={() => onChoice(choice)} disabled={disabled} activeOpacity={0.8}>
      <LinearGradient colors={choiceColors[choice]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.choiceGradient}>
        <View style={styles.choiceHeader}>
          <Text style={styles.choiceIcon}>{choiceIcons[choice]}</Text>
          <Text style={styles.choiceLabel}>Choice {choice}</Text>
        </View>
        <Text style={styles.choiceText}>{text}</Text>
        {event.effects && event.effects[choice] && <View style={styles.effectsPreview}>{renderEffects(event.effects[choice])}</View>}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEffects = (effects) => {
    const effectItems = [];
    if (effects.health) effectItems.push(<Text key="health" style={styles.effectText}>❤️ {effects.health > 0 ? '+' : ''}{effects.health}</Text>);
    if (effects.happiness) effectItems.push(<Text key="happiness" style={styles.effectText}>😊 {effects.happiness > 0 ? '+' : ''}{effects.happiness}</Text>);
    if (effects.wealth) effectItems.push(<Text key="wealth" style={styles.effectText}>💰 {effects.wealth > 0 ? '+' : ''}${effects.wealth}</Text>);
    if (effects.skills) effectItems.push(<Text key="skills" style={styles.effectText}>🎓 {effects.skills > 0 ? '+' : ''}{effects.skills}</Text>);
    if (effects.deathChance) effectItems.push(<Text key="death" style={[styles.effectText, styles.deathWarning]}>☠️ {Math.floor(effects.deathChance * 100)}% risk</Text>);
    return effectItems;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.situationContainer}>
        <Text style={styles.situationLabel}>Life Event</Text>
        <Text style={styles.situationText}>{event.situation}</Text>
        {event.source && <View style={styles.sourceTag}><Text style={styles.sourceText}>{event.source === 'gemini' ? '🤖 AI Generated' : '📋 Fallback'}</Text></View>}
      </View>

      <View style={styles.choicesContainer}>
        <Text style={styles.choicesTitle}>Choose your path:</Text>
        <ChoiceButton choice="A" text={event.A} />
        <ChoiceButton choice="B" text={event.B} />
        <ChoiceButton choice="C" text={event.C} />

        {!showCustomInput ? (
          <TouchableOpacity style={styles.choiceButton} onPress={() => setShowCustomInput(true)} disabled={disabled} activeOpacity={0.8}>
            <LinearGradient colors={choiceColors.D} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.choiceGradient}>
              <View style={styles.choiceHeader}>
                <Text style={styles.choiceIcon}>{choiceIcons.D}</Text>
                <Text style={styles.choiceLabel}>Choice D</Text>
              </View>
              <Text style={styles.choiceText}>{event.D || 'Свой вариант... '}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.customInputContainer}>
            <TextInput style={styles.customInput} placeholder="Введите ваш выбор..." placeholderTextColor="#64748b" value={customInput} onChangeText={setCustomInput} multiline autoFocus />
            <SuggestedChoices />
            <View style={styles.customButtonsRow}>
              <TouchableOpacity style={[styles.customButton, styles.cancelButton]} onPress={() => { setShowCustomInput(false); setCustomInput(''); }}><Text style={styles.customButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.customButton, styles.submitButton]} onPress={handleCustomChoice}><Text style={styles.customButtonText}>Submit</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>Choice C carries high risk. Rewards are greater, but so are the consequences.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    situationContainer: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 3 },
    situationLabel: { fontSize: 12, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    situationText: { fontSize: 18, lineHeight: 26, color: '#f8fafc', fontWeight: '500' },
    sourceTag: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    sourceText: { fontSize: 11, color: '#64748b' },
    choicesContainer: { gap: 12 },
    choicesTitle: { fontSize: 16, fontWeight: '600', color: '#f8fafc', marginBottom: 8 },
    choiceButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
    choiceGradient: { padding: 16 },
    choiceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    choiceIcon: { fontSize: 20, marginRight: 8 },
    choiceLabel: { fontSize: 14, fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1 },
    choiceText: { fontSize: 15, lineHeight: 22, color: '#ffffff', marginBottom: 8 },
    effectsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' },
    effectText: { fontSize: 12, fontWeight: '600', color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    deathWarning: { backgroundColor: '#7f1d1d' },
    warningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#422006', padding: 12, borderRadius: 8, marginTop: 16 },
    warningIcon: { fontSize: 20, marginRight: 8 },
    warningText: { flex: 1, fontSize: 12, color: '#fbbf24', lineHeight: 18 },
    customInputContainer: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#8b5cf6' },
    customInput: { backgroundColor: '#0f172a', color: '#f8fafc', fontSize: 16, padding: 12, borderRadius: 8, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
    customButtonsRow: { flexDirection: 'row', gap: 12 },
    customButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#475569' },
    submitButton: { backgroundColor: '#8b5cf6' },
    customButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    suggestedContainer: { marginVertical: 10 },
    suggestedTitle: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
    suggestionChip: { backgroundColor: '#334155', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, marginRight: 10 },
    suggestionText: { color: '#f1f5f9', fontSize: 14 },
});

export default EventCard;
