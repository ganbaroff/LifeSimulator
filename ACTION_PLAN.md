# 🎯 Конкретные Рекомендации и Следующие Шаги

**Дата**: 28 ноября 2025  
**Для**: Разработчик LifeSimulator  
**От**: AI Assistant

---

## 🚀 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС

### ⏰ Следующие 30 минут

#### 1. Переместить API ключи в .env
```bash
# Создать .env файл
echo "GEMINI_API_KEY=your_key_here" > .env

# Обновить .gitignore
echo ".env" >> .gitignore
```

```typescript
// src/services/AIEngine.ts
// БЫЛО:
const GEMINI_API_KEY = 'AIzaSyXXXXXXXXXX';

// СТАЛО:
import { GEMINI_API_KEY } from '@env';
```

**Почему критично**: API ключ в коде = утечка в Git = потенциальная кража ключа

---

#### 2. Удалить дубликаты компонентов
```bash
# Удалить ненужные файлы
rm src/components/ImprovedHUD.js
rm src/components/ImprovedEventCard.js
rm src/components/IconShowcase.js
```

**Почему важно**: Чистота кода, меньше путаницы

---

### ⏰ Сегодня (2-3 часа)

#### 3. Интегрировать Sentry для мониторинга ошибок
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

```typescript
// App.js
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});

// В ErrorBoundary.js
componentDidCatch(error, errorInfo) {
  Sentry.captureException(error, { extra: errorInfo });
  this.setState({ hasError: true, error });
}
```

**Почему критично**: Без мониторинга вы не узнаете о крашах в production

---

#### 4. Добавить валидацию данных с Zod
```bash
npm install zod
```

```typescript
// src/types/schemas.ts
import { z } from 'zod';

export const CharacterSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().min(0).max(120),
  health: z.number().min(0).max(100),
  happiness: z.number().min(0).max(100),
  wealth: z.number().min(0),
  skills: z.number().min(0).max(100),
  country: z.string(),
  birthYear: z.number().min(1850).max(2025),
  profession: z.string().nullable(),
  isAlive: z.boolean(),
  deathCause: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  history: z.array(z.any()),
});

// В CharacterContext.tsx
const loadCharacter = async () => {
  try {
    const saved = await AsyncStorage.getItem('character');
    if (!saved) return;
    
    const parsed = JSON.parse(saved);
    const validated = CharacterSchema.parse(parsed); // Throws if invalid
    setCharacter(validated);
  } catch (error) {
    console.error('Invalid character data:', error);
    // Сбросить на дефолт
    setCharacter(DEFAULT_CHARACTER);
  }
};
```

**Почему важно**: Защита от поврежденных данных, которые могут крашить приложение

---

## 📅 ПЛАН НА НЕДЕЛЮ 1 (Критичные задачи)

### День 1: Безопасность
- [x] API ключи в .env (30 мин)
- [ ] Валидация данных с Zod (2 часа)
- [ ] Sentry интеграция (1 час)
- [ ] Тестирование на устройстве (1 час)

**Результат**: Безопасное приложение

---

### День 2: SaveService
```typescript
// src/services/SaveService.ts
interface SaveData {
  version: number;
  character: Character;
  gameState: GameState;
  timestamp: number;
}

class SaveService {
  private currentVersion = 1;
  private maxSlots = 3;
  
  async save(slotId: number, character: Character, gameState: GameState): Promise<void> {
    const data: SaveData = {
      version: this.currentVersion,
      character,
      gameState,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(`save_${slotId}`, JSON.stringify(data));
  }
  
  async load(slotId: number): Promise<SaveData | null> {
    const raw = await AsyncStorage.getItem(`save_${slotId}`);
    if (!raw) return null;
    
    const data = JSON.parse(raw);
    return this.migrate(data);
  }
  
  private migrate(data: SaveData): SaveData {
    // Миграции между версиями
    if (data.version < this.currentVersion) {
      // Применить миграции
    }
    return data;
  }
  
  async listSaves(): Promise<Array<{ slotId: number; timestamp: number }>> {
    const saves = [];
    for (let i = 0; i < this.maxSlots; i++) {
      const data = await this.load(i);
      if (data) {
        saves.push({ slotId: i, timestamp: data.timestamp });
      }
    }
    return saves;
  }
  
  async deleteSave(slotId: number): Promise<void> {
    await AsyncStorage.removeItem(`save_${slotId}`);
  }
  
  async exportSave(slotId: number): Promise<string> {
    const data = await this.load(slotId);
    return JSON.stringify(data);
  }
  
  async importSave(slotId: number, jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    const validated = this.migrate(data);
    await AsyncStorage.setItem(`save_${slotId}`, JSON.stringify(validated));
  }
}

export default new SaveService();
```

**Время**: 3-4 часа  
**Приоритет**: 🔴 Критичный

---

