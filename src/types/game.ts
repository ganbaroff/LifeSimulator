// src/types/game.ts

export interface CharacterInfo {
  id: string;
  name: string;
  age: number;
  birthYear: number;
  birthCity: string;
  gender: 'male' | 'female';
}

export interface CharacterStats {
  health: number;
  happiness: number;
  wealth: number;
  energy: number;
}

export interface CharacterSkills {
  intelligence: number;
  creativity: number;
  social: number;
  physical: number;
  business: number;
  technical: number;
}

export interface CharacterRelationships {
  family: number;
  friends: number;
  romantic: number;
  colleagues: number;
}

export interface Profession {
  id: string;
  name: string;
  category:
    | 'education'
    | 'healthcare'
    | 'technology'
    | 'business'
    | 'creative'
    | 'service'
    | 'skilled';
  requiredSkills: Partial<CharacterSkills>;
  skillGrowth: Partial<CharacterSkills>;
  minIncome: number;
  maxIncome: number;
  happinessModifier: number;
  energyModifier: number;
  description: string;
  modifiers?: {
    skills?: Partial<CharacterSkills>;
    relationships?: Partial<CharacterRelationships>;
  };
}

export interface EducationLevel {
  id: string;
  name: string;
  requiredAge: number;
  duration: number;
  requiredSkills: Partial<CharacterSkills>;
  skillGrowth: Partial<CharacterSkills>;
  cost: number;
  description: string;
}

export interface Disease {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  healthImpact: number;
  happinessImpact: number;
  energyImpact: number;
  recoveryTime: number;
  treatmentCost: number;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  age: number;
  completed: boolean;
  completedAt?: number;
}

export interface RewardEvent {
  id: string;
  type: 'achievement' | 'milestone' | 'bonus';
  title: string;
  description: string;
  reward: {
    crystals?: number;
    experience?: number;
    items?: string[];
  };
  timestamp: number;
  claimed: boolean;
}

export interface Character {
  id: string;
  name: string;
  age: number;
  info: CharacterInfo;
  stats: CharacterStats;
  skills: CharacterSkills;
  relationships: CharacterRelationships;
  country: string;
  birthYear: number;
  birthCity?: string;
  profession?: string;
  education?: string;
  educationLevel?: EducationLevel | null;
  currentDisease: string | null;
  history: GameHistory[];
  achievements: Achievement[];
  milestones: Milestone[];
  rewards: RewardEvent[];
  isAlive: boolean;
  deathCause?: string;
  avatarUrl: string | null;
}

export interface EventEffects {
  health?: number;
  happiness?: number;
  wealth?: number;
  energy?: number;
  skills?: Partial<CharacterSkills>;
  relationships?: Partial<CharacterRelationships>;
  disease?: string;
  profession?: string;
  education?: string;
  deathChance?: number;
}

export interface GameEvent {
  id: string;
  source: 'openai' | 'gemini' | 'fallback' | 'system' | 'historical';
  situation: string;
  A: string; // Текст выбора A
  B: string; // Текст выбора B
  C: string; // Текст выбора C
  effects: {
    A: EventEffects; // Эффекты для выбора A
    B: EventEffects; // Эффекты для выбора B
    C: EventEffects; // Эффекты для выбора C
  };
  isDeath?: boolean; // Сделаем опциональным
}

export interface GameState {
  currentDay: number;
  currentYear: number;
  currentEvent: GameEvent | null;
  eventCount: number;
  isGameActive: boolean;
  isGameOver: boolean;
  difficulty: DifficultyLevel;
  characterSeed: CharacterSeed;
  currentLevel?: string;
  deathCause?: string;
  achievements: Achievement[];
  milestones: Milestone[];
  rewards: RewardEvent[];
}

export interface DifficultyLevel {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  deathChanceMultiplier: number;
  historicalDensity: number;
  startingBonus: Partial<CharacterStats>;
}

export interface CharacterSeed {
  name: string;
  country: string;
  yearBase: number;
  profession: string;
  birthCity?: string; // Добавляем город рождения
}

export interface GameHistory {
  event: GameEvent;
  choice: 'A' | 'B' | 'C';
  effects: EventEffects;
  timestamp: number;
}

// Redux Action types
export interface UpdateCharacterStatsAction {
  type: 'character/updateStats';
  payload: {
    effects: EventEffects;
  };
}

export interface AgeUpCharacterAction {
  type: 'character/ageUp';
  payload: {
    years: number;
  };
}

export interface CreateCharacterAction {
  type: 'character/create';
  payload: {
    seed: CharacterSeed;
    difficulty: DifficultyLevel;
  };
}

export interface SetCurrentEventAction {
  type: 'game/setCurrentEvent';
  payload: {
    event: GameEvent;
  };
}

export interface MakeChoiceAction {
  type: 'game/makeChoice';
  payload: {
    choice: 'A' | 'B' | 'C';
  };
}

export interface StartGameAction {
  type: 'game/start';
  payload: {
    seed: CharacterSeed;
    difficulty: DifficultyLevel;
  };
}

export interface EndGameAction {
  type: 'game/end';
  payload: {
    deathCause: string;
  };
}

export type GameAction =
  | UpdateCharacterStatsAction
  | AgeUpCharacterAction
  | CreateCharacterAction
  | SetCurrentEventAction
  | MakeChoiceAction
  | StartGameAction
  | EndGameAction;
