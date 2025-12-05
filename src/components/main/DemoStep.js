import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_TIMELINE } from '../../data/timeline';

const DemoStep = ({ demoIndex, demoComplete, onSkip, onContinue }) => {
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
        <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
          <Text style={styles.secondaryButtonText}>Skip Demo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !demoComplete && styles.disabledButton,
          ]}
          disabled={!demoComplete}
          onPress={onContinue}
        >
          <Text style={styles.primaryButtonText}>I want my saga</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  disabledButton: { opacity: 0.6 },
});

export default DemoStep;
