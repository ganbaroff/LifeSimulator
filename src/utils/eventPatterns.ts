// src/utils/eventPatterns.ts

import { EventEffects, CharacterSkills, CharacterRelationships } from '../types/game';

export interface EventPattern {
  name: string;
  description: string;
  A: EventEffects;
  B: EventEffects;
  C: EventEffects;
  strategy: 'balanced' | 'risk_reward' | 'specialized' | 'trade_off' | 'random';
}

// База данных паттернов событий
export const EVENT_PATTERNS: EventPattern[] = [
  // Классический баланс (предсказуемый)
  {
    name: 'classic_balance',
    description: 'Классический баланс: безопасность - баланс - риск',
    strategy: 'balanced',
    A: { health: 5, happiness: 0, wealth: 0, energy: 0 },
    B: { health: 0, happiness: 5, wealth: 50, energy: -5 },
    C: { health: -10, happiness: 10, wealth: 200, energy: -10, deathChance: 0.05 }
  },

  // Риск против награды
  {
    name: 'risk_reward',
    description: 'Высокий риск - высокая награда',
    strategy: 'risk_reward',
    A: { health: 10, happiness: -5, wealth: -100, energy: 5 },
    B: { health: 0, happiness: 0, wealth: 0, energy: 0 },
    C: { health: -20, happiness: 20, wealth: 500, energy: -15, deathChance: 0.1 }
  },

  // Специализированные навыки
  {
    name: 'skill_focus',
    description: 'Развитие разных навыков',
    strategy: 'specialized',
    A: { skills: { intelligence: 5 }, health: 0, happiness: 0, wealth: 0, energy: 0 },
    B: { skills: { social: 5 }, health: 0, happiness: 5, wealth: 0, energy: 0 },
    C: { skills: { creativity: 5 }, health: -5, happiness: 10, wealth: 100, energy: -5 }
  },

  // Торговли и компромиссы
  {
    name: 'trade_offs',
    description: 'Плюсы и минусы для каждого варианта',
    strategy: 'trade_off',
    A: { health: 10, happiness: -10, wealth: 0, energy: 5 },
    B: { health: -5, happiness: 5, wealth: 100, energy: -5 },
    C: { health: 0, happiness: 0, wealth: -50, energy: 10 }
  },

  // Социальный фокус
  {
    name: 'social_focus',
    description: 'Влияние на отношения',
    strategy: 'specialized',
    A: { relationships: { family: 10 }, health: 0, happiness: 5, wealth: 0, energy: 0 },
    B: { relationships: { friends: 10 }, health: 0, happiness: 5, wealth: 0, energy: 0 },
    C: { relationships: { romantic: 10 }, health: -5, happiness: 10, wealth: 50, energy: -5 }
  },

  // Финансовые стратегии
  {
    name: 'financial_strategies',
    description: 'Разные подходы к деньгам',
    strategy: 'risk_reward',
    A: { wealth: 50, happiness: 0, health: 0, energy: 0 },
    B: { wealth: 150, happiness: -5, health: -5, energy: -5 },
    C: { wealth: 400, happiness: -10, health: -10, energy: -10, deathChance: 0.05 }
  },

  // Энергетический баланс
  {
    name: 'energy_management',
    description: 'Управление энергией',
    strategy: 'trade_off',
    A: { energy: 15, health: 5, happiness: -5, wealth: -50 },
    B: { energy: 0, health: 0, happiness: 0, wealth: 0 },
    C: { energy: -10, health: -10, happiness: 15, wealth: 200 }
  },

  // Здоровье против успеха
  {
    name: 'health_vs_success',
    description: 'Выбор между здоровьем и успехом',
    strategy: 'trade_off',
    A: { health: 15, happiness: 5, wealth: -100, energy: 10 },
    B: { health: 0, happiness: 0, wealth: 0, energy: 0 },
    C: { health: -15, happiness: 10, wealth: 300, energy: -10 }
  },

  // Интеллектуальные вызовы
  {
    name: 'intellectual_challenges',
    description: 'Умственные нагрузки и награды',
    strategy: 'specialized',
    A: { skills: { intelligence: 10 }, health: -5, happiness: 0, wealth: 100, energy: -10 },
    B: { skills: { business: 5 }, health: 0, happiness: 5, wealth: 150, energy: -5 },
    C: { skills: { technical: 8 }, health: -10, happiness: -5, wealth: 200, energy: -15 }
  },

  // Эмоциональные качели
  {
    name: 'emotional_rollercoaster',
    description: 'Резкие изменения эмоций',
    strategy: 'random',
    A: { happiness: 15, health: 5, wealth: -50, energy: 5 },
    B: { happiness: -10, health: 10, wealth: 100, energy: 0 },
    C: { happiness: 5, health: -5, wealth: 0, energy: 10 }
  },

  // Долгосрочные инвестиции
  {
    name: 'long_term_investment',
    description: 'Краткосрочные потери против долгосрочных выгод',
    strategy: 'risk_reward',
    A: { health: 5, happiness: 5, wealth: -200, energy: 10, skills: { business: 3 } },
    B: { health: 0, happiness: 0, wealth: 0, energy: 0 },
    C: { health: -10, happiness: -5, wealth: -500, energy: -5, skills: { business: 10, intelligence: 5 } }
  },

  // Физические вызовы
  {
    name: 'physical_challenges',
    description: 'Физическая активность и ее последствия',
    strategy: 'trade_off',
    A: { health: 10, energy: -10, happiness: 5, wealth: 0 },
    B: { health: 0, energy: 0, happiness: 0, wealth: 0 },
    C: { health: 15, energy: -20, happiness: 10, wealth: 100, skills: { physical: 5 } }
  },

  // Карьерные решения
  {
    name: 'career_decisions',
    description: 'Выборы влияющие на карьеру',
    strategy: 'specialized',
    A: { wealth: 200, happiness: -5, energy: -5, skills: { business: 3 } },
    B: { wealth: 100, happiness: 5, energy: 0, skills: { social: 3 } },
    C: { wealth: 50, happiness: 10, energy: 5, skills: { creativity: 3 } }
  },

  // Семейные ценности
  {
    name: 'family_values',
    description: 'Выбор между семьей и личными целями',
    strategy: 'trade_off',
    A: { relationships: { family: 15 }, happiness: 10, wealth: -100, energy: 0 },
    B: { relationships: { family: 5 }, happiness: 5, wealth: 0, energy: 0 },
    C: { relationships: { family: -10 }, happiness: -5, wealth: 200, energy: 5 }
  },

  // Образовательные пути
  {
    name: 'educational_paths',
    description: 'Разные подходы к обучению',
    strategy: 'specialized',
    A: { skills: { intelligence: 8 }, wealth: -100, happiness: 0, energy: -5 },
    B: { skills: { social: 5, intelligence: 3 }, wealth: -50, happiness: 5, energy: 0 },
    C: { skills: { creativity: 8 }, wealth: 0, happiness: 10, energy: 5 }
  },

  // Случайные события
  {
    name: 'random_outcomes',
    description: 'Непредсказуемые результаты',
    strategy: 'random',
    A: { health: Math.random() > 0.5 ? 10 : -5, happiness: Math.random() > 0.5 ? 10 : -5, wealth: Math.random() > 0.5 ? 100 : -50, energy: Math.random() > 0.5 ? 5 : -5 },
    B: { health: Math.random() > 0.5 ? 5 : -5, happiness: Math.random() > 0.5 ? 5 : -5, wealth: Math.random() > 0.5 ? 50 : -25, energy: Math.random() > 0.5 ? 0 : -5 },
    C: { health: Math.random() > 0.5 ? 15 : -10, happiness: Math.random() > 0.5 ? 15 : -10, wealth: Math.random() > 0.5 ? 200 : -100, energy: Math.random() > 0.5 ? 10 : -10, deathChance: 0.05 }
  }
];