### День 3: Setup тестирования
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules)/)',
  ],
};
```

```typescript
// src/services/__tests__/AIEngine.test.ts
import AIEngine from '../AIEngine';

describe('AIEngine', () => {
  it('should generate event', async () => {
    const mockCharacter = {
      name: 'Test',
      age: 25,
      health: 100,
      happiness: 100,
      wealth: 1000,
      skills: 50,
      country: 'USA',
      birthYear: 2000,
      profession: null,
      isAlive: true,
      deathCause: null,
      avatarUrl: null,
      history: [],
    };
    
    const mockGameState = {
      currentLevel: 'demo',
      crystals: 0,
      unlockedLevels: ['demo'],
      achievements: [],
      dailyRewardLastClaimed: null,
      gameStartTime: null,
      totalPlayTime: 0,
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        aiEnabled: false, // Force fallback
      },
    };
    
    const event = await AIEngine.generateEvent(mockCharacter, mockGameState);
    
    expect(event).toBeDefined();
    expect(event.situation).toBeDefined();
    expect(event.A).toBeDefined();
    expect(event.B).toBeDefined();
    expect(event.C).toBeDefined();
  });
});
```

**Время**: 2-3 часа  
**Приоритет**: 🔴 Критичный

---

### День 4-5: Создать AvatarView компонент
```typescript
// src/components/AvatarView.tsx
import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface AvatarViewProps {
  character: {
    name: string;
    age: number;
    avatarUrl: string | null;
  };
  size?: 'small' | 'medium' | 'large';
}

const AvatarView: React.FC<AvatarViewProps> = ({ character, size = 'medium' }) => {
  const sizeMap = {
    small: 60,
    medium: 120,
    large: 200,
  };
  
  const avatarSize = sizeMap[size];
  
  // Placeholder пока нет реального аватара
  const placeholderEmoji = character.age < 18 ? '👶' : 
                          character.age < 30 ? '👨' :
                          character.age < 50 ? '🧔' :
                          character.age < 70 ? '👴' : '🧓';
  
  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      {character.avatarUrl ? (
        <Image 
          source={{ uri: character.avatarUrl }} 
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={[styles.emoji, { fontSize: avatarSize * 0.6 }]}>
            {placeholderEmoji}
          </Text>
        </View>
      )}
      <View style={styles.ageBadge}>
        <Text style={styles.ageText}>{character.age}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 1000,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 3,
    borderColor: '#60a5fa',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  emoji: {
    fontSize: 60,
  },
  ageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AvatarView;
```

**Время**: 2-3 часа  
**Приоритет**: 🔴 Критичный

---

### День 6-7: Добавить контент

#### Расширить fallbackEvents.json
```json
// Добавить 30+ новых событий
{
  "id": "event_21",
  "situation": "You discover a hidden talent for music. Do you pursue it?",
  "ageRange": [15, 30],
  "level": 1,
  "choices": {
    "A": {
      "text": "Take free online lessons",
      "effects": { "happiness": 10, "skills": 5 }
    },
    "B": {
      "text": "Invest in professional training",
      "effects": { "happiness": 20, "skills": 15, "wealth": -500 }
    },
    "C": {
      "text": "Quit your job to become a musician",
      "effects": { 
        "happiness": 30, 
        "skills": 25, 
        "wealth": -2000,
        "deathChance": 0.1,
        "deathCause": "Starvation due to failed music career"
      }
    }
  }
}
```

#### Расширить achievements.json
```json
{
  "id": "music_master",
  "name": "Music Master",
  "description": "Reach 100 skills through music events",
  "icon": "🎵",
  "reward": 100,
  "condition": {
    "type": "skills_from_music",
    "value": 100
  }
}
```

#### Расширить names.json
```json
{
  "firstNames": {
    "male": [
      "John", "Michael", "David", "James", "Robert", 
      "William", "Richard", "Thomas", "Charles", "Daniel",
      // ... 90+ more
    ],
    "female": [
      "Mary", "Patricia", "Jennifer", "Linda", "Barbara",
      "Elizabeth", "Susan", "Jessica", "Sarah", "Karen",
      // ... 90+ more
    ]
  },
  "lastNames": [
    "Smith", "Johnson", "Williams", "Brown", "Jones",
    "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    // ... 90+ more
  ]
}
```

**Время**: 4-6 часов  
**Приоритет**: 🟡 Важный

---

## 📅 ПЛАН НА НЕДЕЛЮ 2 (Архитектура)

### Миграция на Zustand

```bash
npm install zustand
```

```typescript
// src/stores/characterStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character } from '../types';

interface CharacterStore {
  character: Character;
  loading: boolean;
  
  createCharacter: (name: string, country: string, birthYear: number, profession: string | null) => void;
  updateAttributes: (changes: Partial<Character>) => void;
  ageUp: (years?: number) => void;
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: DEFAULT_CHARACTER,
      loading: false,
      
      createCharacter: (name, country, birthYear, profession) => {
        set({
          character: {
            ...DEFAULT_CHARACTER,
            name,
            country,
            birthYear,
            profession,
          },
        });
      },
      
      updateAttributes: (changes) => {
        set((state) => ({
          character: {
            ...state.character,
            ...changes,
          },
        }));
      },
      
      ageUp: (years = 1) => {
        set((state) => ({
          character: {
            ...state.character,
            age: state.character.age + years,
          },
        }));
      },
      
      resetCharacter: () => {
        set({ character: DEFAULT_CHARACTER });
      },
    }),
    {
      name: 'character-storage',
    }
  )
);
```

**Преимущества Zustand**:
- ✅ Меньше boilerplate
- ✅ Лучшая производительность
- ✅ DevTools из коробки
- ✅ Простое тестирование

**Время**: 2-3 дня  
**Приоритет**: 🔴 Критичный

---

## 📅 ПЛАН НА НЕДЕЛЮ 3 (UX и Контент)

### Добавить Loading States

```typescript
// src/components/LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#60a5fa" />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  message: {
    color: '#f8fafc',
    marginTop: 12,
    fontSize: 16,
  },
});

