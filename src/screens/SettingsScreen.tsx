// SettingsScreen.tsx - Экран настроек
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import audioService from '../services/AudioService';
import notificationService from '../services/NotificationService';
import cloudSaveService from '../services/CloudSaveService';
import analyticsService from '../services/AnalyticsService';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Main: undefined;
  Game: undefined;
  Settings: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  aiEnabled: boolean;
  notificationsEnabled?: boolean;
  analyticsEnabled?: boolean;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { gameState, updateSettings, resetProgress } = useGame();
  const [settings, setSettings] = useState<SettingsState>(
    gameState?.settings || {
      soundEnabled: true,
      musicEnabled: true,
      aiEnabled: true,
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
  );

  useEffect(() => {
    analyticsService.logScreenView('Settings');
  }, []);

  const handleToggle = async (key: keyof SettingsState, value: boolean): Promise<void> => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings(newSettings);

    // Применение настроек
    switch (key) {
      case 'soundEnabled':
        audioService.toggleSound(value);
        break;
      case 'musicEnabled':
        await audioService.toggleMusic(value);
        break;
      case 'notificationsEnabled':
        if (value) {
          await notificationService.scheduleDailyReminder();
        } else {
          await notificationService.cancelAllNotifications();
        }
        break;
      case 'analyticsEnabled':
        await analyticsService.setEnabled(value);
        break;
    }

    await audioService.playSoundEffect('button_click', true);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure? This will delete all your progress and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            await cloudSaveService.deleteCloudData();
            Alert.alert('Success', 'Progress has been reset.');
            navigation.navigate('Main');
          },
        },
      ],
    );
  };

  const handleSyncCloud = async () => {
    Alert.alert('Cloud Sync', 'Cloud save feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⚙️ Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Audio Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>🔊 Sound Effects</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => handleToggle('soundEnabled', value)}
                trackColor={{ false: '#374151', true: '#60a5fa' }}
                thumbColor={settings.soundEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>🎵 Background Music</Text>
              <Switch
                value={settings.musicEnabled}
                onValueChange={(value) => handleToggle('musicEnabled', value)}
                trackColor={{ false: '#374151', true: '#60a5fa' }}
                thumbColor={settings.musicEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Game Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🤖 AI Events</Text>
                <Text style={styles.settingDescription}>
                  Generate events using AI (requires API key)
                </Text>
              </View>
              <Switch
                value={settings.aiEnabled}
                onValueChange={(value) => handleToggle('aiEnabled', value)}
                trackColor={{ false: '#374151', true: '#60a5fa' }}
                thumbColor={settings.aiEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🔔 Daily Reminders</Text>
                <Text style={styles.settingDescription}>Get reminded to play every day</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => handleToggle('notificationsEnabled', value)}
                trackColor={{ false: '#374151', true: '#60a5fa' }}
                thumbColor={settings.notificationsEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>📊 Analytics</Text>
                <Text style={styles.settingDescription}>Help us improve the game</Text>
              </View>
              <Switch
                value={settings.analyticsEnabled}
                onValueChange={(value) => handleToggle('analyticsEnabled', value)}
                trackColor={{ false: '#374151', true: '#60a5fa' }}
                thumbColor={settings.analyticsEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Cloud Save */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cloud Save</Text>

            <TouchableOpacity style={styles.button} onPress={handleSyncCloud}>
              <Text style={styles.buttonText}>☁️ Sync with Cloud</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleResetProgress}
            >
              <Text style={styles.buttonText}>🗑️ Reset All Progress</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.infoText}>LifeSim GSL v1.0.0</Text>
            <Text style={styles.infoText}>Made with ❤️</Text>
          </View>
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#60a5fa',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  dangerTitle: {
    color: '#ef4444',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  button: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default SettingsScreen;
