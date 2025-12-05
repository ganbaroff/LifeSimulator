import type { Character } from '../types';

// TraitsService.ts - Управляет присвоением и снятием черт и состояний

export interface Trait {
  id: string;
  name: string;
  description: string;
}

// Определяем возможные черты и условия их получения/потери
const TRAIT_CONDITIONS: {
  [key: string]: {
    condition: (char: Character) => boolean;
    trait: Trait;
  };
} = {
  SICKLY: {
    condition: (char) => char.health < 20,
    trait: { id: 'sickly', name: 'Болезненный', description: 'Ваше здоровье крайне слабо.' },
  },
  VIGOROUS: {
    condition: (char) => char.health > 90,
    trait: { id: 'vigorous', name: 'Энергичный', description: 'Вы полны сил и энергии.' },
  },
  DEPRESSED: {
    condition: (char) => char.happiness < 20,
    trait: { id: 'depressed', name: 'В депрессии', description: 'Жизнь кажется серой и бессмысленной.' },
  },
  JOYFUL: {
    condition: (char) => char.happiness > 90,
    trait: { id: 'joyful', name: 'Жизнерадостный', description: 'Вы наслаждаетесь каждым моментом.' },
  },
  BROKE: {
    condition: (char) => char.wealth < 100 && char.age > 18,
    trait: { id: 'broke', name: 'На мели', description: 'Денег едва хватает на самое необходимое.' },
  },
  RICH: {
    condition: (char) => char.wealth > 500000,
    trait: { id: 'rich', name: 'Богач', description: 'Вы можете позволить себе многое.' },
  },
  DULL: {
    condition: (char) => char.skills < 10,
    trait: { id: 'dull', name: 'Недалекий', description: 'Вам сложно дается обучение новому.' },
  },
  GENIUS: {
    condition: (char) => char.skills > 90,
    trait: { id: 'genius', name: 'Гений', description: 'Вы с легкостью осваиваете любые навыки.' },
  },
};

/**
 * Обновляет список черт персонажа на основе его текущих параметров.
 * @param character - Объект персонажа.
 * @returns - Новый объект персонажа с обновленным списком черт (flags).
 */
export const updateCharacterTraits = (character: Character): Character => {
  const newFlags: string[] = [];

  // Проверяем каждую черту
  for (const key in TRAIT_CONDITIONS) {
    if (TRAIT_CONDITIONS[key].condition(character)) {
      newFlags.push(TRAIT_CONDITIONS[key].trait.id);
    }
  }

  // Возвращаем копию персонажа с новым набором черт
  return {
    ...character,
    flags: newFlags,
  };
};
