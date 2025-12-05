import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Activity } from '../store/slices/activitiesSlice';

type ActivityModalProps = {
  visible: boolean;
  activity: Activity | null;
  progress: { progress: number; timeRemaining: number };
  onCancel: () => void;
};

export const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  activity,
  progress,
  onCancel,
}) => {
  if (!activity) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{activity.name}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, Math.max(0, progress.progress))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {formatTime(progress.timeRemaining)} remaining
            </Text>
          </View>

          <View style={styles.effectsContainer}>
            <Text style={styles.sectionTitle}>Effects:</Text>
            {Object.entries(activity.effects).map(([key, value]) => (
              <View key={key} style={styles.effectRow}>
                <Text style={styles.effectKey}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </Text>
                <Text
                  style={[
                    styles.effectValue,
                    { color: value >= 0 ? '#2ecc71' : '#e74c3c' },
                  ]}
                >
                  {value >= 0 ? '+' : ''}
                  {value}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel Activity</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#34495e',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  progressText: {
    color: '#bdc3c7',
    textAlign: 'center',
    fontSize: 12,
  },
  effectsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  effectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  effectKey: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  effectValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
