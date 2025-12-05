# Life Saga - AI Project Handoff Document

## Project Overview
**Name:** Life Saga (LifeSimulator)  
**Type:** React Native + Expo mobile game  
**Genre:** Realistic life simulator with AI-generated events  
**Platforms:** Android, iOS  
**Current Status:** Development - Basic functionality working, needs UI/gameplay improvements

---

## What Was Done

### 1. ✅ Project Upgrade (SDK 50 → 54)
**Completed:**
- Upgraded Expo SDK from 50 to 54
- Updated React from 18.2 to 19.1
- Updated React Native from 0.73.6 to 0.81.5
- Updated all Expo packages to SDK 54 compatible versions
- Fixed Node 24 compatibility (SDK 54 supports Node 24, SDK 50 didn't)
- Installed missing dependencies: `babel-preset-expo`, `react-native-worklets`

**Dependencies Updated:**
```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~4.1.1",
  "expo-av": "~16.0.7",
  "expo-notifications": "~0.32.13",
  "@react-native-async-storage/async-storage": "2.2.0",
  // ...and 20+ other packages
}
```

### 2. ✅ TypeScript Migration (Phase 1 - 70% Complete)
**Migrated Files:**
- `src/services/AIEngine.ts` - AI event generation with Gemini API
- `src/services/HistoricalEvents.ts` - Historical context for events
- `src/services/CharacterService.ts` - Character management
- `src/context/CharacterContext.tsx` - Character state management
- `src/context/GameContext.tsx` - Game state management
- `src/screens/MainScreen.tsx` - Character creation (879 lines)
- `src/screens/GameScreen.tsx` - Main gameplay loop (432 lines)
- `src/screens/SettingsScreen.tsx` - Settings UI (297 lines)

**TypeScript Setup:**
- Created `tsconfig.json` with strict mode
- Added path aliases: `@components`, `@services`, `@context`, `@types`, `@constants`
- Created comprehensive type definitions in `src/types/index.ts`
- 0 TypeScript errors after migration

### 3. ✅ Android Development Environment Setup
**Configured:**
- Android SDK path: `C:\Users\yusif\AppData\Local\Android\Sdk`
- ADB working: `platform-tools\adb.exe`
- Emulator working: `emulator\emulator.exe`
- AVD created: `Medium_Phone_API_36.1` (Android API 36)
- Metro bundler running on `http://localhost:8081`
- Expo Go working on emulator

**Environment Issues Fixed:**
- `ANDROID_HOME` and `ANDROID_SDK_ROOT` not set (not critical for Expo Go)
- Metro bundler cache clearing issues
- `babel-preset-expo` missing dependency
- Corrupted `expo` package (reinstalled)

### 4. ✅ Environment Variables & API Configuration
**Setup:**
- Created `.env` file for API keys
- Added `babel-preset-expo` to devDependencies
- Temporarily disabled `@env` imports due to babel plugin conflicts
- `AIEngine.ts` now uses empty string for `GEMINI_API_KEY` → triggers fallback events

**Current State:**
- `.env` file exists with placeholder keys
- `babel.config.js` configured (without dotenv plugin - causing Metro crashes)
- Fallback events working (JSON-based events when no AI)

### 5. ✅ Asset Generation
**Created:**
- `assets/icon.png` (1024x1024 placeholder)
- `assets/splash.png` (1284x1284 placeholder)
- `assets/adaptive-icon.png` (1024x1024 placeholder)
- `assets/favicon.png` (48x48 placeholder)
- Script: `generate-icons.js` for creating placeholder PNGs

### 6. ✅ Code Quality
**Results:**
- `npm run type-check` - 0 errors
- `npx expo-doctor` - 17/17 checks passed
- ESLint: 0 errors, 34 non-critical warnings
- All services properly exported and typed

---

## Current Problems & Blockers

### 🔴 CRITICAL: UI Not Clickable
**Issue:** User reports "в приложении ничего не происходит. оно не кликабельно"

**Possible Causes:**
1. **GestureHandler not initialized** - `react-native-gesture-handler` may not be properly configured in `App.js`
2. **ErrorBoundary blocking UI** - Check if ErrorBoundary is catching and displaying an error
3. **Reanimated worklets issue** - Version 4.1 may have initialization problems
4. **Metro bundle not loading** - App showing but JS bundle failed to load
5. **TouchableOpacity replaced with non-working component** - React Native 0.81 breaking changes

**Debug Steps:**
1. Check Metro bundler logs for JS errors
2. Use `adb logcat` to see React Native errors on device
3. Add console.logs to button press handlers
4. Verify GestureHandlerRootView is wrapping app
5. Check if Reanimated is causing crashes

### 🔴 Environment Variables Not Working
**Issue:** `@env` import causes Metro bundler to crash silently

**Current Workaround:**
```typescript
// src/services/AIEngine.ts
const GEMINI_API_KEY = ''; // Hardcoded empty, uses fallback events
```

**Root Cause:**
- `react-native-dotenv` babel plugin conflicts with something in SDK 54
- Metro crashes without error when plugin is enabled in `babel.config.js`

**Needs Investigation:**
1. Test with latest `react-native-dotenv` version
2. Try alternative: `expo-constants` with `app.config.js`
3. Use Expo's built-in environment variable system
4. Check if SDK 54 has breaking changes with dotenv

### ⚠️ Assets Are Placeholders
**Issue:** All icons are 1-pixel PNG placeholders

**What's Needed:**
1. Design proper app icon (1024x1024)
2. Design splash screen (1284x2778 for iOS, 1080x2400 for Android)
3. Design adaptive icon layers (foreground + background)
4. Generate all required icon sizes

**Tools Suggested:**
- Figma for design
- `npx expo-optimize` for automatic resizing
- Online tools: makeappicon.com, appicon.co

### ⚠️ Components Not Migrated to TypeScript
**Remaining JS Files:**
```
App.js (127 lines) - Root component
src/components/AdRewardButton.js
src/components/ErrorBoundary.js
src/components/EventCard.js
src/components/HUD.js
src/components/IconShowcase.js
src/components/ImprovedEventCard.js
src/components/ImprovedHUD.js
src/components/LoadingSpinner.js
src/components/PurchaseModal.js
```

**Priority:** Medium (functional but not type-safe)

### ⚠️ No Testing Infrastructure
**Missing:**
- Jest configuration
- React Native Testing Library
- Unit tests for services
- Integration tests for game logic
- E2E tests for critical flows

---

## Step-by-Step Strategy for Next AI

### Phase 1: Fix Critical UI Bug (HIGHEST PRIORITY)
**Goal:** Make the app clickable and fully functional

**Step 1.1: Verify GestureHandler Setup**
```typescript
// App.js should have:
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* rest of app */}
    </GestureHandlerRootView>
  );
}
```

**Action:**
- Read `App.js`
- Check if `GestureHandlerRootView` wraps everything
- If missing, add it as outermost wrapper
- Test on emulator

**Step 1.2: Debug Metro Bundle Loading**
```powershell
# Check Metro logs
npx expo start --clear

# Check device logs
C:\Users\yusif\AppData\Local\Android\Sdk\platform-tools\adb.exe logcat | Select-String "ReactNative|Expo|Error"
```

**Action:**
- Start Metro with `--clear` flag
- Open app on emulator
- Capture any red screen errors
- Look for "Bundle loading" errors in Metro logs

**Step 1.3: Add Debug Logging**
```typescript
// MainScreen.tsx - Add to button handlers
const handleSaveCharacter = () => {
  console.log('[DEBUG] Save character button pressed');
  // existing code
};
```

**Action:**
- Add console.logs to all button press handlers in MainScreen
- Add console.logs to navigation calls
- Test each button, check Metro logs for output

**Step 1.4: Check ErrorBoundary State**
```typescript
// src/components/ErrorBoundary.js
// Add logging to componentDidCatch
componentDidCatch(error, errorInfo) {
  console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  // existing code
}
```

**Action:**
- Read ErrorBoundary component
- Add detailed logging
- Check if app is stuck in error state
- Add "Reset" button to ErrorBoundary UI

**Step 1.5: Verify Touchable Components**
```typescript
// Check if using correct touchable components
import { TouchableOpacity } from 'react-native'; // ❌ May not work
import { TouchableOpacity } from 'react-native-gesture-handler'; // ✅ Correct
```

**Action:**
- Grep search for `TouchableOpacity` imports
- Replace `react-native` imports with `react-native-gesture-handler`
- Test buttons work

**Expected Outcome:**
- Buttons respond to touch
- Navigation works
- Console logs confirm events firing

---

### Phase 2: Fix Environment Variables
**Goal:** Get API keys working properly

**Step 2.1: Remove react-native-dotenv**
```bash
npm uninstall react-native-dotenv
```

**Step 2.2: Use Expo's Environment Variables**
```javascript
// app.config.js (rename from app.json)
export default {
  expo: {
    name: "LifeSim GSL",
    // ... existing config
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      adaptyPublicKey: process.env.ADAPTY_PUBLIC_KEY,
      // ... other keys
    }
  }
}
```

**Step 2.3: Update AIEngine to Use Constants**
```typescript
// src/services/AIEngine.ts
import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
```

**Step 2.4: Create .env for Local Development**
```bash
# .env
GEMINI_API_KEY=your_key_here
```

**Step 2.5: Load .env in app.config.js**
```javascript
// app.config.js
import 'dotenv/config';

export default {
  expo: {
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
    }
  }
}
```

**Step 2.6: Test**
```bash
npx expo start --clear
```

**Expected Outcome:**
- No Metro crashes
- `Constants.expoConfig.extra` accessible
- API keys loaded from .env

---

### Phase 3: Complete TypeScript Migration
**Goal:** 100% TypeScript coverage

**Step 3.1: Migrate App.js → App.tsx**
```bash
# Rename
mv App.js App.tsx

# Update package.json main entry if needed
# "main": "node_modules/expo/AppEntry.js" (stays same)
```

**Action:**
- Convert App.js to TypeScript
- Add types for navigation
- Fix any type errors

**Step 3.2: Migrate Components (Priority Order)**
1. `ErrorBoundary.js` → `.tsx` (critical for debugging)
2. `HUD.js` → `.tsx` (used in GameScreen)
3. `EventCard.js` → `.tsx` (used in GameScreen)
4. `LoadingSpinner.js` → `.tsx` (utility component)
5. `AdRewardButton.js` → `.tsx`
6. `PurchaseModal.js` → `.tsx`
7. `ImprovedHUD.js` → `.tsx` (if still used)
8. `ImprovedEventCard.js` → `.tsx` (if still used)
9. `IconShowcase.js` → `.tsx`

**For Each Component:**
```typescript
// 1. Rename .js → .tsx
// 2. Add type imports
import type { FC } from 'react';
import type { SomeProps } from '../types';

// 3. Define props interface
interface ComponentProps {
  prop1: string;
  prop2: number;
  onPress?: () => void;
}

// 4. Type the component
const Component: FC<ComponentProps> = ({ prop1, prop2, onPress }) => {
  // implementation
};

export default Component;
```

**Step 3.3: Migrate Remaining Services**
- Check if any services in `src/services/` are still `.js`
- Migrate following same pattern as AIEngine

**Step 3.4: Run Type Check**
```bash
npm run type-check
```

**Expected Outcome:**
- 0 TypeScript errors
- All imports typed
- Full IntelliSense in VSCode

---

### Phase 4: Implement Phase 2 Optimizations (Zustand)
**Goal:** Replace Context API with Zustand for better performance

**Step 4.1: Install Zustand**
```bash
npm install zustand
```

**Step 4.2: Create Character Store**
```typescript
// src/stores/characterStore.ts
import { create } from 'zustand';
import type { Character } from '../types';

interface CharacterStore {
  character: Character | null;
  setCharacter: (character: Character) => void;
  updateStats: (updates: Partial<Character>) => void;
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  character: null,
  setCharacter: (character) => set({ character }),
  updateStats: (updates) =>
    set((state) => ({
      character: state.character
        ? { ...state.character, ...updates }
        : null,
    })),
  resetCharacter: () => set({ character: null }),
}));
```

**Step 4.3: Create Game Store**
```typescript
// src/stores/gameStore.ts
import { create } from 'zustand';
import type { GameState } from '../types';

interface GameStore {
  gameState: GameState | null;
  setGameState: (state: GameState) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  // ... other actions
}

export const useGameStore = create<GameStore>((set) => ({
  // implementation
}));
```

**Step 4.4: Replace Context Providers in App**
```typescript
// App.tsx
// Remove CharacterProvider, GameProvider
// Zustand stores are global, no providers needed

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <ErrorBoundary>
          <NavigationContainer>
            {/* screens */}
          </NavigationContainer>
        </ErrorBoundary>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
```

**Step 4.5: Update Screens to Use Stores**
```typescript
// MainScreen.tsx
// Replace:
// const { character, setCharacter } = useCharacterContext();
// With:
import { useCharacterStore } from '../stores/characterStore';

const MainScreen = () => {
  const { character, setCharacter } = useCharacterStore();
  // rest of component
};
```

**Step 4.6: Test Performance**
- Use React DevTools Profiler
- Check re-render counts (should be lower)
- Test rapid stat updates in GameScreen

**Expected Outcome:**
- No Context API, only Zustand
- Fewer re-renders
- Cleaner code (no Provider nesting)

---

### Phase 5: Add Memoization & Performance Hooks
**Goal:** Optimize component rendering

**Step 5.1: Memoize Heavy Components**
```typescript
// src/components/EventCard.tsx
import { memo } from 'react';

const EventCard: FC<EventCardProps> = memo(({ event, onChoice }) => {
  // component implementation
});

export default EventCard;
```

**Candidates for memo():**
- `EventCard` (renders on every event)
- `HUD` (updates frequently with stats)
- `ChoiceButton` (if exists, multiple instances)

**Step 5.2: Create useGameTimer Hook**
```typescript
// src/hooks/useGameTimer.ts
import { useState, useEffect, useCallback } from 'react';

export const useGameTimer = (durationMinutes: number) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const reset = useCallback(() => setTimeLeft(durationMinutes * 60), [durationMinutes]);

  return { timeLeft, isPaused, pause, resume, reset };
};
```

**Step 5.3: Create useEventQueue Hook**
```typescript
// src/hooks/useEventQueue.ts
import { useState, useCallback } from 'react';
import type { Event } from '../types';

export const useEventQueue = () => {
  const [queue, setQueue] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  const enqueue = useCallback((event: Event) => {
    setQueue((prev) => [...prev, event]);
  }, []);

  const dequeue = useCallback(() => {
    if (queue.length > 0) {
      setCurrentEvent(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue]);

  const clear = useCallback(() => {
    setQueue([]);
    setCurrentEvent(null);
  }, []);

  return { queue, currentEvent, enqueue, dequeue, clear };
};
```

**Step 5.4: Use Hooks in GameScreen**
```typescript
// src/screens/GameScreen.tsx
import { useGameTimer } from '../hooks/useGameTimer';
import { useEventQueue } from '../hooks/useEventQueue';

const GameScreen = () => {
  const { timeLeft, pause, resume } = useGameTimer(levelDuration);
  const { currentEvent, enqueue, dequeue } = useEventQueue();

  // Use hooks instead of inline logic
};
```

**Expected Outcome:**
- Reusable, testable hooks
- Cleaner GameScreen code
- Better separation of concerns

---

### Phase 6: Add Real Assets
**Goal:** Professional-looking app icons and splash screens

**Step 6.1: Design App Icon**
- Use Figma, Canva, or hire designer
- Requirements:
  - 1024x1024 PNG
  - No transparency (iOS requirement)
  - Recognizable at small sizes
  - Reflects game theme (life simulation)

**Suggested Themes:**
- Tree of life icon
- Calendar with person silhouette
- Hourglass with world map
- Abstract person path through time

**Step 6.2: Design Splash Screen**
- 1284x2778 PNG (iPhone 13 Pro Max)
- Use app colors: `#0f172a` background, `#60a5fa` accent
- Center logo/title
- Add tagline: "Live Every Life"

**Step 6.3: Generate All Sizes**
```bash
# Install expo-optimize
npm install -g sharp-cli

# Generate icons automatically
npx expo-optimize

# Or use online tool:
# Upload 1024x1024 icon to makeappicon.com
# Download all sizes
# Replace in assets/
```

**Step 6.4: Update app.json**
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      }
    }
  }
}
```

**Step 6.5: Test**
```bash
# Build development app to see real icons
npx eas build --profile development --platform android
```

**Expected Outcome:**
- Professional app icon on home screen
- Branded splash screen on app launch
- No placeholder icons

---

### Phase 7: Setup Testing Infrastructure
**Goal:** Catch bugs before they reach users

**Step 7.1: Install Testing Libraries**
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**Step 7.2: Configure Jest**
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

**Step 7.3: Write Service Tests**
```typescript
// src/services/__tests__/AIEngine.test.ts
import { generateEvent } from '../AIEngine';
import type { Character, GameState } from '../../types';

