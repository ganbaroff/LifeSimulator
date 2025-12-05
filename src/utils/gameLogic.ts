// src/utils/gameLogic.ts

import { Character, CharacterStats, EventEffects, DifficultyLevel, CharacterSeed, CharacterSkills, CharacterRelationships } from '../types/game';
import { PROFESSIONS } from '../data/professions';
import { DISEASES } from '../data/diseases';
import { getProfessionIncome as getProfessionIncomeFromSystem, canGetProfession as canGetProfessionFromSystem, getAvailableProfessions as getAvailableProfessionsFromSystem, applyProfessionEffects, generateWorkEvent } from './professionSystem';
import { EDUCATION_LEVELS } from '../data/education';

/**
 * Чистые функции для игровой логики
 * Никакого UI, только математика и правила
 */

export const createInitialCharacter = (
  seed: CharacterSeed,
  difficulty: DifficultyLevel
): Character => {
  // Вычисляем возраст на основе года рождения
  const currentYear = new Date().getFullYear();
  const age = Math.max(18, Math.min(65, currentYear - seed.yearBase));
  
  const baseStats: CharacterStats = {
    health: 100,
    happiness: 100,
    energy: 100,
    wealth: 1000,
    ...difficulty.startingBonus,
  };

  const baseSkills: CharacterSkills = {
    intelligence: 20 + Math.floor(Math.random() * 20),
    creativity: 20 + Math.floor(Math.random() * 20),
    social: 20 + Math.floor(Math.random() * 20),
    physical: 20 + Math.floor(Math.random() * 20),
    business: 10 + Math.floor(Math.random() * 15),
    technical: 10 + Math.floor(Math.random() * 15),
  };

  const baseRelationships: CharacterRelationships = {
    family: 50 + Math.floor(Math.random() * 30),
    friends: 30 + Math.floor(Math.random() * 20),
    romantic: 0,
    colleagues: 0,
  };

  return {
    id: generateCharacterId(),
    name: seed.name,
    age: age, // Используем вычисленный возраст
    stats: applyStatBounds(baseStats),
    skills: baseSkills,
    relationships: baseRelationships,
    country: seed.country,
    birthYear: seed.yearBase,
    profession: null,
    educationLevel: null,
    currentDisease: null,
    isAlive: true,
    deathCause: null,
    avatarUrl: null,
    history: [],
    // Add missing required properties
    info: {
      bio: `${seed.name} из ${seed.country}`,
      personality: 'balanced',
      appearance: 'average'
    },
    achievements: [],
    milestones: [],
    rewards: []
  };
};

export const applyEventEffects = (
  currentStats: CharacterStats,
  effects: EventEffects
): CharacterStats => {
  const newStats: CharacterStats = {
    health: currentStats.health + (effects.health || 0),
    happiness: currentStats.happiness + (effects.happiness || 0),
    wealth: currentStats.wealth + (effects.wealth || 0),
    energy: currentStats.energy + (effects.energy || 0),
  };

  return applyStatBounds(newStats);
};

export const applySkillEffects = (
  currentSkills: CharacterSkills,
  effects: EventEffects
): CharacterSkills => {
  const newSkills: CharacterSkills = { ...currentSkills };
  
  if (effects.skills) {
    Object.entries(effects.skills).forEach(([skill, value]) => {
      if (value && skill in newSkills) {
        newSkills[skill as keyof CharacterSkills] = Math.max(0, Math.min(200, 
          newSkills[skill as keyof CharacterSkills] + value
        ));
      }
    });
  }
  
  return newSkills;
};

export const applyRelationshipEffects = (
  currentRelationships: CharacterRelationships,
  effects: EventEffects
): CharacterRelationships => {
  const newRelationships: CharacterRelationships = { ...currentRelationships };
  
  if (effects.relationships) {
    Object.entries(effects.relationships).forEach(([relationship, value]) => {
      if (value && relationship in newRelationships) {
        newRelationships[relationship as keyof CharacterRelationships] = Math.max(-100, Math.min(100, 
          newRelationships[relationship as keyof CharacterRelationships] + value
        ));
      }
    });
  }
  
  return newRelationships;
};

export const ageUpCharacter = (
  character: Character,
  years: number = 1
): Character => {
  const newAge = character.age + years;
  
  // Проверка естественной смерти от старости
  if (newAge >= 80 && Math.random() < 0.1) {
    return {
      ...character,
      age: newAge,
      isAlive: false,
      deathCause: 'Natural causes',
    };
  }

  // Возрастные изменения навыков
  const ageSkillChanges: Partial<CharacterSkills> = {};
  if (newAge < 20) {
    // Молодость - навыки растут быстрее
    ageSkillChanges.intelligence = 2;
    ageSkillChanges.physical = 1;
  } else if (newAge < 50) {
    // Зрелость - стабильный рост
    ageSkillChanges.intelligence = 1;
    ageSkillChanges.business = 1;
  } else if (newAge < 70) {
    // Пожилой возраст - начало спада
    ageSkillChanges.physical = -1;
    ageSkillChanges.intelligence = 0;
  } else {
    // Старость - спад физических навыков
    ageSkillChanges.physical = -2;
    ageSkillChanges.intelligence = -1; // Исправляем с energy на intelligence
  }

  // Применяем возрастные изменения
  const newSkills = applySkillEffects(character.skills, { skills: ageSkillChanges });

  // Проверка заболеваний в пожилом возрасте
  let newDisease = character.currentDisease;
  if (newAge >= 60 && !character.currentDisease) {
    const randomDisease = DISEASES.find(d => 
      (d.id === 'arthritis' || d.id === 'osteoporosis' || d.id === 'alzheimer') &&
      Math.random() < 0.1
    );
    if (randomDisease) {
      newDisease = randomDisease.id;
    }
  }

  // Применяем эффекты профессии если есть
  let updatedCharacter = {
    ...character,
    age: newAge,
    skills: newSkills,
    currentDisease: newDisease,
  };

  if (character.profession) {
    const professionEffects = applyProfessionEffects(updatedCharacter);
    updatedCharacter = { ...updatedCharacter, ...professionEffects };
  }

  return updatedCharacter;
};

