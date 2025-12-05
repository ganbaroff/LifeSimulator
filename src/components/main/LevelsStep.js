import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LevelsStep = ({
  playableLevels,
  gameState,
  handleStartLevel,
  formatDuration,
  formatPercent,
  formatCurrency,
}) => (
  <View style={styles.levelsContainer}>
    <Text style={styles.sectionTitle}>Dark Souls difficulty curve</Text>
    <Text style={styles.sectionSubtitle}>
      Finish a level to unlock the next. Level 6+ enables Pro Mode (real
      PMP/dev/med cases with Choice D grading).
    </Text>
    <View style={styles.levelGrid}>
      {playableLevels.map((level) => {
        const isLocked = !gameState?.unlockedLevels?.includes(level.id);
        const insufficientCrystals =
          (gameState?.crystals || 0) < (level.requiredCrystals || 0);
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
                <Text style={styles.levelStatValue}>
                  {formatDuration(level.duration)}
                </Text>
              </View>
              <View style={styles.levelStatRow}>
                <Text style={styles.levelStatLabel}>Risk (Choice C)</Text>
                <Text style={styles.levelStatValue}>
                  {formatPercent(level.deathChance)}
                </Text>
              </View>
              <View style={styles.levelStatRow}>
                <Text style={styles.levelStatLabel}>Historical density</Text>
                <Text style={styles.levelStatValue}>
                  {formatPercent(level.historicalDensity)}
                </Text>
              </View>
              <View style={styles.levelStatRow}>
                <Text style={styles.levelStatLabel}>Rewind</Text>
                <Text style={styles.levelStatValue}>
                  {formatCurrency(level.rewindPriceUSD)}
                </Text>
              </View>
              <View style={styles.levelStatRow}>
                <Text style={styles.levelStatLabel}>Reward</Text>
                <Text style={styles.levelStatValue}>+{level.rewardCrystals} 💎</Text>
              </View>
              {level.requiredCrystals > 0 && (
                <View style={styles.levelStatRow}>
                  <Text style={styles.levelStatLabel}>Crystals needed</Text>
                  <Text
                    style={[
                      styles.levelStatValue,
                      insufficientCrystals && styles.warningText,
                    ]}
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

const styles = StyleSheet.create({
    levelsContainer: {
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

export default LevelsStep;