describe('AIEngine', () => {
  const mockCharacter: Character = {
    name: 'Test',
    country: 'USA',
    year: 2000,
    // ...
  };

  const mockGameState: GameState = {
    level: 1,
    // ...
  };

  it('should generate event with fallback when no API key', async () => {
    const event = await generateEvent(mockCharacter, mockGameState);
    expect(event).toBeDefined();
    expect(event.description).toBeTruthy();
    expect(event.choices).toHaveLength(4);
  });

  it('should have properly typed choices', async () => {
    const event = await generateEvent(mockCharacter, mockGameState);
    event.choices.forEach((choice) => {
      expect(choice).toHaveProperty('text');
      expect(choice).toHaveProperty('effects');
      expect(choice).toHaveProperty('type');
    });
  });
});
```

**Step 7.4: Write Component Tests**
```typescript
// src/components/__tests__/HUD.test.tsx
import { render } from '@testing-library/react-native';
import HUD from '../HUD';

describe('HUD', () => {
  const mockCharacter = {
    name: 'Test',
    health: 80,
    happiness: 60,
    wealth: 50,
    intelligence: 70,
  };

  it('renders character stats correctly', () => {
    const { getByText } = render(<HUD character={mockCharacter} />);
    expect(getByText('Test')).toBeTruthy();
    expect(getByText('80')).toBeTruthy(); // health
  });

  it('shows low health warning when health < 30', () => {
    const lowHealthChar = { ...mockCharacter, health: 20 };
    const { getByText } = render(<HUD character={lowHealthChar} />);
    expect(getByText(/warning|danger/i)).toBeTruthy();
  });
});
```

**Step 7.5: Add Test Scripts**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Step 7.6: Run Tests**
```bash
npm test
```

**Expected Outcome:**
- All tests passing
- 70%+ code coverage
- Confidence in refactoring

---

### Phase 8: Gameplay Improvements
**Goal:** Make the game more engaging

**Step 8.1: Add Tutorial/Onboarding**
```typescript
// src/screens/TutorialScreen.tsx
// Create step-by-step guide for new players
// Explain:
// - How events work
// - Choice types (A/B/C/D)
// - Death mechanics
// - Rewind system
```

**Step 8.2: Improve Event Variety**
- Add more fallback events (currently ~20, need 100+)
- Categorize by:
  - Life stage (childhood, teen, adult, elderly)
  - Country-specific events
  - Profession-specific events
  - Historical events by decade

**Step 8.3: Add Sound Effects**
```typescript
// src/services/AudioService.ts
// Already exists, needs implementation:
await audioService.playSound('button_press');
await audioService.playSound('event_good');
await audioService.playSound('event_bad');
await audioService.playSound('death');
await audioService.playSound('level_complete');
```

**Step 8.4: Add Achievements**
```typescript
// src/services/AchievementService.ts
// Track achievements:
// - Reach 100 health
// - Live to 80 years old
// - Complete all 10 levels
// - Try all professions
// - Visit all countries
```

**Step 8.5: Add Statistics Screen**
```typescript
// src/screens/StatisticsScreen.tsx
// Show player stats:
// - Total games played
// - Total deaths
// - Longest life
// - Favorite country
// - Achievements unlocked
```

**Expected Outcome:**
- More engaging gameplay
- Better user retention
- Clear progression

---

### Phase 9: Monetization Implementation
**Goal:** Enable in-app purchases and ads

**Step 9.1: Configure Adapty**
```typescript
// src/services/MonetizationService.ts
// Already has initializeAdapty()
// Need to:
// 1. Create Adapty account: https://app.adapty.io/
// 2. Add ADAPTY_PUBLIC_KEY to .env
// 3. Create paywalls in Adapty dashboard
// 4. Test purchase flow
```

**Step 9.2: Implement Rewind Purchase**
```typescript
// src/screens/DeathScreen.tsx (create new screen)
// Show when character dies:
// - Death reason
// - Life summary (age, achievements)
// - "Rewind" button (opens paywall)
// - "Start New Life" button (free)

