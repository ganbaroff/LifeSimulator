export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  // Условие для победы будет функцией, которая принимает объект персонажа
  // и возвращает true, если цель достигнута.
  isAchieved: (character: any) => boolean;
}

export const LIFE_GOALS: LifeGoal[] = [
  {
    id: 'millionaire',
    title: 'Стать миллионером',
    description: 'Накопить состояние в $1,000,000, владея при этом домом и машиной.',
    isAchieved: (character) => {
      const hasHouse = character.assets?.some((a: any) => a.type === 'house');
      const hasCar = character.assets?.some((a: any) => a.type === 'car');
      return character.wealth >= 1000000 && hasHouse && hasCar;
    },
  },
  {
    id: 'family_person',
    title: 'Создать большую семью',
    description: 'Вступить в брак и воспитать как минимум троих детей, сохранив с ними хорошие отношения.',
    isAchieved: (character) => {
      const partner = character.relationships?.find((r: any) => r.type === 'partner');
      const children = character.relationships?.filter((r: any) => r.type === 'child');
      const goodRelations = children?.every((c: any) => c.relationship > 70);
      return !!partner && (children?.length || 0) >= 3 && goodRelations;
    },
  },
  {
    id: 'emigrant',
    title: 'Эмигрировать и добиться успеха',
    description: 'Переехать в другую страну и достичь там высокого уровня счастья (90+) и богатства ($100,000+).',
    isAchieved: (character) => {
      return (
        character.country !== character.birthCountry &&
        character.happiness >= 90 &&
        character.wealth >= 100000
      );
    },
  },
  {
    id: 'scientist',
    title: 'Совершить научный прорыв',
    description: 'Достичь 100 очков навыков и успешно завершить уникальное "научное" событие.',
    isAchieved: (character) => {
      const hasBreakthrough = character.flags?.includes('scientific_breakthrough');
      return character.skills >= 100 && hasBreakthrough;
    },
  },
  {
    id: 'hedonist',
    title: 'Прожить жизнь в удовольствие',
    description: 'Никогда не работать на постоянной работе и удержать средний уровень счастья выше 80 к 50 годам.',
    isAchieved: (character) => {
      const averageHappiness = (character.history || []).reduce((acc: number, h: any) => acc + (h.happiness || 0), 0) / (character.history?.length || 1);
      return character.age >= 50 && !character.profession && averageHappiness >= 80;
    },
  },
];
