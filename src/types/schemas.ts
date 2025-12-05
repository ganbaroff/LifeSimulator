/**
 * @file Schema definitions for the Life Simulator application
 * @description Contains Zod schemas for validating game data structures
 */

import { z } from 'zod';

// Constants for validation
const MIN_AGE = 0;
const MAX_AGE = 120;
const MIN_STAT = 0;
const MAX_STAT = 100;
const MIN_YEAR = 1850;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = MIN_YEAR;
const MAX_BIRTH_YEAR = CURRENT_YEAR - MIN_AGE;

/**
 * Schema defining the possible effects of in-game events
 */
export const EventEffectsSchema = z.object({
  health: z.number().min(-100).max(100).optional(),
  happiness: z.number().min(-100).max(100).optional(),
  wealth: z.number().optional(),
  skills: z.number().min(0).max(100).optional(),
  deathChance: z.number().min(0).max(100).optional(),
}).refine(
  (data) => Object.values(data).some(val => val !== undefined),
  { message: 'At least one effect must be provided' }
);

export type HistoryEvent = {
  age: number;
  event: {
    id?: string;
    situation: string;
    source?: string;
  };
  choice: string;
  outcome?: {
    text?: string;
    effects?: z.infer<typeof EventEffectsSchema>;
  };
  timestamp?: number;
};

export const HistoryEventSchema = z.object({
  age: z.number().min(MIN_AGE).max(MAX_AGE),
  event: z.object({
    id: z.string().uuid().optional(),
    situation: z.string().min(1, 'Situation description is required'),
    source: z.string().min(1, 'Source is required').optional(),
  }),
  choice: z.string().min(1, 'Choice description is required'),
  outcome: z.object({
    text: z.string().optional(),
    effects: EventEffectsSchema.optional(),
  }).optional(),
  timestamp: z.number().min(0).optional(),
});

export const CharacterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  age: z.number().min(MIN_AGE).max(MAX_AGE),
  health: z.number().min(MIN_STAT).max(MAX_STAT),
  happiness: z.number().min(MIN_STAT).max(MAX_STAT),
  wealth: z.number().min(0, 'Wealth cannot be negative'),
  skills: z.number().min(0).max(100),
  country: z.string().min(1, 'Country is required'),
  birthYear: z.number()
    .min(MIN_BIRTH_YEAR, `Birth year must be at least ${MIN_BIRTH_YEAR}`)
    .max(MAX_BIRTH_YEAR, `Birth year cannot be later than ${MAX_BIRTH_YEAR}`),
  profession: z.string().nullable().optional(),
  isAlive: z.boolean().default(true),
  deathCause: z.string().nullable().optional(),
  avatarUrl: z.string().url('Invalid URL format').nullable().optional(),
  history: z.array(HistoryEventSchema).default([]),
}).refine(
  (data) => {
    const age = CURRENT_YEAR - data.birthYear;
    return age >= MIN_AGE && age <= MAX_AGE;
  },
  {
    message: `Age must be between ${MIN_AGE} and ${MAX_AGE} years`,
    path: ['birthYear']
  }
).refine(
  (data) => !data.isAlive || data.health > 0,
  {
    message: 'Character must be alive if health is above 0',
    path: ['isAlive']
  }
);

export const GameSettingsSchema = z.object({
  soundEnabled: z.boolean().default(true),
  musicEnabled: z.boolean().default(true),
  aiEnabled: z.boolean().default(true),
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

export const GameStateSchema = z.object({
  currentLevel: z.string().default('tutorial'),
  crystals: z.number().min(0).default(0),
  unlockedLevels: z.array(z.string()).default(['tutorial']),
  achievements: z.array(z.string()).default([]),
  dailyRewardLastClaimed: z.number().nullable().optional(),
  gameStartTime: z.number().default(() => Date.now()),
  totalPlayTime: z.number().min(0).default(0),
  settings: GameSettingsSchema.default({}),
});

export const SaveDataSchema = z.object({
  version: z.number().min(1),
  character: CharacterSchema,
  gameState: GameStateSchema,
  timestamp: z.number(),
});

export type SaveData = z.infer<typeof SaveDataSchema>;

// Helper function to validate save data
export function validateSaveData(data: unknown): SaveData {
  return SaveDataSchema.parse(data);
}

// Helper to create a new game state
export function createNewGame(characterData: Omit<z.infer<typeof CharacterSchema>, 'history' | 'isAlive'>): SaveData {
  return {
    version: 1,
    character: {
      ...characterData,
      isAlive: true,
      history: [],
      health: characterData.health ?? 100,
      happiness: characterData.happiness ?? 100,
      wealth: characterData.wealth ?? 1000,
      skills: characterData.skills ?? 0,
    },
    gameState: GameStateSchema.parse({}),
    timestamp: Date.now(),
  };
}