// Rewind prices by level:
const REWIND_PRICES = {
  demo: 0.49,
  1: 0.99,
  2: 1.99,
  // ... up to level 10: $19.99
};
```

**Step 9.3: Configure AdMob**
```typescript
// src/services/AdService.ts
// Already exists, needs:
// 1. Create AdMob account
// 2. Add ADMOB_APP_ID to app.json
// 3. Create ad units (rewarded video)
// 4. Test ads on real device (not emulator)
```

**Step 9.4: Add Rewarded Ads**
```typescript
// Show ad for small rewards:
// - +10 health
// - +10 happiness
// - Extra event hint
// - Reroll bad event

<AdRewardButton
  rewardType="health"
  rewardAmount={10}
  onReward={(reward) => {
    updateCharacter({ health: character.health + reward.amount });
  }}
/>
```

**Step 9.5: Test Purchases (Important!)**
```bash
# Test on real device, not emulator
# Use test payment methods:
# - Android: Use test accounts in Google Play Console
# - iOS: Use Sandbox accounts

npx eas build --profile production --platform android
# Install APK
# Test full purchase flow
```

**Expected Outcome:**
- Rewind purchases working
- Ads showing properly
- Revenue tracking in Adapty dashboard

---

### Phase 10: Production Release Preparation
**Goal:** Ship to app stores

**Step 10.1: Complete Checklist**
```bash
# Run full validation
npm run validate  # type-check + lint
npm test         # all tests
npx expo-doctor  # check project health
```

**Step 10.2: Update Metadata**
```json
// app.json
{
  "expo": {
    "name": "Life Saga",
    "slug": "life-saga",
    "version": "1.0.0",
    "description": "Live a realistic life from 1850 to 2025 across 10 countries",
    "privacy": "public",
    "ios": {
      "bundleIdentifier": "com.lifesaga.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.lifesaga.app",
      "versionCode": 1
    }
  }
}
```

**Step 10.3: Write Store Listings**
```markdown
# App Store Description (all languages: EN, RU, ES)

