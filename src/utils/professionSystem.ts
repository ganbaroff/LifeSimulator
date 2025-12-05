// src/utils/professionSystem.ts

import { Character, CharacterSkills } from '../types/game';
import { PROFESSIONS, getProfessionById } from '../data/professions';

/**
 * Проверяет, может ли персонаж получить профессию
 */
export const canGetProfession = (professionId: string, characterSkills: CharacterSkills): boolean => {
  const profession = getProfessionById(professionId);
  if (!profession) return false;
  
  return Object.entries(profession.requiredSkills).every(([skill, required]) => {
    return (characterSkills[skill as keyof CharacterSkills] || 0) >= required;
  });
};

/**
 * Получает список доступных профессий для персонажа
 */
export const getAvailableProfessions = (characterSkills: CharacterSkills) => {
  return PROFESSIONS.filter(profession => canGetProfession(profession.id, characterSkills));
};

/**
 * Рассчитывает доход от профессии с учетом навыков
 */
export const getProfessionIncome = (professionId: string, characterSkills: CharacterSkills): number => {
  const profession = getProfessionById(professionId);
  if (!profession) return 0;
  
  // Базовый доход с учетом навыков
  const skillMultiplier = Object.entries(profession.requiredSkills).reduce((multiplier, [skill, required]) => {
    const characterSkill = characterSkills[skill as keyof CharacterSkills] || 0;
    return multiplier * (1 + (characterSkill - required) / 100);
  }, 1);
  
  return Math.floor(profession.minIncome * skillMultiplier);
};

/**
 * Применяет эффекты профессии к персонажу
 */
export const applyProfessionEffects = (character: Character): Partial<Character> => {
  if (!character.profession) return {};
  
  const profession = getProfessionById(character.profession);
  if (!profession) return {};
  
  const updates: Partial<Character> = {};
  
  // Применяем модификаторы профессии
  if (profession.modifiers) {
    // Обновляем навыки
    if (profession.modifiers.skills) {
      updates.skills = {
        ...character.skills,
        ...Object.entries(profession.modifiers.skills).reduce((acc, [skill, growth]) => {
          const currentValue = character.skills[skill as keyof CharacterSkills] || 0;
          acc[skill as keyof CharacterSkills] = Math.max(0, Math.min(100, currentValue + growth));
          return acc;
        }, {} as Partial<CharacterSkills>)
      };
    }
    
    // Обновляем отношения
    if (profession.modifiers.relationships) {
      updates.relationships = {
        ...character.relationships,
        ...Object.entries(profession.modifiers.relationships).reduce((acc, [rel, growth]) => {
          const currentValue = character.relationships[rel as keyof typeof character.relationships] || 0;
          acc[rel as keyof typeof character.relationships] = Math.max(0, Math.min(100, currentValue + growth));
          return acc;
        }, {} as Partial<typeof character.relationships>)
      };
    }
  }
  
  return updates;
};

/**
 * Генерирует рабочие события на основе профессии
 */
export const generateWorkEvent = (character: Character) => {
  if (!character.profession) return null;
  
  const profession = getProfessionById(character.profession);
  if (!profession) return null;
  
  // Базовые рабочие события
  const workEvents = [
    {
      title: "Рабочий день",
      description: `Обычный рабочий день в должности ${profession.name}`,
      effects: {
        energy: -5,
        wealth: getProfessionIncome(profession.id, character.skills) / 30 // Ежедневный доход
      }
    },
    {
      title: "Сложный проект",
      description: `Интересный проект требует дополнительных усилий`,
      effects: {
        energy: -10,
        happiness: 5,
        wealth: getProfessionIncome(profession.id, character.skills) / 20
      }
    },
    {
      title: "Проблема на работе",
      description: `Возникли трудности, требующие решения`,
      effects: {
        energy: -15,
        happiness: -10,
        skills: { [Object.keys(profession.requiredSkills)[0]]: 2 } // Развитие ключевого навыка
      }
    }
  ];
  
  return workEvents[Math.floor(Math.random() * workEvents.length)];
};
