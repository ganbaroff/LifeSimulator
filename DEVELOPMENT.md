# Руководство по расширению LifeSim GSL

## 🔧 Как добавить новые функции

### 1. Добавление нового события

**Файл**: `src/data/fallbackEvents.json`

```json
{
  "id": "unique_id_here",
  "situation": "Описание ситуации (макс 200 символов)",
  "ageRange": [минимальный_возраст, максимальный_возраст],
  "level": уровень_сложности,
  "choices": {
    "A": {
      "text": "Текст безопасного выбора",
      "effects": {
        "health": 0,
        "happiness": 5,
        "wealth": 100,
        "skills": 10
      }
    },
    "B": {
      "text": "Текст сбалансированного выбора",
      "effects": {
        "health": -5,
        "happiness": 10,
        "wealth": 500,
        "skills": 15
      }
    },
    "C": {
      "text": "Текст рискованного выбора",
      "effects": {
        "health": -20,
        "happiness": 20,
        "wealth": 2000,
        "skills": 30,
        "deathChance": 0.3
      }
    }
  }
}
```

**Рекомендации**:

- ID должен быть уникальным
- Эффекты A: -10 до +10, богатство до ±500
- Эффекты B: -15 до +15, богатство до ±1000
- Эффекты C: -30 до +30, богатство до ±5000, deathChance: 0.1-0.6
- ageRange: [0-10] детство, [18-30] молодость, [30-50] зрелость, [50-80] старость

### 2. Добавление исторического события

**Файл**: `src/services/HistoricalEvents.js`

```javascript
export const HISTORICAL_EVENTS = {
  USA: {
    2030: {
      event: 'Краткое название',
      description: 'Детальное описание события',
      effects: {
        health: 1.0, // множитель (1.0 = без изменений)
        wealth: 0.8, // 0.8 = -20% к богатству
        happiness: 1.2, // 1.2 = +20% к счастью
      },
      tags: ['economic', 'crisis', 'war', 'prosperity', 'pandemic', 'disaster'],
    },
  },
  // Добавьте новую страну:
  Mexico: {
    1910: {
      event: 'Mexican Revolution',
      description: 'Revolutionary war begins',
      effects: { health: 0.6, wealth: 0.7, happiness: 0.5 },
      tags: ['war', 'revolution'],
    },
  },
};
```

**Эффекты**:

- `< 0.7` - катастрофическое влияние
- `0.7 - 0.9` - негативное влияние
- `0.9 - 1.1` - нейтральное
- `1.1 - 1.3` - позитивное влияние
- `> 1.3` - исключительно позитивное

### 3. Добавление нового уровня

**Файл**: `src/context/GameContext.js`

```javascript
export const LEVELS = {
  // ... существующие уровни ...

  LEVEL_6: {
    id: 'level_6',
    name: 'Level 6: Extreme',
    duration: 14400, // секунды (4 часа)
    requiredCrystals: 2000, // кристаллы для разблокировки
    deathChance: 0.7, // 70% шанс смерти на C-выборе
    unlocked: false,
  },
};
```

**Параметры**:

- `duration`: секунды (60 = 1 минута, 3600 = 1 час)
- `requiredCrystals`: 0 для бесплатных уровней
- `deathChance`: 0.1 (10%) до 0.9 (90%)

### 4. Добавление достижения

**Файл**: `src/data/achievements.json`

```json
{
  "id": "unique_achievement_id",
  "name": "Название достижения",
  "description": "Описание как получить",
  "icon": "🏆",
  "reward": 100,
  "condition": {
    "type": "тип_условия",
    "value": значение
  }
}
```

**Типы условий**:

- `games_completed`: Количество завершенных игр
- `max_age`: Максимальный достигнутый возраст
- `max_wealth`: Максимальное богатство
- `max_skills`: Максимальные навыки
- `c_choices_survived`: Выживших C-выборов
- `historical_events`: Испытанных исторических событий
- `countries_played`: Игр в разных странах
- `levels_completed`: Пройденных уровней
- `unique_deaths`: Уникальных причин смерти

### 5. Добавление новой профессии

**Файл**: `src/screens/MainScreen.js`

