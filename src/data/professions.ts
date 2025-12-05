// src/data/professions.ts

import { Profession } from '../types/game';

export const PROFESSIONS: Profession[] = [
  // Education
  {
    id: 'teacher',
    name: 'Учитель',
    category: 'education',
    requiredSkills: { intelligence: 30, social: 40 },
    skillGrowth: { intelligence: 2, social: 1 },
    minIncome: 1500,
    maxIncome: 3500,
    happinessModifier: 5,
    energyModifier: -5,
    description: 'Обучать и вдохновлять следующее поколение'
  },
  {
    id: 'professor',
    name: 'Профессор',
    category: 'education',
    requiredSkills: { intelligence: 70, social: 50 },
    skillGrowth: { intelligence: 3, social: 2 },
    minIncome: 4000,
    maxIncome: 8000,
    happinessModifier: 10,
    energyModifier: -10,
    description: 'Научные исследования и преподавание в университете'
  },

  // Healthcare
  {
    id: 'nurse',
    name: 'Медсестра',
    category: 'healthcare',
    requiredSkills: { social: 50, physical: 30 },
    skillGrowth: { social: 2, physical: 1 },
    minIncome: 2000,
    maxIncome: 4000,
    happinessModifier: 5,
    energyModifier: -15,
    description: 'Забота о здоровье пациентов'
  },
  {
    id: 'doctor',
    name: 'Врач',
    category: 'healthcare',
    requiredSkills: { intelligence: 60, social: 40, physical: 40 },
    skillGrowth: { intelligence: 3, social: 2, physical: 1 },
    minIncome: 5000,
    maxIncome: 10000,
    happinessModifier: 15,
    energyModifier: -20,
    description: 'Диагностика и лечение заболеваний'
  },

  // Technology
  {
    id: 'programmer',
    name: 'Программист',
    category: 'technology',
    requiredSkills: { intelligence: 50, technical: 40 },
    skillGrowth: { intelligence: 2, technical: 3 },
    minIncome: 3000,
    maxIncome: 8000,
    happinessModifier: 5,
    energyModifier: -10,
    description: 'Разработка программного обеспечения и приложений'
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist',
    category: 'technology',
    requiredSkills: { intelligence: 70, technical: 60 },
    skillGrowth: { intelligence: 3, technical: 2 },
    minIncome: 6000,
    maxIncome: 12000,
    happinessModifier: 10,
    energyModifier: -15,
    description: 'Анализ данных и машинное обучение'
  },

  // Business
  {
    id: 'manager',
    name: 'Менеджер',
    category: 'business',
    requiredSkills: { social: 40, business: 30 },
    skillGrowth: { social: 2, business: 2 },
    minIncome: 2500,
    maxIncome: 6000,
    happinessModifier: 5,
    energyModifier: -10,
    description: 'Управление командой и проектами'
  },
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    category: 'business',
    requiredSkills: { business: 50, social: 40 },
    skillGrowth: { business: 4, social: 2 },
    minIncome: 2000,
    maxIncome: 15000,
    happinessModifier: 10,
    energyModifier: -20,
    description: 'Создание и развитие собственного бизнеса'
  },

  // Creative
  {
    id: 'artist',
    name: 'Художник',
    category: 'creative',
    requiredSkills: { creativity: 40, social: 20 },
    skillGrowth: { creativity: 3, social: 1 },
    minIncome: 1000,
    maxIncome: 4000,
    happinessModifier: 10,
    energyModifier: -5,
    description: 'Создание произведений искусства'
  },
  {
    id: 'musician',
    name: 'Музыкант',
    category: 'creative',
    requiredSkills: { creativity: 50, social: 30 },
    skillGrowth: { creativity: 3, social: 2 },
    minIncome: 1500,
    maxIncome: 6000,
    happinessModifier: 15,
    energyModifier: -10,
    description: 'Создание и исполнение музыки'
  },

  // Service
  {
    id: 'waiter',
    name: 'Официант',
    category: 'service',
    requiredSkills: { social: 20, physical: 20 },
    skillGrowth: { social: 2, physical: 1 },
    minIncome: 800,
    maxIncome: 2000,
    happinessModifier: 0,
    energyModifier: -15,
    description: 'Обслуживание посетителей в ресторане'
  },
  {
    id: 'salesperson',
    name: 'Продавец',
    category: 'service',
    requiredSkills: { social: 30, business: 20 },
    skillGrowth: { social: 2, business: 1 },
    minIncome: 1200,
    maxIncome: 3000,
    happinessModifier: 0,
    energyModifier: -10,
    description: 'Продажа товаров и консультация клиентов'
  },

  // Skilled Trades
  {
    id: 'mechanic',
    name: 'Механик',
    category: 'skilled',
    requiredSkills: { technical: 30, physical: 30 },
    skillGrowth: { technical: 2, physical: 1 },
    minIncome: 1500,
    maxIncome: 3500,
    happinessModifier: 0,
    energyModifier: -10,
    description: 'Ремонт и обслуживание автомобилей'
  },
  {
    id: 'carpenter',
    name: 'Плотник',
    category: 'skilled',
    requiredSkills: { technical: 25, physical: 35 },
    skillGrowth: { technical: 2, physical: 2 },
    minIncome: 1200,
    maxIncome: 3000,
    happinessModifier: 0,
    energyModifier: -15,
    description: 'Изготовление мебели и строительные работы'
  }
];

export const getProfessionById = (id: string): Profession | undefined => {
  return PROFESSIONS.find(prof => prof.id === id);
};

export const getAvailableProfessions = (skills: any): Profession[] => {
  return PROFESSIONS.filter(prof => {
    return Object.entries(prof.requiredSkills).every(([skill, required]) => {
      return skills[skill] >= required;
    });
  });
};

export const getProfessionsByCategory = (category: Profession['category']): Profession[] => {
  return PROFESSIONS.filter(prof => prof.category === category);
};
