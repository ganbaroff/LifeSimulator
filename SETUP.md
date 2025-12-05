# LifeSim GSL - Инструкции по настройке и запуску

## 📋 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка API ключей

#### Gemini AI (обязательно для AI-событий)

1. Откройте `src/services/AIEngine.js`
2. Найдите строку:

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

3. Замените на ваш ключ:

```javascript
const GEMINI_API_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX';
```

4. Получить ключ: https://makersuite.google.com/app/apikey

#### Adapty (опционально, для монетизации)

1. Откройте `src/services/MonetizationService.js`
2. Замените:

```javascript
const ADAPTY_PUBLIC_KEY = 'YOUR_ADAPTY_PUBLIC_KEY_HERE';
```

3. Получить ключ: https://app.adapty.io/

#### Avaturn (опционально, для аватаров)

1. Откройте `src/services/AvatarService.js`
2. Замените:

```javascript
const AVATURN_API_KEY = 'YOUR_AVATURN_API_KEY_HERE';
```

3. Получить ключ: https://avaturn.me/

### 3. Запуск в режиме разработки

```bash
# Запуск Metro bundler
npm start

# Или сразу на Android
npm run android
```

## 🔧 Настройка для Android

### Требования

- Node.js 18+
- Android Studio
- JDK 17+
- Android SDK (API 34)

### Установка Android Studio

1. Скачайте: https://developer.android.com/studio
2. Установите Android SDK Tools
3. Создайте эмулятор или подключите устройство

### Переменные окружения

Добавьте в PATH:

```
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
```

## 📱 Сборка APK для тестирования

### Вариант 1: EAS Build (рекомендуется)

```bash
# Установка EAS CLI
npm install -g eas-cli

# Вход в Expo аккаунт
eas login

# Конфигурация
eas build:configure

# Сборка APK для тестирования
eas build --platform android --profile preview

# Сборка AAB для Google Play
eas build --platform android --profile production
```

APK будет доступен для скачивания в консоли EAS.

### Вариант 2: Локальная сборка

```bash
# Предварительная сборка JS
npx expo export:embed

# Генерация нативных папок
npx expo prebuild

# Сборка APK
cd android
./gradlew assembleRelease

# APK находится в:
# android/app/build/outputs/apk/release/app-release.apk
```

## 🎮 Тестирование игры

### Demo режим (5 минут)

1. Запустите приложение
2. Создайте персонажа
3. Выберите "Demo" уровень
4. Играйте 5 минут

### Тестирование AI

1. Убедитесь что вставлен Gemini API ключ
2. Проверьте консоль на ошибки
3. События должны показывать "🤖 AI Generated"
4. Если AI недоступен, автоматически использует Fallback события

### Тестирование исторических событий

1. Создайте персонажа с годом рождения 1920-1950
2. Выберите страну USA или Russia
3. События будут содержать исторический контекст (войны, депрессии и т.д.)

## 🐛 Решение проблем

### "Unable to resolve module"

```bash
npm install
npx expo start --clear
```

### Android build fails

```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### AI не работает

1. Проверьте API ключ в `src/services/AIEngine.js`
2. Проверьте интернет соединение
3. Проверьте консоль на ошибки
4. Fallback события работают автоматически

### Slow performance

1. Включите Hermes (уже включен в app.json)
2. Отключите AI если устройство слабое:
   - Settings → AI Enabled → OFF

## 📊 Структура данных

### AsyncStorage ключи

- `character` - Данные персонажа
- `gameState` - Прогресс игры, кристаллы, достижения

### Очистка данных (для тестирования)

```javascript
// В любом компоненте
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.clear(); // Очистить всё
// или
await AsyncStorage.removeItem('character'); // Только персонаж
```

## 🎨 Кастомизация

### Добавление нового события

Отредактируйте `src/data/fallbackEvents.json`:

```json
{
  "id": "my_event_1",
  "situation": "Описание события...",
  "ageRange": [18, 30],
  "level": 1,
  "choices": {
    "A": {"text": "Безопасный выбор", "effects": {...}},
    "B": {"text": "Сбалансированный", "effects": {...}},
    "C": {"text": "Рискованный", "effects": {..., "deathChance": 0.3}}
  }
}
```

### Добавление исторического события

Отредактируйте `src/services/HistoricalEvents.js`:

```javascript
USA: {
  2030: {
    event: 'Название события',
    description: 'Описание',
    effects: { health: 1.0, wealth: 1.2, happiness: 0.9 },
    tags: ['economic'],
  },
}
```

### Изменение уровней

Отредактируйте `src/context/GameContext.js`:

```javascript
LEVEL_6: {
  id: 'level_6',
  name: 'Level 6',
  duration: 10800, // секунды
  requiredCrystals: 1500,
  deathChance: 0.7,
  unlocked: false,
}
```

## 🚀 Деплой в Google Play

1. Создайте keystore:

```bash
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Настройте `android/gradle.properties`:

```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

3. Соберите AAB:

```bash
cd android
./gradlew bundleRelease
```

4. Загрузите в Google Play Console

## 📈 Аналитика и метрики

### События для отслеживания

- `game_started` - Начало игры
- `level_completed` - Завершение уровня
- `character_died` - Смерть персонажа
- `rewind_purchased` - Покупка Rewind
- `achievement_unlocked` - Достижение разблокировано

Интеграция в `src/services/MonetizationService.js`

## 🆘 Поддержка

### Логи

```bash
# Android логи
adb logcat | grep -i "LifeSim"

# React Native логи
npx expo start
# Нажмите 'j' для открытия Chrome DevTools
```

### Часто задаваемые вопросы

**Q: Как отключить AI и использовать только fallback?**
A: В `src/services/AIEngine.js` установите `GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'`

**Q: Можно ли играть офлайн?**
A: Да, fallback события работают офлайн. AI требует интернет.

**Q: Как добавить новую страну?**
A:

1. Добавьте в массив `COUNTRIES` в `MainScreen.js`
2. Добавьте исторические события в `HistoricalEvents.js`

**Q: Как изменить стоимость Rewind?**
A: Отредактируйте `REWIND_PACKAGES` в `src/services/MonetizationService.js`

---

Для дополнительной помощи:

- GitHub Issues
- Discord сервер
- Email: support@lifesim.com

**Версия**: 1.0.0  
**Последнее обновление**: Ноябрь 2025