Title: Life Saga - Realistic Life Simulator

Description:
Live a unique life in every playthrough! Experience realistic events from 1850 to 2025 across 10 countries. Make choices that shape your destiny, from childhood to old age.

Features:
✓ 10 countries with unique cultures
✓ Historical events from 1850-2025
✓ 10 difficulty levels (5 min to 60+ hours)
✓ AI-generated events (powered by Gemini)
✓ Professional learning (PMP, Programming)
✓ Rewind system to change fate
✓ Realistic life simulation

Keywords: life simulator, choices matter, realistic, historical, educational
Category: Games > Simulation
Age Rating: 12+ (mild themes)
```

**Step 10.4: Prepare Screenshots**
- Take 5-7 screenshots on various devices
- Show: Character creation, event choices, HUD, settings
- Add text overlays highlighting features
- Use Figma/Photoshop for polishing

**Step 10.5: Create Privacy Policy**
```markdown
# Privacy Policy for Life Saga

Data Collection:
- Analytics (anonymized gameplay data)
- Crash reports (via Sentry)
- Ad IDs (for personalized ads)
- No personal information collected

Third-party Services:
- Google Analytics
- AdMob
- Adapty
- Sentry

Users can opt-out in Settings.

Full policy: https://lifesaga.app/privacy
```

**Step 10.6: Build Production APK/IPA**
```bash
# Configure EAS
eas login
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

