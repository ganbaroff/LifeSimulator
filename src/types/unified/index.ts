// 🏗️ Unified Types - Clean Architecture
// Создано: Developer (Agile Team)
// Версия: 3.0.0

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

export interface CharacterEvent {
  id: string;
  type: 'education' | 'career' | 'relationship' | 'health' | 'achievement' | 'milestone';
  title: string;
  description: string;
  year: number;
  age: number;
  impact?: {
    health?: number;
    happiness?: number;
    wealth?: number;
    energy?: number;
    skills?: Partial<CharacterSkills>;
    relationships?: Partial<CharacterRelationships>;
  };
}

export interface Character {
  info: CharacterInfo;
  stats: CharacterStats;
  skills: CharacterSkills;
  relationships: CharacterRelationships;
  history: CharacterEvent[];
  achievements: any[];
  isAlive: boolean;
  deathCause?: string;
}

export interface GameSettings {
  autoSave: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: 'en' | 'az' | 'ru';
  theme: 'light' | 'dark' | 'system';
  gameSpeed: number;
}

export interface GameStatistics {
  totalPlayTime: number;
  sessionsPlayed: number;
  charactersCreated: number;
  achievementsUnlocked: number;
  eventsExperienced: number;
  choicesMade: number;
  longestGame: number;
}

export interface GameState {
  id: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  currentYear: number;
  currentAge: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number;
  settings: GameSettings;
  statistics: GameStatistics;
  character?: Character;
  lastSaved?: number;
}

export interface GameSliceState {
  currentGame: GameState | null;
  loading: boolean;
  error?: string;
  autoSaveEnabled: boolean;
  lastSaved?: number;
}

export interface CharacterSliceState {
  character: Character | null;
  loading: boolean;
  error?: string;
  lastUpdated?: number;
}

// Redux Action Types
export interface AsyncThunkConfig {
  state?: unknown;
  dispatch?: unknown;
  extra?: unknown;
  rejectValue?: unknown;
  serializedErrorType?: unknown;
}
