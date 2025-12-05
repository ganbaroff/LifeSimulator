import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';
// Default language settings
const DEFAULT_LANGUAGE = 'ru';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
];

const THEMES = [
  { id: 'light', name: 'Светлая' },
  { id: 'dark', name: 'Темная' },
  { id: 'system', name: 'Как в системе' },
];

const SettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    notifications: true,
    language: 'ru',
    theme: 'system',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Set default language based on device settings
        const deviceLanguage = Localization.getLocales()[0]?.languageCode?.split('-')[0] || 'en';
        const defaultSettings = {
          ...settings,
          language: LANGUAGES.some(lang => lang.code === deviceLanguage) ? deviceLanguage : 'en'
        };
        setSettings(defaultSettings);
        await AsyncStorage.setItem('app_settings', JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      // Here you would typically update your app's theme, language, etc.
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const handleToggle = (setting: keyof typeof settings) => {
    if (typeof settings[setting] === 'boolean') {
      saveSettings({
        ...settings,
        [setting]: !settings[setting]
      });
    }
  };

  const handleLanguageSelect = (language: string) => {
    saveSettings({
      ...settings,
      language
    });
  };

  const handleThemeSelect = (theme: string) => {
    saveSettings({
      ...settings,
      theme
    });
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Сбросить прогресс',
      'Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сбросить', 
          style: 'destructive',
          onPress: () => {
            // Handle reset progress
            Alert.alert('Готово', 'Прогресс успешно сброшен');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Настройки</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Звук и музыка</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="volume-up" size={24} color="#4cc9f0" />
              <Text style={styles.settingText}>Звук</Text>
            </View>
            <Switch
              value={settings.sound}
              onValueChange={() => handleToggle('sound')}
              trackColor={{ false: '#767577', true: '#4cc9f0' }}
              thumbColor={settings.sound ? '#f8f9fa' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="music-note" size={24} color="#4cc9f0" />
              <Text style={styles.settingText}>Музыка</Text>
            </View>
            <Switch
              value={settings.music}
              onValueChange={() => handleToggle('music')}
              trackColor={{ false: '#767577', true: '#4cc9f0' }}
              thumbColor={settings.music ? '#f8f9fa' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="notifications" size={24} color="#4cc9f0" />
              <Text style={styles.settingText}>Уведомления</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => handleToggle('notifications')}
              trackColor={{ false: '#767577', true: '#4cc9f0' }}
              thumbColor={settings.notifications ? '#f8f9fa' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Язык</Text>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity 
              key={lang.code}
              style={[
                styles.languageItem,
                settings.language === lang.code && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <Text style={styles.languageText}>{lang.name}</Text>
              {settings.language === lang.code && (
                <MaterialIcons name="check" size={24} color="#4cc9f0" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тема</Text>
          <View style={styles.themeContainer}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  settings.theme === theme.id && styles.selectedTheme
                ]}
                onPress={() => handleThemeSelect(theme.id)}
              >
                <View 
                  style={[
                    styles.themePreview,
                    theme.id === 'light' && styles.lightTheme,
                    theme.id === 'dark' && styles.darkTheme,
                    theme.id === 'system' && styles.systemTheme,
                  ]}
                />
                <Text style={styles.themeText}>{theme.name}</Text>
                {settings.theme === theme.id && (
                  <View style={styles.themeCheckmark}>
                    <MaterialIcons name="check" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Версия 1.0.0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Политика конфиденциальности</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Условия использования</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.aboutItem, styles.resetButton]}
            onPress={handleResetProgress}
          >
            <Text style={[styles.aboutText, styles.resetButtonText]}>Сбросить прогресс</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Life Simulator</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a8a8a8',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  languageText: {
    fontSize: 16,
    color: 'white',
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  selectedTheme: {
    backgroundColor: 'rgba(76, 201, 240, 0.2)',
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lightTheme: {
    backgroundColor: '#f8f9fa',
  },
  darkTheme: {
    backgroundColor: '#343a40',
  },
  systemTheme: {
    backgroundColor: '#a1a1a1', // Using a solid color instead of gradient
  },
  themeText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  themeCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4cc9f0',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  aboutText: {
    fontSize: 16,
    color: 'white',
  },
  resetButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 0,
  },
  resetButtonText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});

export default SettingsScreen;
