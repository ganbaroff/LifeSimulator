export interface EventEffects {
  health?: number;
  energy?: number;
  happiness?: number;
  wealth?: number;
  skills?: number;
  deathChance?: number;
}

export interface GameEvent {
  event: Event;
  choice: 'A' | 'B' | 'C' | 'D';
  effects: EventEffects;
  timestamp: number;
  age: number;
}

export interface Event {
  id: string;
  source: 'gemini' | 'fallback';
  situation: string;
  A: string;
  B: string;
  C: string;
  D?: string;
  effects: {
    A: EventEffects;
    B: EventEffects;
    C: EventEffects;
    D?: EventEffects;
  };
}

export interface NPC {
  id: string;
  name: string;
  type: 'parent' | 'friend' | 'partner' | 'child';
  gender: 'male' | 'female';
  relationship: number;
  age: number;
}

export interface Asset {
    id: string;
    type: 'vehicle' | 'property' | 'investment';
    name: string;
    description: string;
    cost: number;
    passiveEffect?: (character: Character) => Partial<Character>;
}

export interface Character {
  name: string;
  age: number;
  health: number;
  happiness: number;
  wealth: number;
  skills: number;
  country: string;
  birthCountry?: string;
  birthYear: number;
  profession: string | null;
  lifeGoal: string;
  isAlive: boolean;
  deathCause: string | null;
  avatarUrl: string | null;
  history: GameEvent[];
  assets: Asset[];
  relationships: NPC[];
  flags: string[];
}

export interface GameState {
  currentLevel: string;
  unlockedLevels: string[];
  crystals: number;
  dailyRewardLastClaimed: number | null;
  gameStartTime: number;
  totalPlayTime: number;
  achievements: string[];
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  aiEnabled: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface RiskOutcome {
  isDeath: boolean;
  deathCause?: string;
  effects: EventEffects;
}

export interface LegacyBonus {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: (character: Character) => Partial<Character>;
}

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  impact: EventEffects;
  requirements?: {
    minAge?: number;
    maxAge?: number;
    location?: string;
  };
}

export const defaultGameState: GameState = {
  currentLevel: 'tutorial',
  unlockedLevels: ['tutorial'],
  crystals: 0,
  dailyRewardLastClaimed: null,
  gameStartTime: Date.now(),
  totalPlayTime: 0,
  achievements: [],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    aiEnabled: true,
    language: 'en',
    theme: 'system',
  },
};

export interface Level {
    id: string;
    name: string;
    duration: number;
    requiredCrystals: number;
    deathChance: number;
    historicalDensity: number;
    rewindPriceUSD: number;
    rewardCrystals: number;
    unlocked: boolean;
    proMode: boolean;
    perks: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  hook: string;
  vibe: string;
}

export interface Profession {
  id: string;
  label: string;
  requiresPro: boolean;
}
