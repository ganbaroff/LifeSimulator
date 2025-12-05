// src/utils/rewardSystem.ts

import { Character, CharacterSkills, CharacterRelationships } from '../types/game';
import { PROFESSIONS } from '../data/professions';
import { EDUCATION_LEVELS } from '../data/education';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: 'skill' | 'relationship' | 'age' | 'wealth' | 'education' | 'profession' | 'combo';
    value: any;
  };
  reward: {
    happiness?: number;
    wealth?: number;
    skills?: Partial<CharacterSkills>;
    relationships?: Partial<CharacterRelationships>;
  };
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  age: number;
  reward: {
    happiness: number;
    wealth: number;
    skills?: Partial<CharacterSkills>;
  };
  completed: boolean;
  completedAt?: number;
}

export interface RewardEvent {
  id: string;
  type: 'achievement' | 'milestone' | 'bonus' | 'penalty';
  name: string;
  description: string;
  effects: {
    happiness?: number;
    wealth?: number;
    skills?: Partial<CharacterSkills>;
    relationships?: Partial<CharacterRelationships>;
  };
  timestamp: number;
}

// База данных достижений
export const ACHIEVEMENTS: Achievement[] = [
  // Навыковые достижения
  {
    id: 'genius',
    name: 'Гений',
    description: 'Достигните 100 интеллекта',
    requirement: { type: 'skill', value: { intelligence: 100 } },
    reward: { happiness: 20, wealth: 1000, skills: { business: 10 } },
    unlocked: false
  },
  {
    id: 'master_creator',
    name: 'Мастер творчества',
    description: 'Достигните 100 креативности',
    requirement: { type: 'skill', value: { creativity: 100 } },
    reward: { happiness: 25, wealth: 800, skills: { social: 5 } },
    unlocked: false
  },
  {
    id: 'social_butterfly',
    name: 'Социальная бабочка',
    description: 'Достигните 100 социальных навыков',
    requirement: { type: 'skill', value: { social: 100 } },
    reward: { happiness: 30, wealth: 500, relationships: { friends: 20 } },
    unlocked: false
  },
  {
    id: 'athlete',
    name: 'Атлет',
    description: 'Достигните 100 физической подготовки',
    requirement: { type: 'skill', value: { physical: 100 } },
    reward: { happiness: 15, wealth: 300, skills: { physical: 10 } }, // Исправляем с energy на physical
    unlocked: false
  },
  {
    id: 'business_mogul',
    name: 'Магнат бизнеса',
    description: 'Достигните 100 бизнес навыков',
    requirement: { type: 'skill', value: { business: 100 } },
    reward: { happiness: 20, wealth: 5000, skills: { intelligence: 5 } },
    unlocked: false
  },
  {
    id: 'tech_wizard',
    name: 'Технологический волшебник',
    description: 'Достигните 100 технических навыков',
    requirement: { type: 'skill', value: { technical: 100 } },
    reward: { happiness: 15, wealth: 3000, skills: { creativity: 5 } },
    unlocked: false
  },

  // Реляционные достижения
  {
    id: 'family_hero',
    name: 'Герой семьи',
    description: 'Достигните 80 отношений с семьей',
    requirement: { type: 'relationship', value: { family: 80 } },
    reward: { happiness: 25, relationships: { family: 10 } },
    unlocked: false
  },
  {
    id: 'popular',
    name: 'Популярный',
    description: 'Достигните 80 отношений с друзьями',
    requirement: { type: 'relationship', value: { friends: 80 } },
    reward: { happiness: 20, relationships: { friends: 10 } },
    unlocked: false
  },
  {
    id: 'romantic_master',
    name: 'Мастер романтики',
    description: 'Достигните 80 романтических отношений',
    requirement: { type: 'relationship', value: { romantic: 80 } },
    reward: { happiness: 30, relationships: { romantic: 10 } },
    unlocked: false
  },

  // Возрастные достижения
  {
    id: 'teenager',
    name: 'Подросток',
    description: 'Достигните 13 лет',
    requirement: { type: 'age', value: 13 },
    reward: { happiness: 10, wealth: 200 },
    unlocked: false
  },
  {
    id: 'adult',
    name: 'Взрослый',
    description: 'Достигните 18 лет',
    requirement: { type: 'age', value: 18 },
    reward: { happiness: 15, wealth: 500 },
    unlocked: false
  },
  {
    id: 'middle_age',
    name: 'Зрелый возраст',
    description: 'Достигните 40 лет',
    requirement: { type: 'age', value: 40 },
    reward: { happiness: 20, wealth: 1000 },
    unlocked: false
  },
  {
    id: 'elder',
    name: 'Почтенный возраст',
    description: 'Достигните 70 лет',
    requirement: { type: 'age', value: 70 },
    reward: { happiness: 25, wealth: 2000 },
    unlocked: false
  },

  // Финансовые достижения
  {
    id: 'rich',
    name: 'Богатый',
    description: 'Накопите $10,000',
    requirement: { type: 'wealth', value: 10000 },
    reward: { happiness: 20, wealth: 1000 },
    unlocked: false
  },
  {
    id: 'millionaire',
    name: 'Миллионер',
    description: 'Накопите $1,000,000',
    requirement: { type: 'wealth', value: 1000000 },
    reward: { happiness: 50, wealth: 10000 },
    unlocked: false
  },

  // Образовательные достижения
  {
    id: 'high_school_graduate',
    name: 'Выпускник школы',
    description: 'Завершите среднюю школу',
    requirement: { type: 'education', value: 'high_school' },
    reward: { happiness: 15, wealth: 300, skills: { intelligence: 5 } },
    unlocked: false
  },
  {
    id: 'college_graduate',
    name: 'Выпускник колледжа',
    description: 'Завершите колледж',
    requirement: { type: 'education', value: 'college' },
    reward: { happiness: 20, wealth: 1000, skills: { technical: 10 } },
    unlocked: false
  },
  {
    id: 'university_graduate',
    name: 'Выпускник университета',
    description: 'Получите степень бакалавра',
    requirement: { type: 'education', value: 'university_bachelor' },
    reward: { happiness: 25, wealth: 2000, skills: { business: 5 } },
    unlocked: false
  },

  // Профессиональные достижения
  {
    id: 'first_job',
    name: 'Первая работа',
    description: 'Получите первую профессию',
    requirement: { type: 'profession', value: 'any' },
    reward: { happiness: 10, wealth: 500 },
    unlocked: false
  },
  {
    id: 'professional',
    name: 'Профессионал',
    description: 'Достигните максимального уровня в профессии',
    requirement: { type: 'profession', value: 'max_level' },
    reward: { happiness: 30, wealth: 3000 },
    unlocked: false
  }
];

