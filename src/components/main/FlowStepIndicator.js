import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FlowStepIndicator = ({ steps, currentStepId }) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <View style={styles.stepIndicatorContainer}>
      {steps.map((step, index) => {
        const isActive = currentStepId === step.id;
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
              <Text style={styles.stepCircleText}>
                {isCompleted ? '✓' : index + 1}
              </Text>
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default FlowStepIndicator;
