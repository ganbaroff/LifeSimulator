// src/data/diseases.ts

import { Disease } from '../types/game';

export const DISEASES: Disease[] = [
  // Mild Diseases
  {
    id: 'common_cold',
    name: 'Простуда',
    severity: 'mild',
    healthImpact: -5,
    happinessImpact: -3,
    energyImpact: -10,
    recoveryTime: 3,
    treatmentCost: 50,
    description: 'Легкое респираторное заболевание'
  },
  {
    id: 'headache',
    name: 'Головная боль',
    severity: 'mild',
    healthImpact: -2,
    happinessImpact: -5,
    energyImpact: -5,
    recoveryTime: 1,
    treatmentCost: 20,
    description: 'Временная боль в голове'
  },
  {
    id: 'allergy',
    name: 'Аллергия',
    severity: 'mild',
    healthImpact: -3,
    happinessImpact: -4,
    energyImpact: -8,
    recoveryTime: 5,
    treatmentCost: 100,
    description: 'Аллергическая реакция'
  },

  // Moderate Diseases
  {
    id: 'flu',
    name: 'Грипп',
    severity: 'moderate',
    healthImpact: -15,
    happinessImpact: -8,
    energyImpact: -20,
    recoveryTime: 7,
    treatmentCost: 200,
    description: 'Вирусная инфекция с высокой температурой'
  },
  {
    id: 'gastritis',
    name: 'Гастрит',
    severity: 'moderate',
    healthImpact: -10,
    happinessImpact: -10,
    energyImpact: -15,
    recoveryTime: 10,
    treatmentCost: 300,
    description: 'Воспаление слизистой желудка'
  },
  {
    id: 'depression',
    name: 'Депрессия',
    severity: 'moderate',
    healthImpact: -8,
    happinessImpact: -20,
    energyImpact: -25,
    recoveryTime: 14,
    treatmentCost: 500,
    description: 'Психическое расстройство с подавленным настроением'
  },

  // Severe Diseases
  {
    id: 'pneumonia',
    name: 'Пневмония',
    severity: 'severe',
    healthImpact: -30,
    happinessImpact: -15,
    energyImpact: -35,
    recoveryTime: 21,
    treatmentCost: 1500,
    description: 'Воспаление легких'
  },
  {
    id: 'diabetes',
    name: 'Диабет',
    severity: 'severe',
    healthImpact: -20,
    happinessImpact: -12,
    energyImpact: -20,
    recoveryTime: 30,
    treatmentCost: 2000,
    description: 'Хроническое заболевание обмена веществ'
  },
  {
    id: 'heart_disease',
    name: 'Болезнь сердца',
    severity: 'severe',
    healthImpact: -35,
    happinessImpact: -18,
    energyImpact: -30,
    recoveryTime: 28,
    treatmentCost: 3000,
    description: 'Кардиологическое заболевание'
  },

  // Critical Diseases
  {
    id: 'cancer',
    name: 'Рак',
    severity: 'critical',
    healthImpact: -50,
    happinessImpact: -25,
    energyImpact: -45,
    recoveryTime: 60,
    treatmentCost: 10000,
    description: 'Онкологическое заболевание'
  },
  {
    id: 'stroke',
    name: 'Инсульт',
    severity: 'critical',
    healthImpact: -60,
    happinessImpact: -20,
    energyImpact: -50,
    recoveryTime: 45,
    treatmentCost: 8000,
    description: 'Нарушение мозгового кровообращения'
  },
  {
    id: 'heart_attack',
    name: 'Инфаркт',
    severity: 'critical',
    healthImpact: -70,
    happinessImpact: -22,
    energyImpact: -55,
    recoveryTime: 40,
    treatmentCost: 12000,
    description: 'Острая сердечная недостаточность'
  },

  // Age-related Diseases
  {
    id: 'arthritis',
    name: 'Артрит',
    severity: 'moderate',
    healthImpact: -12,
    happinessImpact: -8,
    energyImpact: -18,
    recoveryTime: 20,
    treatmentCost: 800,
    description: 'Воспаление суставов'
  },
  {
    id: 'osteoporosis',
    name: 'Остеопороз',
    severity: 'moderate',
    healthImpact: -15,
    happinessImpact: -6,
    energyImpact: -15,
    recoveryTime: 25,
    treatmentCost: 1000,
    description: 'Потеря плотности костной ткани'
  },
  {
    id: 'alzheimer',
    name: 'Болезнь Альцгеймера',
    severity: 'severe',
    healthImpact: -25,
    happinessImpact: -30,
    energyImpact: -20,
    recoveryTime: 50,
    treatmentCost: 5000,
    description: 'Нейродегенеративное заболевание'
  }
];

export const getDiseaseById = (id: string): Disease | undefined => {
  return DISEASES.find(disease => disease.id === id);
};

export const getRandomDisease = (age: number, severity?: Disease['severity']): Disease | undefined => {
  let availableDiseases = DISEASES;
  
  // Filter by severity if specified
  if (severity) {
    availableDiseases = availableDiseases.filter(d => d.severity === severity);
  }
  
  // Age-based probability
  const ageMultiplier = Math.max(0.1, age / 80);
  
  if (Math.random() < (0.05 * ageMultiplier)) {
    const randomIndex = Math.floor(Math.random() * availableDiseases.length);
    return availableDiseases[randomIndex];
  }
  
  return undefined;
};

export const getDiseasesBySeverity = (severity: Disease['severity']): Disease[] => {
  return DISEASES.filter(d => d.severity === severity);
};