// База данных этапов жизни
export const MILESTONES: Milestone[] = [
  {
    id: 'first_birthday',
    name: 'Первый день рождения',
    description: 'Вам исполнился 1 год!',
    age: 1,
    reward: { happiness: 10, wealth: 100, skills: { social: 5 } },
    completed: false
  },
  {
    id: 'school_start',
    name: 'Первый день в школе',
    description: 'Вы пошли в школу!',
    age: 6,
    reward: { happiness: 15, wealth: 200, skills: { intelligence: 10 } },
    completed: false
  },
  {
    id: 'teenage_years',
    name: 'Подростковый возраст',
    description: 'Вы стали подростком!',
    age: 13,
    reward: { happiness: 20, wealth: 300, skills: { social: 10, creativity: 5 } },
    completed: false
  },
  {
    id: 'driving_age',
    name: 'Возраст вождения',
    description: 'Вы достигли возраста вождения!',
    age: 16,
    reward: { happiness: 25, wealth: 500, skills: { physical: 5, business: 5 } },
    completed: false
  },
  {
    id: 'adulthood',
    name: 'Совершеннолетие',
    description: 'Вы стали взрослым!',
    age: 18,
    reward: { happiness: 30, wealth: 1000, skills: { business: 10, social: 10 } },
    completed: false
  },
  {
    id: 'career_start',
    name: 'Начало карьеры',
    description: 'Время начинать карьеру!',
    age: 22,
    reward: { happiness: 25, wealth: 2000, skills: { business: 15 } },
    completed: false
  },
  {
    id: 'prime_age',
    name: 'Пик возраста',
    description: 'Вы в расцвете сил!',
    age: 30,
    reward: { happiness: 35, wealth: 3000, skills: { intelligence: 10, business: 10 } },
    completed: false
  },
  {
    id: 'mid_life',
    name: 'Середина жизни',
    description: 'Средний возраст!',
    age: 45,
    reward: { happiness: 30, wealth: 4000, skills: { social: 15 } },
    completed: false
  },
  {
    id: 'senior_age',
    name: 'Пожилой возраст',
    description: 'Вы стали пожилым!',
    age: 65,
    reward: { happiness: 25, wealth: 5000, skills: { intelligence: 5 } },
    completed: false
  },
  {
    id: 'golden_years',
    name: 'Золотые годы',
    description: 'Пенсионный возраст!',
    age: 70,
    reward: { happiness: 40, wealth: 6000 },
    completed: false
  }
];