```javascript
const PROFESSIONS = [
  'PMP',
  'Programmer',
  'Doctor',
  'New Profession', // <- добавьте здесь
];
```

**Опционально**: добавьте бонусы для профессии в `CharacterContext.js`:

```javascript
const PROFESSION_BONUSES = {
  Doctor: { health: 10, skills: 5 },
  Programmer: { skills: 10, wealth: 500 },
  'New Profession': { happiness: 10, wealth: 200 },
};
```

### 6. Добавление новой страны

**Шаг 1**: `src/screens/MainScreen.js`

```javascript
const COUNTRIES = [
  'USA',
  'Russia',
  'China',
  'New Country', // <- добавьте здесь
];
```

**Шаг 2**: `src/services/HistoricalEvents.js`

```javascript
export const HISTORICAL_EVENTS = {
  // ... существующие ...

  'New Country': {
    2000: {
      event: 'Millennium Celebration',
      description: 'Nation celebrates year 2000',
      effects: { health: 1.0, wealth: 1.1, happiness: 1.2 },
      tags: ['celebration'],
    },
  },
};
```

### 7. Настройка AI промпта

**Файл**: `src/services/AIEngine.js`

Найдите функцию `generateAIEvent` и измените промпт:

```javascript
const prompt = `You are a life simulation game engine (18+, dark realism).

Character Context:
- Name: ${character.name}
- Age: ${character.age}
- Profession: ${character.profession}

CUSTOM RULES HERE:
- Add fantasy elements
- Include more humor
- Focus on career progression
- etc.

Generate realistic event with 3 choices...`;
```

### 8. Изменение монетизации

**Файл**: `src/services/MonetizationService.js`

**Изменить цены**:

```javascript
export const REWIND_PACKAGES = {
  REWIND_SMALL: {
    id: 'rewind_small',
    steps: 5,
    price: 0.99, // <- измените цену
  },
};
```

**Изменить стоимость в кристаллах**:

```javascript
export const CRYSTAL_REWIND_COST = 50; // <- измените здесь
```

### 9. Добавление нового экрана

**Шаг 1**: Создайте файл `src/screens/NewScreen.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NewScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#f8fafc',
  },
});

export default NewScreen;
```

**Шаг 2**: Добавьте в навигацию `App.js`

```javascript
import NewScreen from './src/screens/NewScreen';

<Stack.Screen name="NewScreen" component={NewScreen} options={{ title: 'New Screen' }} />;
```

**Шаг 3**: Переход на новый экран

```javascript
navigation.navigate('NewScreen');
```

### 10. Добавление аналитики

**Файл**: `src/services/MonetizationService.js`

```javascript
export const logEvent = (eventName, params = {}) => {
  console.log(`Event: ${eventName}`, params);

  // Добавьте свою аналитику:
  // Firebase Analytics:
  // analytics().logEvent(eventName, params);

  // Amplitude:
  // amplitude.logEvent(eventName, params);
};
```

### 11. Кастомизация UI тем

Создайте `src/styles/theme.js`:

```javascript
export const THEME = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    success: '#22c55e',
    warning: '#fbbf24',
    danger: '#ef4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};
```

Используйте в компонентах:

```javascript
import { THEME } from '../styles/theme';

<View style={{ backgroundColor: THEME.colors.background }} />;
```

## 🧪 Тестирование новых функций

### Debug режим

В `App.js` добавьте:

```javascript
const DEBUG = __DEV__;

if (DEBUG) {
  console.log('Character:', character);
  console.log('Game State:', gameState);
}
```

### Быстрое тестирование событий

В `GameScreen.js`:

```javascript
// Пропустить таймер для быстрого тестирования
const FAST_MODE = __DEV__;
if (FAST_MODE) {
  // Автоматически проходить события каждые 2 секунды
}
```

### Тестирование смерти

В `AIEngine.js` временно увеличьте `deathChance` до 1.0 для C-выбора.

## 📦 Публикация обновлений

### Over-the-Air (OTA) обновления с Expo

```bash
# Опубликовать изменения без новой сборки
eas update --branch production --message "Bug fixes"
```

Пользователи получат обновление при следующем запуске!

---

Для вопросов по разработке: GitHub Issues или Discord
