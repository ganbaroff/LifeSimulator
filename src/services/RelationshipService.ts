import type { Character, NPC } from '../types';

// RelationshipService.ts - Управляет созданием NPC и динамикой отношений

const MALE_NAMES = ['Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей'];
const FEMALE_NAMES = ['Анастасия', 'Елена', 'Ольга', 'Наталья', 'Екатерина'];
const SURNAMES = ['Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Васильев'];

/**
 * Генерирует случайное имя для NPC
 * @param gender - 'male' или 'female'
 * @returns - Случайное имя
 */
const generateRandomName = (gender: 'male' | 'female'): string => {
  if (gender === 'male') {
    return `${MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`;
  }
  return `${FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}а`;
};

/**
 * Создает начальные отношения для персонажа (родители)
 * @param character - Персонаж
 * @returns - Массив NPC (отец и мать)
 */
export const addInitialRelationships = (character: Character): NPC[] => {
  const father: NPC = {
    id: `npc_${Date.now()}_father`,
    name: generateRandomName('male'),
    type: 'parent',
    gender: 'male',
    relationship: 60, // Уровень отношений от 0 до 100
    age: character.age + 25 + Math.floor(Math.random() * 10),
  };

  const mother: NPC = {
    id: `npc_${Date.now()}_mother`,
    name: generateRandomName('female'),
    type: 'parent',
    gender: 'female',
    relationship: 70,
    age: character.age + 25 + Math.floor(Math.random() * 5),
  };

  return [father, mother];
};

/**
 * Обновляет уровень отношений с конкретным NPC
 * @param relationships - Текущий массив отношений
 * @param npcId - ID NPC, с которым меняются отношения
 * @param change - Значение, на которое нужно изменить отношения (+/-)
 * @returns - Новый массив отношений
 */
export const updateRelationship = (relationships: NPC[], npcId: string, change: number): NPC[] => {
  return relationships.map(npc => {
    if (npc.id === npcId) {
      return {
        ...npc,
        relationship: Math.max(0, Math.min(100, npc.relationship + change)),
      };
    }
    return npc;
  });
};

/**
 * Добавляет нового NPC в список отношений (например, друга или партнера)
 * @param relationships - Текущий массив отношений
 * @param type - 'friend' | 'partner'
 * @param gender - 'male' | 'female'
 * @param age - Возраст NPC
 * @returns - Новый массив отношений с добавленным NPC
 */
export const addNpc = (relationships: NPC[], type: 'friend' | 'partner', gender: 'male' | 'female', age: number): NPC[] => {
    const newNpc: NPC = {
        id: `npc_${Date.now()}`,
        name: generateRandomName(gender),
        type,
        gender,
        relationship: 50,
        age,
    };
    return [...relationships, newNpc];
};
