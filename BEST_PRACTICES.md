# 🎮 Game Development Best Practices - Implementation Guide

## Current Status ✅

### What We've Accomplished

1. **TypeScript Foundation**
   - ✅ Installed TypeScript & React types
   - ✅ Configured `tsconfig.json` with strict mode + path aliases
   - ✅ Created core type definitions (`src/types/index.ts`)
   - ✅ Extracted game constants (`src/constants/index.ts`)
   - ✅ Added npm scripts: `type-check`, `validate`

2. **Code Quality Tools**
   - ✅ ESLint with React Native config
   - ✅ Prettier for auto-formatting
   - ✅ Git-friendly workflow

### Project Structure (Updated)

```
src/
├── types/           # NEW: TypeScript definitions
│   └── index.ts     # Character, Event, GameState, etc.
├── constants/       # NEW: Game constants
│   └── index.ts     # COUNTRIES, LEVELS, PROFESSIONS
├── components/      # React components
├── screens/         # Screen components
├── context/         # React Context (will migrate to Zustand)
├── services/        # Business logic
└── data/            # Static JSON data
```

---

## 🚀 Next Steps (Prioritized)

### Immediate (This Week)

#### 1. Fix Node.js Compatibility Issue

**Problem**: Expo SDK 50 + Node 22 = Metro crash on Windows  
**Solution**: Switch to Node 20 LTS

```powershell
# Install Node Version Manager for Windows
# Download from: https://github.com/coreybutler/nvm-windows/releases

# After installing nvm-windows:
nvm install 20.17.0
nvm use 20.17.0
node -v  # Should show v20.17.0

# Then start Android
npx expo start -c --android
```

