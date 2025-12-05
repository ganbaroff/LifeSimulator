// Core game types
export interface Character {
  name: string;
  age: number;
  health: number; // 0-100
  happiness: number; // 0-100
  wealth: number; // 0+
  skills: number; // 0-100
  country: string;
  birthYear: number;
  profession: string | null;
  isAlive: boolean;
  deathCause: string | null;
  avatarUrl: string | null;
  history: GameEvent[];
  createdAt?: number;
}

export interface GameEvent {
  event: Event;
  choice: 'A' | 'B' | 'C' | 'D';
  customInput: string | null;
  effects: EventEffects;
  isDeath: boolean;
  timestamp: number;
  age: number;
}

export interface Event {
  id?: string;
  source?: string;
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
  historicalContext?: string;
  tags?: string[];
}

export interface EventEffects {
  health?: number;
  energy?: number;
  happiness?: number;
  wealth?: number;
  skills?: number;
  deathChance?: number;
  deathCause?: string;
}

export interface Level {
  id: string;
  name: string;
  duration: number; // seconds
  requiredCrystals: number;
  deathChance: number; // C-choice base chance
  historicalDensity: number; // 0-1
  rewindPriceUSD: number;
  rewardCrystals: number;
  unlocked: boolean;
  proMode: boolean;
  perks: string;
}

export interface GameState {
  currentLevel: string;
  crystals: number;
  unlockedLevels: string[];
  achievements: string[];
  dailyRewardLastClaimed?: number | null;
  gameStartTime?: number | null;
  totalPlayTime: number;
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  aiEnabled: boolean;
  language: string;
  theme?: string;
}

export interface HistoricalEvent {
  year: number;
  event: string;
  description: string;
  effects: {
    health: number;
    wealth: number;
    happiness: number;
  };
  tags: string[];
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

export interface CrystalPackage {
  id: string;
  crystals: number;
  price: string;
  priceValue: number;
  popular?: boolean;
  bestValue?: boolean;
}

export type ChoiceType = 'A' | 'B' | 'C' | 'D';

export interface RiskOutcome {
  isDeath: boolean;
  effects: EventEffects;
  deathCause?: string;
}