// Выбор случайного паттерна
export const getRandomPattern = (excludePatterns?: string[]): EventPattern => {
  let availablePatterns = EVENT_PATTERNS;
  
  if (excludePatterns && excludePatterns.length > 0) {
    availablePatterns = EVENT_PATTERNS.filter(p => !excludePatterns.includes(p.name));
  }
  
  return availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
};

// Получение паттерна по стратегии
export const getPatternByStrategy = (strategy: EventPattern['strategy']): EventPattern[] => {
  return EVENT_PATTERNS.filter(p => p.strategy === strategy);
};

// Адаптация паттерна под возраст
export const adaptPatternToAge = (pattern: EventPattern, age: number): EventPattern => {
  const adaptedPattern = { ...pattern };
  
  // В детстве больше фокуса на здоровье и обучение
  if (age < 12) {
    adaptedPattern.A.health = (adaptedPattern.A.health || 0) * 1.5;
    adaptedPattern.B.health = (adaptedPattern.B.health || 0) * 1.2;
    adaptedPattern.C.health = (adaptedPattern.C.health || 0) * 0.8;
    
    // Добавляем навыки в детский возраст
    if (!adaptedPattern.A.skills) adaptedPattern.A.skills = {};
    if (!adaptedPattern.B.skills) adaptedPattern.B.skills = {};
    if (!adaptedPattern.C.skills) adaptedPattern.C.skills = {};
    
    adaptedPattern.A.skills.intelligence = (adaptedPattern.A.skills.intelligence || 0) + 2;
    adaptedPattern.B.skills.intelligence = (adaptedPattern.B.skills.intelligence || 0) + 1;
  }
  
  // В юности больше фокуса на социальные отношения и карьеру
  if (age >= 18 && age < 30) {
    if (!adaptedPattern.A.relationships) adaptedPattern.A.relationships = {};
    if (!adaptedPattern.B.relationships) adaptedPattern.B.relationships = {};
    if (!adaptedPattern.C.relationships) adaptedPattern.C.relationships = {};
    
    adaptedPattern.A.relationships.friends = (adaptedPattern.A.relationships.friends || 0) + 3;
    adaptedPattern.B.relationships.friends = (adaptedPattern.B.relationships.friends || 0) + 5;
    adaptedPattern.C.relationships.romantic = (adaptedPattern.C.relationships.romantic || 0) + 5;
  }
  
  // В зрелости больше фокуса на богатство и стабильность
  if (age >= 30 && age < 60) {
    adaptedPattern.A.wealth = (adaptedPattern.A.wealth || 0) * 1.3;
    adaptedPattern.B.wealth = (adaptedPattern.B.wealth || 0) * 1.5;
    adaptedPattern.C.wealth = (adaptedPattern.C.wealth || 0) * 1.2;
  }
  
  // В пожилом возрасте больше фокуса на здоровье
  if (age >= 60) {
    adaptedPattern.A.health = (adaptedPattern.A.health || 0) * 2;
    adaptedPattern.B.health = (adaptedPattern.B.health || 0) * 1.8;
    adaptedPattern.C.health = (adaptedPattern.C.health || 0) * 1.5;
    
    // Уменьшаем штрафы за здоровье в пожилом возрасте
    if (adaptedPattern.C.health && adaptedPattern.C.health < 0) {
      adaptedPattern.C.health = adaptedPattern.C.health * 0.7;
    }
  }
  
  return adaptedPattern;
};
