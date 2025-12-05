import type { Country, Profession, Level } from '../types';

export const COUNTRIES: Country[] = [
  {
    code: 'USA',
    name: 'USA',
    flag: '🇺🇸',
    hook: 'Boom & bust cycles',
    vibe: 'Silicon Valley + riots',
  },
  {
    code: 'Russia',
    name: 'Russia',
    flag: '🇷🇺',
    hook: 'Collapse & oligarchs',
    vibe: 'Vodka, war, winters',
  },
  {
    code: 'China',
    name: 'China',
    flag: '🇨🇳',
    hook: 'Dynasty to superpower',
    vibe: 'Planning & revolution',
  },
  {
    code: 'India',
    name: 'India',
    flag: '🇮🇳',
    hook: 'License Raj to IT boom',
    vibe: 'Chaos, color, jugaad',
  },
  {
    code: 'Germany',
    name: 'Germany',
    flag: '🇩🇪',
    hook: 'Hyperinflation & order',
    vibe: 'War scars + engineering',
  },
  {
    code: 'Japan',
    name: 'Japan',
    flag: '🇯🇵',
    hook: 'Miracle → Lost decade',
    vibe: 'Discipline, disaster, neon',
  },
  {
    code: 'Brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    hook: 'Coup to carnival',
    vibe: 'Favela hustle, rainforest luck',
  },
  { code: 'UK', name: 'UK', flag: '🇬🇧', hook: 'Empire hangover', vibe: 'Punk, fog, finance' },
  {
    code: 'France',
    name: 'France',
    flag: '🇫🇷',
    hook: 'Revolutions forever',
    vibe: 'Art, strikes, wine',
  },
  {
    code: 'Nigeria',
    name: 'Nigeria',
    flag: '🇳🇬',
    hook: 'Oil & insurgency',
    vibe: 'Afrobeats vs. corruption',
  },
];

export const PROFESSIONS: Profession[] = [
  { id: 'none', label: 'No profession (Levels 1-5)', requiresPro: false },
  { id: 'Programmer', label: 'Programmer', requiresPro: true },
  { id: 'PMP', label: 'Project Manager (PMP)', requiresPro: true },
  { id: 'Doctor', label: 'Doctor', requiresPro: true },
  { id: 'Entrepreneur', label: 'Entrepreneur', requiresPro: true },
  { id: 'Teacher', label: 'Teacher', requiresPro: true },
];