// Проверка достижений
export const checkAchievements = (character: Character): Achievement[] => {
  const unlockedAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.unlocked) return;

    let isUnlocked = false;

    switch (achievement.requirement.type) {
      case 'skill':
        isUnlocked = Object.entries(achievement.requirement.value).every(
          ([skill, required]) => character.skills[skill as keyof CharacterSkills] >= (required as number)
        );
        break;

      case 'relationship':
        isUnlocked = Object.entries(achievement.requirement.value).every(
          ([relationship, required]) => character.relationships[relationship as keyof CharacterRelationships] >= (required as number)
        );
        break;

      case 'age':
        isUnlocked = character.age >= achievement.requirement.value;
        break;

      case 'wealth':
        isUnlocked = character.stats.wealth >= achievement.requirement.value;
        break;

      case 'education':
        if (achievement.requirement.value === 'any') {
          isUnlocked = !!character.educationLevel;
        } else {
          isUnlocked = character.educationLevel === achievement.requirement.value;
        }
        break;

      case 'profession':
        if (achievement.requirement.value === 'any') {
          isUnlocked = !!character.profession;
        } else if (achievement.requirement.value === 'max_level') {
          const profession = PROFESSIONS.find(p => p.id === character.profession);
          isUnlocked = !!profession && character.stats.wealth >= profession.maxIncome * 0.8;
        }
        break;
    }

    if (isUnlocked) {
      unlockedAchievements.push({
        ...achievement,
        unlocked: true,
        unlockedAt: Date.now()
      });
    }
  });

  return unlockedAchievements;
};

// Проверка этапов жизни
export const checkMilestones = (character: Character): Milestone[] => {
  const completedMilestones: Milestone[] = [];

  MILESTONES.forEach(milestone => {
    if (milestone.completed) return;

    if (character.age >= milestone.age) {
      completedMilestones.push({
        ...milestone,
        completed: true,
        completedAt: Date.now()
      });
    }
  });

  return completedMilestones;
};

// Генерация бонусных событий
export const generateBonusEvent = (character: Character): RewardEvent | null => {
  const bonusChance = Math.random();
  
  if (bonusChance < 0.1) { // 10% шанс на бонус
    const bonuses = [
      {
        id: 'lottery_win',
        type: 'bonus' as const,
        name: 'Выигрыш в лотерею!',
        description: 'Вы выиграли в лотерею небольшую сумму!',
        effects: { wealth: 500, happiness: 15 },
        timestamp: Date.now()
      },
      {
        id: 'inheritance',
        type: 'bonus' as const,
        name: 'Наследство!',
        description: 'Вы получили наследство от дальнего родственника!',
        effects: { wealth: 2000, happiness: 20 },
        timestamp: Date.now()
      },
      {
        id: 'promotion',
        type: 'bonus' as const,
        name: 'Повышение!',
        description: 'Вас повысили на работе!',
        effects: { wealth: 1000, happiness: 25, skills: { business: 5 } },
        timestamp: Date.now()
      },
      {
        id: 'gift',
        type: 'bonus' as const,
        name: 'Подарок!',
        description: 'Вы получили приятный подарок!',
        effects: { happiness: 10, relationships: { friends: 5 } },
        timestamp: Date.now()
      }
    ];

    return bonuses[Math.floor(Math.random() * bonuses.length)];
  }

  return null;
};
