import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
export type ActivityEffect = {
  energy?: number;
  money?: number;
  health?: number;
  happiness?: number;
  skill?: number;
};

export type ActivityRequirements = {
  minAge?: number;
  minMoney?: number;
  minHealth?: number;
  minHappiness?: number;
  minEnergy?: number;
  unlockedActivities?: string[];
};

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: 'work' | 'rest' | 'social' | 'health' | 'learning';
  energyCost: number;
  duration: number; // in minutes
  cooldown: number; // in minutes
  effects: ActivityEffect;
  requirements: ActivityRequirements;
  unlocked: boolean;
  visible: boolean;
  dailyLimit?: number;
  dailyCount?: number;
  lastPerformed?: number;
}

export type ActivitiesState = {
  activities: Activity[];
  availableActivities: Activity[];
  currentActivity: string | null;
  activityStartTime: number | null;
  activityCooldown: number;
  lastUpdated: number;
};

// Constants
const MINUTE = 60 * 1000; // in milliseconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Default activity template
const createActivity = (data: Partial<Activity> & Pick<Activity, 'id' | 'name' | 'description' | 'category' | 'energyCost' | 'duration'>): Activity => ({
  id: data.id,
  name: data.name,
  description: data.description,
  category: data.category,
  energyCost: data.energyCost,
  duration: data.duration,
  cooldown: data.cooldown || 0,
  effects: data.effects || {},
  requirements: data.requirements || {},
  unlocked: data.unlocked ?? true,
  visible: data.visible ?? true,
  dailyLimit: data.dailyLimit,
  dailyCount: data.dailyCount || 0,
  lastPerformed: data.lastPerformed,
});

// Initial activities data
const initialActivities: Activity[] = [
  createActivity({
    id: 'work_part_time',
    name: 'Part-time Job',
    description: 'Earn some money with a part-time job',
    category: 'work',
    energyCost: 30,
    duration: 240, // 4 hours
    cooldown: 0,
    effects: { money: 150 },
    requirements: { minAge: 16 },
    dailyLimit: 1,
  }),
  createActivity({
    id: 'work_full_time',
    name: 'Full-time Job',
    description: 'Earn more money with a full-time job',
    category: 'work',
    energyCost: 60,
    duration: 480, // 8 hours
    cooldown: 0,
    effects: { money: 300 },
    requirements: { minAge: 18, minEnergy: 40 },
    unlocked: false,
  }),
  createActivity({
    id: 'sleep',
    name: 'Sleep',
    description: 'Rest and recover energy',
    category: 'rest',
    energyCost: -80, // Negative because it restores energy
    duration: 480, // 8 hours
    cooldown: DAY, // Can sleep once per day
    effects: { energy: 80, health: 5, happiness: 5 },
    dailyLimit: 1,
  }),
  createActivity({
    id: 'exercise',
    name: 'Exercise',
    description: 'Improve your health and fitness',
    category: 'health',
    energyCost: 40,
    duration: 60,
    cooldown: 12 * HOUR,
    effects: { health: 10, happiness: 5, energy: -20 },
    requirements: { minEnergy: 20 },
  }),
  createActivity({
    id: 'study',
    name: 'Study',
    description: 'Improve your knowledge and skills',
    category: 'learning',
    energyCost: 30,
    duration: 120,
    effects: { skill: 5, happiness: -5 },
    requirements: { minEnergy: 20 },
  }),
  createActivity({
    id: 'socialize',
    name: 'Socialize',
    description: 'Spend time with friends',
    category: 'social',
    energyCost: 20,
    duration: 180,
    cooldown: 6 * HOUR,
    effects: { happiness: 20, energy: -15, money: -50 },
    requirements: { minMoney: 50, minEnergy: 20 },
  }),
];

