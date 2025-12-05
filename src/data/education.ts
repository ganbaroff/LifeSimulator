// src/data/education.ts

import { EducationLevel } from '../types/game';

export const EDUCATION_LEVELS: EducationLevel[] = [
  // Early Education
  {
    id: 'kindergarten',
    name: 'Детский сад',
    requiredAge: 3,
    duration: 3,
    requiredSkills: {},
    skillGrowth: { social: 10, creativity: 5 },
    cost: 500,
    description: 'Первые шаги в социализации и творчестве'
  },
  {
    id: 'preschool',
    name: 'Подготовка к школе',
    requiredAge: 5,
    duration: 2,
    requiredSkills: { social: 10 },
    skillGrowth: { intelligence: 15, social: 5 },
    cost: 800,
    description: 'Подготовка к школьному обучению'
  },

  // Primary Education
  {
    id: 'elementary_school',
    name: 'Начальная школа',
    requiredAge: 6,
    duration: 4,
    requiredSkills: { intelligence: 10 },
    skillGrowth: { intelligence: 20, social: 10, creativity: 5 },
    cost: 0,
    description: 'Базовые знания и социальные навыки'
  },
  {
    id: 'middle_school',
    name: 'Средняя школа',
    requiredAge: 10,
    duration: 3,
    requiredSkills: { intelligence: 30 },
    skillGrowth: { intelligence: 25, social: 15, creativity: 10 },
    cost: 0,
    description: 'Расширение знаний и углубление предметов'
  },
  {
    id: 'high_school',
    name: 'Старшая школа',
    requiredAge: 13,
    duration: 3,
    requiredSkills: { intelligence: 55 },
    skillGrowth: { intelligence: 30, social: 20, creativity: 15 },
    cost: 0,
    description: 'Подготовка к высшему образованию'
  },

  // Higher Education
  {
    id: 'college',
    name: 'Колледж',
    requiredAge: 16,
    duration: 2,
    requiredSkills: { intelligence: 85 },
    skillGrowth: { intelligence: 20, technical: 15, business: 10 },
    cost: 3000,
    description: 'Специализированное техническое образование'
  },
  {
    id: 'university_bachelor',
    name: 'Университет (Бакалавр)',
    requiredAge: 17,
    duration: 4,
    requiredSkills: { intelligence: 85 },
    skillGrowth: { intelligence: 35, social: 20, creativity: 15 },
    cost: 8000,
    description: 'Фундаментальное высшее образование'
  },
  {
    id: 'university_master',
    name: 'Университет (Магистр)',
    requiredAge: 21,
    duration: 2,
    requiredSkills: { intelligence: 120 },
    skillGrowth: { intelligence: 25, social: 15, business: 20 },
    cost: 6000,
    description: 'Углубленная специализация'
  },
  {
    id: 'university_phd',
    name: 'Университет (PhD)',
    requiredAge: 23,
    duration: 4,
    requiredSkills: { intelligence: 145 },
    skillGrowth: { intelligence: 30, creativity: 25, social: 10 },
    cost: 10000,
    description: 'Научная степень и исследования'
  },

  // Specialized Education
  {
    id: 'medical_school',
    name: 'Медицинская школа',
    requiredAge: 18,
    duration: 6,
    requiredSkills: { intelligence: 90, social: 50 },
    skillGrowth: { intelligence: 40, social: 30, physical: 10 },
    cost: 15000,
    description: 'Подготовка врачей и медперсонала'
  },
  {
    id: 'law_school',
    name: 'Юридическая школа',
    requiredAge: 18,
    duration: 4,
    requiredSkills: { intelligence: 95, social: 60 },
    skillGrowth: { intelligence: 35, social: 40, business: 25 },
    cost: 12000,
    description: 'Юриспруденция и правовая практика'
  },
  {
    id: 'business_school',
    name: 'Бизнес-школа',
    requiredAge: 21,
    duration: 2,
    requiredSkills: { intelligence: 110, business: 50, social: 60 },
    skillGrowth: { business: 40, social: 30, intelligence: 20 },
    cost: 20000,
    description: 'MBA и управленческие навыки'
  },

  // Vocational Education
  {
    id: 'technical_school',
    name: 'Техникум',
    requiredAge: 15,
    duration: 3,
    requiredSkills: { intelligence: 70, technical: 30 },
    skillGrowth: { technical: 35, intelligence: 15, physical: 10 },
    cost: 2000,
    description: 'Технические и прикладные навыки'
  },
  {
    id: 'art_school',
    name: 'Художественная школа',
    requiredAge: 14,
    duration: 4,
    requiredSkills: { creativity: 50 },
    skillGrowth: { creativity: 40, social: 20, intelligence: 10 },
    cost: 3000,
    description: 'Искусство и дизайн'
  },
  {
    id: 'music_school',
    name: 'Музыкальная школа',
    requiredAge: 6,
    duration: 8,
    requiredSkills: { creativity: 30 },
    skillGrowth: { creativity: 35, social: 15, physical: 10 },
    cost: 2500,
    description: 'Музыкальное образование и исполнительство'
  }
];

export const getEducationById = (id: string): EducationLevel | undefined => {
  return EDUCATION_LEVELS.find(edu => edu.id === id);
};

export const getAvailableEducation = (age: number, skills: any): EducationLevel[] => {
  return EDUCATION_LEVELS.filter(edu => {
    if (age < edu.requiredAge) return false;
    
    return Object.entries(edu.requiredSkills).every(([skill, required]) => {
      return skills[skill] >= required;
    });
  });
};

export const getEducationByAge = (age: number): EducationLevel[] => {
  return EDUCATION_LEVELS.filter(edu => age >= edu.requiredAge);
};