export const checkDeathConditions = (
  stats: CharacterStats,
  deathChance: number = 0,
  difficulty: DifficultyLevel
): boolean => {
  // Смерть только от критически низких характеристик
  if (stats.health <= -50) return true;
  if (stats.energy <= -50) return true;
  
  // Смерть от счастья (только при очень низком уровне)
  if (stats.happiness <= -30) return true;
  
  // Случайная смерть с учетом сложности (только если есть deathChance)
  if (deathChance > 0) {
    const totalDeathChance = deathChance * difficulty.deathChanceMultiplier;
    // Уменьшаем базовый шанс смерти для всех уровней
    const adjustedChance = totalDeathChance * 0.1; // Уменьшаем в 10 раз
    if (Math.random() < adjustedChance) {
      return true;
    }
  }

  return false;
};

export const getDeathCause = (
  stats: CharacterStats,
  deathChance: number
): string => {
  if (stats.health <= -50) return 'Critical health failure';
  if (stats.energy <= -50) return 'Complete exhaustion';
  if (stats.happiness <= -30) return 'Severe depression';
  if (deathChance > 0) return 'Unfortunate accident';
  return 'Unknown causes';
};

export const getAgeEventInterval = (age: number): number => {
  if (age < 5) return 2;  // Каждые 2 события в младенчестве
  if (age < 12) return 3; // Каждые 3 события в детстве
  if (age < 18) return 4; // Каждые 4 события в подростковом возрасте
  if (age < 30) return 5; // Каждые 5 событий в юности
  if (age < 50) return 6; // Каждые 6 событий в молодости
  if (age < 70) return 8; // Каждые 8 событий в зрелости
  return 10; // Каждые 10 событий в старости
};

export const getLifeStage = (age: number): string => {
  if (age < 5) return 'младенчество';
  if (age < 12) return 'детство';
  if (age < 18) return 'подростковый возраст';
  if (age < 25) return 'юность';
  if (age < 40) return 'молодость';
  if (age < 60) return 'зрелость';
  if (age < 75) return 'пожилой возраст';
  return 'старость';
};

// Вспомогательные функции
export const applyStatBounds = (stats: CharacterStats): CharacterStats => {
  return {
    health: Math.max(-100, Math.min(200, stats.health)), // Позволяем отрицательные значения до -100
    happiness: Math.max(-50, Math.min(150, stats.happiness)), // Позволяем грусть до -50
    wealth: Math.max(0, Math.min(1000000, stats.wealth)), // Деньги не могут быть отрицательными
    energy: Math.max(-50, Math.min(150, stats.energy)), // Позволяем усталость до -50
  };
};

const generateCharacterId = (): string => {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Валидация
export const validateCharacterSeed = (seed: CharacterSeed): boolean => {
  return !!(
    seed.name?.trim().length >= 2 &&
    seed.country?.trim().length > 0 &&
    seed.yearBase >= 1900 &&
    seed.yearBase <= 2023
  );
};

export const validateDifficultyLevel = (difficulty: any): difficulty is DifficultyLevel => {
  return difficulty && 
    ['easy', 'medium', 'hard'].includes(difficulty.id) &&
    typeof difficulty.name === 'string' &&
    typeof difficulty.deathChanceMultiplier === 'number' &&
    typeof difficulty.historicalDensity === 'number' &&
    difficulty.startingBonus !== undefined;
};

// Новые функции для профессий
export const getProfessionIncome = (professionId: string, characterSkills: CharacterSkills): number => {
  return getProfessionIncomeFromSystem(professionId, characterSkills);
};

export const canGetProfession = (professionId: string, characterSkills: CharacterSkills): boolean => {
  return canGetProfessionFromSystem(professionId, characterSkills);
};

export const getAvailableProfessions = (characterSkills: CharacterSkills) => {
  return getAvailableProfessionsFromSystem(characterSkills);
};

// Новые функции для образования
export const canStartEducation = (educationId: string, characterAge: number, characterSkills: CharacterSkills): boolean => {
  const education = EDUCATION_LEVELS.find(e => e.id === educationId);
  if (!education) return false;
  
  if (characterAge < education.requiredAge) return false;
  
  return Object.entries(education.requiredSkills).every(([skill, required]) => {
    return (characterSkills[skill as keyof CharacterSkills] || 0) >= required;
  });
};

export const getAvailableEducation = (characterAge: number, characterSkills: CharacterSkills) => {
  return EDUCATION_LEVELS.filter(education => canStartEducation(education.id, characterAge, characterSkills));
};

// Новые функции для болезней
export const applyDiseaseEffects = (character: Character): Character => {
  if (!character.currentDisease) return character;
  
  const disease = DISEASES.find(d => d.id === character.currentDisease);
  if (!disease) return character;
  
  const newStats = {
    health: character.stats.health + disease.healthImpact,
    happiness: character.stats.happiness + disease.happinessImpact,
    energy: character.stats.energy + disease.energyImpact,
    wealth: character.stats.wealth,
  };
  
  return {
    ...character,
    stats: applyStatBounds(newStats),
  };
};

export const recoverFromDisease = (character: Character): Character => {
  if (!character.currentDisease) return character;
  
  return {
    ...character,
    currentDisease: null,
  };
};