**Step 10.7: Soft Launch**
- Release in 1-2 countries first (test market)
- Monitor crash rate, ANR rate
- Collect user feedback
- Fix critical bugs
- Then release worldwide

**Expected Outcome:**
- App live on Google Play
- App live on App Store
- Ready for user acquisition

---

## Quick Reference

### Key Files
```
App.js (127 lines) - Root component
src/services/AIEngine.ts (661 lines) - AI event generation
src/screens/MainScreen.tsx (879 lines) - Character creation
src/screens/GameScreen.tsx (432 lines) - Gameplay loop
src/context/CharacterContext.tsx - Character state
src/context/GameContext.tsx - Game state
babel.config.js - Babel configuration
package.json - Dependencies
```

### Key Commands
```bash
# Development
npx expo start --clear              # Start Metro bundler
npm run type-check                  # TypeScript validation
npm run lint                        # ESLint check
npm run validate                    # Both checks

# Android
C:\Users\yusif\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_36.1
C:\Users\yusif\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
C:\Users\yusif\AppData\Local\Android\Sdk\platform-tools\adb.exe logcat

# Testing
npm test                           # Run Jest tests
npm run test:coverage              # Coverage report

# Building
eas build --profile development --platform android
eas build --profile production --platform all
```

### Important Paths
```
SDK: C:\Users\yusif\AppData\Local\Android\Sdk
ADB: C:\Users\yusif\AppData\Local\Android\Sdk\platform-tools\adb.exe
Emulator: C:\Users\yusif\AppData\Local\Android\Sdk\emulator\emulator.exe
AVD: Medium_Phone_API_36.1 (Android API 36)
Project: C:\Users\yusif\OneDrive\Desktop\LifeSimulator
```