export const LEVELS: Record<string, Level> = {
  DEMO: {
    id: 'demo',
    name: 'Demo Run',
    duration: 300, // 5 min
    requiredCrystals: 0,
    deathChance: 0.1,
    historicalDensity: 0.1,
    rewindPriceUSD: 0,
    rewardCrystals: 10,
    unlocked: true,
    proMode: false,
    perks: 'Preview the saga',
  },
  LEVEL_1: {
    id: 'level_1',
    name: 'Level 1',
    duration: 1200, // 20 min
    requiredCrystals: 0,
    deathChance: 0.15,
    historicalDensity: 0.1,
    rewindPriceUSD: 0.49,
    rewardCrystals: 50,
    unlocked: false,
    proMode: false,
    perks: 'Starter badge',
  },
  LEVEL_2: {
    id: 'level_2',
    name: 'Level 2',
    duration: 2400, // 40 min
    requiredCrystals: 100,
    deathChance: 0.2,
    historicalDensity: 0.15,
    rewindPriceUSD: 0.79,
    rewardCrystals: 80,
    unlocked: false,
    proMode: false,
    perks: 'Streetwise title',
  },
  LEVEL_3: {
    id: 'level_3',
    name: 'Level 3',
    duration: 4800, // 1h20m
    requiredCrystals: 250,
    deathChance: 0.25,
    historicalDensity: 0.2,
    rewindPriceUSD: 0.99,
    rewardCrystals: 120,
    unlocked: false,
    proMode: false,
    perks: 'Urban survivor sticker',
  },
  LEVEL_4: {
    id: 'level_4',
    name: 'Level 4',
    duration: 9000, // 2h30m
    requiredCrystals: 500,
    deathChance: 0.35,
    historicalDensity: 0.25,
    rewindPriceUSD: 1.49,
    rewardCrystals: 200,
    unlocked: false,
    proMode: false,
    perks: 'Bronze insignia',
  },
  LEVEL_5: {
    id: 'level_5',
    name: 'Level 5',
    duration: 14400, // 4h
    requiredCrystals: 1000,
    deathChance: 0.45,
    historicalDensity: 0.3,
    rewindPriceUSD: 1.99,
    rewardCrystals: 400,
    unlocked: false,
    proMode: false,
    perks: 'Silver sticker',
  },
  LEVEL_6: {
    id: 'level_6',
    name: 'Level 6',
    duration: 25200, // 7h
    requiredCrystals: 1500,
    deathChance: 0.55,
    historicalDensity: 0.4,
    rewindPriceUSD: 2.99,
    rewardCrystals: 800,
    unlocked: false,
    proMode: true,
    perks: 'Avatar frame',
  },
  LEVEL_7: {
    id: 'level_7',
    name: 'Level 7',
    duration: 43200, // 12h
    requiredCrystals: 2500,
    deathChance: 0.65,
    historicalDensity: 0.5,
    rewindPriceUSD: 4.99,
    rewardCrystals: 1500,
    unlocked: false,
    proMode: true,
    perks: 'Professional title',
  },
  LEVEL_8: {
    id: 'level_8',
    name: 'Level 8',
    duration: 72000, // 20h
    requiredCrystals: 4000,
    deathChance: 0.75,
    historicalDensity: 0.6,
    rewindPriceUSD: 7.99,
    rewardCrystals: 3000,
    unlocked: false,
    proMode: true,
    perks: 'NFT drop',
  },
  LEVEL_9: {
    id: 'level_9',
    name: 'Level 9',
    duration: 126000, // 35h
    requiredCrystals: 6000,
    deathChance: 0.85,
    historicalDensity: 0.7,
    rewindPriceUSD: 12.99,
    rewardCrystals: 7000,
    unlocked: false,
    proMode: true,
    perks: 'Legend banner',
  },
  LEVEL_10: {
    id: 'level_10',
    name: 'Level 10',
    duration: 216000, // 60h
    requiredCrystals: 9000,
    deathChance: 0.95,
    historicalDensity: 0.8,
    rewindPriceUSD: 19.99,
    rewardCrystals: 12000,
    unlocked: false,
    proMode: true,
    perks: 'Hall of fame',
  },
};

export const CRYSTAL_PACKAGES = [
  { id: 'crystals_50', crystals: 50, price: '$0.99', priceValue: 0.99 },
  { id: 'crystals_150', crystals: 150, price: '$2.99', priceValue: 2.99, popular: true },
  { id: 'crystals_350', crystals: 350, price: '$4.99', priceValue: 4.99 },
  { id: 'crystals_1000', crystals: 1000, price: '$9.99', priceValue: 9.99, bestValue: true },
  { id: 'crystals_3000', crystals: 3000, price: '$24.99', priceValue: 24.99 },
];

export const YEAR_RANGE = {
  MIN: 1850,
  MAX: 2025,
  DECADE_STEP: 10,
  RANDOM_OFFSET: 5,
};

export const AGE_LIMITS = {
  MAX_NATURAL_DEATH: 80,
  AGING_HEALTH_PENALTY_START: 60,
};

export const GAME_LOOP = {
  EVENTS_PER_AGE_UP: 4,
  TIMER_INTERVAL_MS: 1000,
};

// Difficulty Levels Configuration
import type { DifficultyLevel } from '../types/game';

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  easy: {
    id: 'easy',
    name: 'Легкий',
    deathChanceMultiplier: 0.5,
    historicalDensity: 0.8,
    startingBonus: {
      health: 20,
      happiness: 20,
      energy: 20,
      wealth: 500,
    },
  },
  medium: {
    id: 'medium',
    name: 'Средний',
    deathChanceMultiplier: 1.0,
    historicalDensity: 1.0,
    startingBonus: {
      health: 0,
      happiness: 0,
      energy: 0,
      wealth: 0,
    },
  },
  hard: {
    id: 'hard',
    name: 'Сложный',
    deathChanceMultiplier: 1.5,
    historicalDensity: 1.2,
    startingBonus: {
      health: -20,
      happiness: -20,
      energy: -20,
      wealth: -300,
    },
  },
};

export const getDifficultyLevel = (id: string): DifficultyLevel | undefined => {
  return DIFFICULTY_LEVELS[id];
};
