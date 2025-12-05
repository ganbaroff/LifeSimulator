export interface LegacyBonus {
  id: string;
  name: string;
  description: string;
  cost: number;
  apply: (character: any) => any; // Функция, которая применяет бонус к персонажу
}

export const LEGACY_BONUSES: LegacyBonus[] = [
  {
    id: 'wealth_1',
    name: 'Стартовый капитал',
    description: 'Начать игру с $10,000 в кармане.',
    cost: 100,
    apply: (character) => ({ ...character, wealth: character.wealth + 10000 }),
  },
  {
    id: 'skills_1',
    name: 'Врожденный талант',
    description: 'Начать игру с +15 к навыкам.',
    cost: 150,
    apply: (character) => ({ ...character, skills: character.skills + 15 }),
  },
  {
    id: 'happiness_1',
    name: 'Счастливое детство',
    description: 'Начать игру с +15 к счастью.',
    cost: 80,
    apply: (character) => ({ ...character, happiness: character.happiness + 15 }),
  },
  {
    id: 'health_1',
    name: 'Крепкое здоровье',
    description: 'Начать игру с +15 к здоровью.',
    cost: 80,
    apply: (character) => ({ ...character, health: character.health + 15 }),
  },
  {
    id: 'good_parents',
    name: 'Любящие родители',
    description: 'Начать игру с отличными отношениями с родителями (90/100).',
    cost: 120,
    apply: (character) => ({
      ...character,
      relationships: character.relationships.map((r: any) => 
        r.type === 'parent' ? { ...r, relationship: 90 } : r
      ),
    }),
  },
];