**Alternative** (if can't switch Node):

```powershell
# Set environment variable
setx EXPO_NO_METRO_EXTERNALS 1

# Close and reopen PowerShell
npx expo start -c --android
```

#### 2. Migrate Core Files to TypeScript

Priority order (start with these):

**A. Services** (Business Logic)

- [ ] `CharacterService.js` → `.ts` ✅ (already done)
- [ ] `AIEngine.js` → `.ts`
- [ ] `HistoricalEvents.js` → `.ts`

**B. Contexts** (State Management)

- [ ] `CharacterContext.js` → `.tsx`
- [ ] `GameContext.js` → `.tsx`

**C. Screens** (UI)

- [ ] `MainScreen.js` → `.tsx`
- [ ] `GameScreen.js` → `.tsx`
- [ ] `SettingsScreen.js` → `.tsx`

**Migration Example**:

```typescript
// Before: CharacterContext.js
const DEFAULT_CHARACTER = {
  name: '',
  age: 0,
  // ...
};

// After: CharacterContext.tsx
import type { Character } from '@/types';

const DEFAULT_CHARACTER: Character = {
  name: '',
  age: 0,
  // ... TypeScript will validate all fields
};
```

#### 3. Add Custom Hooks

Create `src/hooks/` folder:

```typescript
// src/hooks/useGameTimer.ts
export function useGameTimer(duration: number, onComplete: () => void) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return remaining;
}
```

---

### Short-Term (Next 2 Weeks)

#### 4. State Management Migration (Context → Zustand)

**Why Zustand?**

- 🚀 **Performance**: No Provider nesting, selective re-renders
- 📦 **Size**: 1KB (vs Redux 3KB)
- 🎯 **Simplicity**: Minimal boilerplate
- 🔄 **DevTools**: Time-travel debugging

**Install**:

```bash
npm install zustand
```

**Example Store**:

```typescript
// src/stores/gameStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '@/types';

interface GameStore extends GameState {
  addCrystals: (amount: number) => void;
  unlockLevel: (levelId: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // State
      currentLevel: 'demo',
      crystals: 0,
      unlockedLevels: ['demo', 'level_1'],
      achievements: [],
      dailyRewardLastClaimed: null,
      gameStartTime: null,
      totalPlayTime: 0,
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        aiEnabled: true,
      },

      // Actions
      addCrystals: (amount) => set((state) => ({ crystals: state.crystals + amount })),

      unlockLevel: (levelId) =>
        set((state) => ({
          unlockedLevels: [...state.unlockedLevels, levelId],
        })),

      reset: () =>
        set({
          crystals: 0,
          unlockedLevels: ['demo', 'level_1'],
        }),
    }),
    {
      name: 'game-storage', // localStorage key
    },
  ),
);
```

**Usage in Component**:

```typescript
// Before: Context
const { gameState, addCrystals } = useGame();

// After: Zustand
const crystals = useGameStore((state) => state.crystals);
const addCrystals = useGameStore((state) => state.addCrystals);

// Only re-renders when crystals change!
```

#### 5. Performance Optimization

**A. Memoize Components**

```typescript
// components/EventCard.tsx
import React, { memo } from 'react';

const EventCard = memo(
  ({ event, onChoice, disabled }: Props) => {
    // Component code
  },
  (prevProps, nextProps) => {
    // Custom comparison (optional)
    return prevProps.event.situation === nextProps.event.situation;
  },
);
```

**B. Optimize Expensive Calculations**

```typescript
// Before
const levelInfo = Object.values(LEVELS).find((l) => l.id === currentLevel);

// After
const levelInfo = useMemo(
  () => Object.values(LEVELS).find((l) => l.id === currentLevel),
  [currentLevel],
);
```

**C. Lazy Load Screens**

```typescript
// App.tsx
const GameScreen = lazy(() => import('@/screens/GameScreen'));
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen'));

// In Navigator
<Suspense fallback={<LoadingSpinner />}>
  <Stack.Screen name="Game" component={GameScreen} />
</Suspense>
```

#### 6. Testing Setup

**Install Dependencies**:

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**Example Test**:

```typescript
// __tests__/services/CharacterService.test.ts
import { generateRandomCharacterSeed } from '@/services/CharacterService';

describe('CharacterService', () => {
  describe('generateRandomCharacterSeed', () => {
    it('should generate valid character data', () => {
      const seed = generateRandomCharacterSeed();

      expect(seed.name).toBeTruthy();
      expect(seed.country).toBeTruthy();
      expect(seed.yearBase).toBeGreaterThanOrEqual(1900);
      expect(seed.yearBase).toBeLessThanOrEqual(2020);
    });

    it('should restrict professions when pro mode locked', () => {
      const seed = generateRandomCharacterSeed({ proUnlocked: false });
      expect(seed.profession).toBe('none');
    });
  });
});
```

---

### Medium-Term (Month 1-2)

#### 7. Implement Save System with Versioning

```typescript
// src/services/SaveManager.ts
interface SaveFile {
  version: string;
  timestamp: number;
  character: Character;
  gameState: GameState;
}

class SaveManager {
  private static VERSION = '1.0.0';

  static async save(slot: number): Promise<void> {
    const data: SaveFile = {
      version: this.VERSION,
      timestamp: Date.now(),
      character: useCharacterStore.getState(),
      gameState: useGameStore.getState(),
    };

    await AsyncStorage.setItem(`save_${slot}`, JSON.stringify(data));
  }

  static async load(slot: number): Promise<SaveFile | null> {
    const raw = await AsyncStorage.getItem(`save_${slot}`);
    if (!raw) return null;

    const data = JSON.parse(raw) as SaveFile;

    // Migration logic for old saves
    if (data.version !== this.VERSION) {
      return this.migrate(data);
    }

    return data;
  }

  private static migrate(old: SaveFile): SaveFile {
    // Handle version updates
    return old;
  }
}
```

#### 8. Analytics & Telemetry

```typescript
// src/services/TelemetryService.ts
class TelemetryService {
  trackEvent(name: string, properties?: Record<string, any>) {
    // Firebase/Amplitude/custom
    console.log('📊', name, properties);
  }

  trackChoice(choice: ChoiceType, event: Event, outcome: EventEffects) {
    this.trackEvent('player_choice', {
      choice,
      situation: event.situation,
      healthDelta: outcome.health,
      wealthDelta: outcome.wealth,
    });
  }

  trackDeath(cause: string, age: number, level: string) {
    this.trackEvent('player_death', { cause, age, level });
  }
}
```

#### 9. Offline Mode

```typescript
// src/hooks/useOfflineMode.ts
export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    enableOfflineMode: () => {
      // Use fallback events, disable analytics
    },
  };
}
```

---

## 🎯 Quality Metrics (Goals)

### Performance

- [ ] **Initial Load**: < 3s on mid-range device
- [ ] **Screen Transitions**: < 200ms
- [ ] **Event Generation**: < 500ms (AI) or < 100ms (fallback)
- [ ] **Memory Usage**: < 200MB during gameplay
- [ ] **Bundle Size**: < 30MB APK

### Code Quality

- [ ] **Type Coverage**: 90%+ TypeScript
- [ ] **Test Coverage**: 80%+ on business logic
- [ ] **Lint Warnings**: 0
- [ ] **Bundle Duplicates**: 0

### User Experience

- [ ] **Crash Rate**: < 1%
- [ ] **Day 1 Retention**: 40%+
- [ ] **Avg Session**: 10+ min
- [ ] **App Rating**: 4.5+ stars

---

## 📚 Learning Resources

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### React Native Performance

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Flipper Debugger](https://fbflipper.com/)

### Game Dev Patterns

- [Game Programming Patterns](https://gameprogrammingpatterns.com/) (free book)
- [Unity Design Patterns](https://github.com/QianMo/Unity-Design-Pattern) (concepts apply to React)

### State Management

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [State Management Comparison](https://blog.logrocket.com/state-management-react-native/)

---

## 🔧 Useful Commands

```bash
# Development
npm start                    # Start Metro bundler
npm run android             # Run on Android
npm run ios                 # Run on iOS

# Code Quality
npm run lint                # Check for lint errors
npm run format              # Auto-format code
npm run type-check          # TypeScript validation
npm run validate            # Run all checks

# Testing (after setup)
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Build
npm run build:android       # Build Android APK/AAB
```

---

## 🐛 Common Issues & Solutions

### 1. Metro Cache Issues

```bash
npx expo start -c           # Clear cache
rm -rf node_modules .expo
npm install
```

### 2. TypeScript Path Aliases Not Working

- Restart Metro bundler after changing `tsconfig.json`
- Check that `experiments.tsconfigPaths` is not disabled in `app.json`

### 3. Type Errors in JS Files

- Gradual migration: Use `// @ts-ignore` temporarily
- Add JSDoc types: `/** @type {Character} */`

### 4. Performance Issues

- Use React DevTools Profiler to identify bottlenecks
- Check for unnecessary re-renders with `why-did-you-render`

---

**Next Action Items**:

1. ✅ Switch to Node 20 LTS
2. ⏳ Migrate `AIEngine.js` to TypeScript
3. ⏳ Create `useGameTimer` custom hook
4. ⏳ Install Zustand and migrate GameContext

**Questions? Issues?**  
Refer to [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for the complete plan.