export default LoadingOverlay;
```

```typescript
// В GameScreen.tsx
const [loading, setLoading] = useState(false);

const loadNextEvent = async () => {
  setLoading(true);
  try {
    const event = await AIEngine.generateEvent(character, gameState);
    setCurrentEvent(event);
  } catch (error) {
    setError('Failed to generate event');
  } finally {
    setLoading(false);
  }
};

// В JSX
<LoadingOverlay visible={loading} message="Generating event..." />
```

**Время**: 2-3 часа  
**Приоритет**: 🟡 Важный

---

## 📅 ПЛАН НА НЕДЕЛЮ 4 (Финализация)

### CI/CD с GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run type check
        run: npm run type-check
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build Android
        run: eas build --platform android --non-interactive --no-wait
```

**Время**: 2-3 часа  
**Приоритет**: 🟡 Важный

---

## 🎯 ЧЕКЛИСТ ПЕРЕД РЕЛИЗОМ

### Код
- [ ] 95%+ TypeScript покрытие
- [ ] 80%+ test coverage
- [ ] 0 ESLint ошибок
- [ ] 0 TypeScript ошибок
- [ ] Все TODO закрыты
- [ ] Код ревью пройден

### Безопасность
- [ ] API ключи в .env
- [ ] Валидация всех входных данных
- [ ] Rate limiting для API
- [ ] HTTPS для всех запросов
- [ ] ProGuard обфускация

### Производительность
- [ ] 60fps на низких устройствах
- [ ] < 3s загрузка
- [ ] < 200MB память
- [ ] < 10MB bundle size

### Контент
- [ ] 50+ fallback событий
- [ ] 30+ достижений
- [ ] 100+ имен
- [ ] 100% локализация (en/es/ru)
- [ ] Все иконки готовы

### UX
- [ ] Loading states везде
- [ ] Error handling везде
- [ ] Offline mode работает
- [ ] Анимации плавные
- [ ] Тактильная обратная связь

### Инфраструктура
- [ ] CI/CD настроен
- [ ] Sentry работает
- [ ] Analytics настроен
- [ ] Crash reporting работает

### Юридическое
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Age gate (18+)
- [ ] GDPR compliance

---

## 📊 МЕТРИКИ УСПЕХА

### Технические
- TypeScript: 70% → 95%
- Тесты: 0% → 80%
- Performance: ? → 60fps
- Bundle: ? → <10MB

### Продуктовые
- Day 1 Retention: ? → 40%+
- Day 7 Retention: ? → 15%+
- Avg Session: ? → 10+ min
- IAP Conversion: ? → 5%+
- Crash Rate: ? → <1%

---

## 🎉 ЗАКЛЮЧЕНИЕ

### Что делать СЕЙЧАС:
1. ✅ API ключи в .env (30 мин)
2. ✅ Удалить дубликаты (5 мин)
3. ✅ Sentry интеграция (1 час)

### Что делать на ЭТОЙ НЕДЕЛЕ:
1. ✅ Валидация данных (2 часа)
2. ✅ SaveService (4 часа)
3. ✅ Setup тестирования (3 часа)
4. ✅ AvatarView компонент (3 часа)
5. ✅ Добавить контент (6 часов)

### Что делать СЛЕДУЮЩИЕ 4 НЕДЕЛИ:
- Неделя 1: Критичные исправления
- Неделя 2: Архитектура (Zustand)
- Неделя 3: UX и контент
- Неделя 4: Финализация и релиз

---

**Следующий шаг**: Открыть терминал и выполнить первые 3 задачи из "Что делать СЕЙЧАС"

**Удачи! 🚀**