const initialState: ActivitiesState = {
  activities: [],
  availableActivities: initialActivities,
  currentActivity: null,
  activityStartTime: null,
  activityCooldown: 0,
  lastUpdated: Date.now(),
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    startActivity: (state, action: PayloadAction<string>) => {
      const activity = state.availableActivities.find(a => a.id === action.payload);
      
      if (!activity || state.currentActivity) return;
      
      // Reset daily counts if it's a new day
      const now = Date.now();
      const lastUpdate = new Date(state.lastUpdated);
      const currentDate = new Date(now);
      
      if (lastUpdate.getDate() !== currentDate.getDate() || 
          lastUpdate.getMonth() !== currentDate.getMonth() || 
          lastUpdate.getFullYear() !== currentDate.getFullYear()) {
        state.availableActivities = state.availableActivities.map(a => ({
          ...a,
          dailyCount: 0,
        }));
      }
      
      state.currentActivity = activity.id;
      state.activityStartTime = now;
      state.activityCooldown = activity.duration;
      state.lastUpdated = now;
    },
    
    updateActivityProgress: (state, action: PayloadAction<number>) => {
      if (!state.currentActivity || !state.activityStartTime) return;
      
      const now = Date.now();
      const elapsed = now - (state.activityStartTime || now);
      const activity = state.availableActivities.find(a => a.id === state.currentActivity);
      
      if (!activity) return;
      
      const remaining = Math.max(0, activity.duration - (elapsed / MINUTE));
      state.activityCooldown = remaining;
      
      if (remaining <= 0) {
        // Activity completed
        state.availableActivities = state.availableActivities.map(a => 
          a.id === activity.id 
            ? { 
                ...a, 
                lastPerformed: now,
                dailyCount: (a.dailyCount || 0) + 1,
              } 
            : a
        );
        
        state.currentActivity = null;
        state.activityStartTime = null;
      }
      
      state.lastUpdated = now;
    },
    
    cancelActivity: (state) => {
      if (!state.currentActivity) return;
      
      state.currentActivity = null;
      state.activityStartTime = null;
      state.activityCooldown = 0;
      state.lastUpdated = Date.now();
    },
    
    unlockActivity: (state, action: PayloadAction<string>) => {
      state.availableActivities = state.availableActivities.map(activity => 
        activity.id === action.payload 
          ? { ...activity, unlocked: true, visible: true } 
          : activity
      );
    },
    
    discoverActivity: (state, action: PayloadAction<string>) => {
      state.availableActivities = state.availableActivities.map(activity => 
        activity.id === action.payload 
          ? { ...activity, visible: true } 
          : activity
      );
    },
    
    resetDailyCounts: (state) => {
      state.availableActivities = state.availableActivities.map(activity => ({
        ...activity,
        dailyCount: 0,
      }));
    },
  },
});

// Selectors
export const selectAllActivities = (state: RootState) => 
  state.activities.availableActivities;

export const selectCurrentActivity = (state: RootState) => 
  state.activities.availableActivities.find(
    a => a.id === state.activities.currentActivity
  ) || null;

export const selectAvailableActivities = createSelector(
  [selectAllActivities, (state: RootState) => state.game.player],
  (activities, player) => {
    const now = Date.now();
    
    return activities.filter(activity => {
      // Check if activity is unlocked and visible
      if (!activity.unlocked || !activity.visible) return false;
      
      // Check daily limit
      if (activity.dailyLimit && (activity.dailyCount || 0) >= activity.dailyLimit) {
        return false;
      }
      
      // Check cooldown
      if (activity.lastPerformed && (now - activity.lastPerformed) < (activity.cooldown || 0)) {
        return false;
      }
      
      // Check requirements
      if (activity.requirements) {
        const { minAge, minMoney, minHealth, minHappiness, minEnergy } = activity.requirements;
        
        if (minAge !== undefined && player.age < minAge) return false;
        if (minMoney !== undefined && player.money < minMoney) return false;
        if (minHealth !== undefined && player.health < minHealth) return false;
        if (minHappiness !== undefined && player.happiness < minHappiness) return false;
        if (minEnergy !== undefined && player.energy < minEnergy) return false;
        
        // Check for required unlocked activities
        if (activity.requirements.unlockedActivities) {
          const unlockedActivityIds = activities
            .filter(a => a.unlocked)
            .map(a => a.id);
          
          const hasAllRequirements = activity.requirements.unlockedActivities.every(
            reqId => unlockedActivityIds.includes(reqId)
          );
          
          if (!hasAllRequirements) return false;
        }
      }
      
      return true;
    });
  }
);

export const selectActivityProgress = (state: RootState) => {
  if (!state.activities.currentActivity || state.activities.activityCooldown <= 0) {
    return { progress: 0, timeRemaining: 0 };
  }
  
  const activity = state.activities.availableActivities.find(
    a => a.id === state.activities.currentActivity
  );
  
  if (!activity) return { progress: 0, timeRemaining: 0 };
  
  const progress = ((activity.duration - state.activities.activityCooldown) / activity.duration) * 100;
  const timeRemaining = Math.ceil(state.activities.activityCooldown);
  
  return { progress, timeRemaining };
};

export const selectIsActivityInProgress = (state: RootState) => 
  state.activities.currentActivity !== null;

export const {
  startActivity,
  updateActivityProgress,
  cancelActivity,
  unlockActivity,
  discoverActivity,
  resetDailyCounts,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
