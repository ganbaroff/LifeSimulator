// i18n.js - Internationalization configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import es from '../locales/es.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  es: { translation: es },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale.split('-')[0], // Get device language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

export default i18n;