### Current Versions
```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "typescript": "^5.3.0",
  "node": "24.11.0"
}
```

---

## Critical Notes

1. **DON'T upgrade dependencies without testing** - SDK 54 upgrade was painful
2. **DON'T use react-native-dotenv** - causes Metro crashes, use expo-constants instead
3. **ALWAYS test on real device** - emulator doesn't show all issues
4. **ALWAYS clear Metro cache** - use `--clear` flag after config changes
5. **DON'T skip TypeScript errors** - fix them immediately
6. **ALWAYS use GestureHandlerRootView** - required for touchables to work
7. **TEST purchases on real device** - emulator can't process payments
8. **Keep fallback events** - AI may be rate-limited or fail

---

## Success Criteria

**Phase 1 Complete When:**
- [ ] All buttons respond to touch
- [ ] Navigation works flawlessly
- [ ] No red screens or crashes
- [ ] Can create character and play game

**Phase 2 Complete When:**
- [ ] Environment variables load properly
- [ ] Gemini API key configurable
- [ ] Metro bundler stable

**Phase 3 Complete When:**
- [ ] 100% TypeScript (.tsx/.ts only)
- [ ] 0 TypeScript errors
- [ ] Full IntelliSense working

**Phases 4-10 Complete When:**
- [ ] Performance optimized (Zustand + memoization)
- [ ] Real assets (no placeholders)
- [ ] Tests written (70%+ coverage)
- [ ] Gameplay polished (sounds, achievements, tutorial)
- [ ] Monetization working (ads + IAP)
- [ ] Published to both stores

---

## Contact & Handoff

**User:** yusif (Discord/GitHub: ganbaroff)  
**Repository:** https://github.com/ganbaroff/LifeSimulator  
**Current Branch:** main  
**Last Working State:** Metro running, emulator connected, app loads but UI not clickable

**Handoff Date:** November 27, 2025  
**Next AI:** Start with Phase 1 (Fix Critical UI Bug) - this is blocking everything else.

Good luck! 🚀
