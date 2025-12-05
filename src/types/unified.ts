// 🏗️ Unified Types - Clean Architecture
// Создано: Developer (Agile Team)
// Версия: 3.0.0

// Base character stats
export interface CharacterStats {
  health: number;
  happiness: number;
  wealth: number;
  energy: number;
}

// Character skills
export interface CharacterSkills {
  intelligence: number;
  creativity: number;
  social: number;
  physical: number;
  business: number;
  technical: number;
}

// Character relationships
export interface CharacterRelationships {
  family: number;
  friends: number;
  romantic: number;
  colleagues: number;
}

// Basic character info
export interface CharacterInfo {
  id: string;
  name: string;
  age: number;
  birthYear: number;
  birthCity: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
}

// Full character state
export interface Character {
  info: CharacterInfo;
  stats: CharacterStats;
  skills: CharacterSkills;
  relationships: CharacterRelationships;
  profession?: string;
  education?: string;
  history: GameEvent[];
  achievements: Achievement[];
  isAlive: boolean;
  deathCause?: string;
}

// Game event
export interface GameEvent {
  id: string;
  type: 'birth' | 'education' | 'career' | 'relationship' | 'health' | 'random' | 'death';
  title: string;
  description: string;
  year: number;
  age: number;
  choices?: EventChoice[];
  selectedChoice?: string;
  impact?: Partial<CharacterStats>;
}

// Event choice
export interface EventChoice {
  id: string;
  text: string;
  description: string;
  impact?: Partial<CharacterStats>;
  requirements?: Partial<CharacterSkills>;
  consequences?: string[];
}

// Achievement
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

// Game state
export interface GameState {
  id: string;
  character: Character;
  currentYear: number;
  currentAge: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number; // 1 = normal, 2 = fast, 0.5 = slow
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  settings: GameSettings;
  statistics: GameStatistics;
}

// Game settings
export interface GameSettings {
  autoSave: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: 'en' | 'az' | 'ru';
  theme: 'light' | 'dark' | 'system';
  gameSpeed: number;
}

// Game statistics
export interface GameStatistics {
  totalPlayTime: number;
  sessionsPlayed: number;
  charactersCreated: number;
  achievementsUnlocked: number;
  eventsExperienced: number;
  choicesMade: number;
  longestGame: number;
}

// Activity state
export interface Activity {
  id: string;
  name: string;
  type: 'education' | 'work' | 'hobby' | 'social' | 'health';
  duration: number;
  startTime: number;
  endTime?: number;
  progress: number;
  impact?: Partial<CharacterStats>;
  skillGains?: Partial<CharacterSkills>;
}

// Activities state
export interface ActivitiesState {
  currentActivity?: Activity;
  completedActivities: Activity[];
  availableActivities: Activity[];
  lastUpdated: number;
}

// UI state
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  error?: string;
  notifications: Notification[];
  modals: {
    characterCreation: boolean;
    settings: boolean;
    achievements: boolean;
    gameEnd: boolean;
  };
  navigation: {
    currentScreen: string;
    previousScreen?: string;
    tabHistory: string[];
  };
}

// Notification
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    text: string;
    onPress: () => void;
  };
}

// Profession
export interface Profession {
  id: string;
  name: string;
  category: 'education' | 'healthcare' | 'technology' | 'business' | 'creative' | 'service' | 'skilled';
  requiredSkills: Partial<CharacterSkills>;
  skillGrowth: Partial<CharacterSkills>;
  minIncome: number;
  maxIncome: number;
  happinessModifier: number;
  energyModifier: number;
  description: string;
  requirements?: {
    age: number;
    education: string;
    skills: Partial<CharacterSkills>;
  };
}

// Education level
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

// Life event template
export interface LifeEventTemplate {
  id: string;
  type: GameEvent['type'];
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  requirements?: {
    stats?: Partial<CharacterStats>;
    skills?: Partial<CharacterSkills>;
    profession?: string;
    education?: string;
  };
  choices: EventChoice[];
  weight: number; // Probability weight
  unique?: boolean; // Can only happen once per character
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation types
export type ScreenName = 
  | 'Home'
  | 'CharacterCreation'
  | 'Game'
  | 'Settings'
  | 'Achievements'
  | 'Profile'
  | 'Statistics';

export type TabName = 'Game' | 'Character' | 'Activities' | 'Settings';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Action types
export interface ActionWithPayload<T, P> {
  type: T;
  payload: P;
}

export interface ActionWithoutPayload<T> {
  type: T;
}
