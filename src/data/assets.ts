import type { Character } from '../types';

export interface Asset {
  id: string;
  type: 'vehicle' | 'property' | 'investment';
  name: string;
  description: string;
  cost: number;
  passiveEffect?: (character: Character) => Partial<Character>;
}

export const AVAILABLE_ASSETS: Asset[] = [
  {
    id: 'vehicle_1',
    type: 'vehicle',
    name: 'Старый седан',
    description: 'Не новый, но на ходу. Дает небольшой бонус к счастью.',
    cost: 5000,
    passiveEffect: (char) => ({ happiness: char.happiness + 2 }),
  },
  {
    id: 'vehicle_2',
    type: 'vehicle',
    name: 'Спортивный автомобиль',
    description: 'Быстрый и красивый. Значительно повышает счастье и открывает новые события.',
    cost: 75000,
    passiveEffect: (char) => ({ happiness: char.happiness + 10 }),
  },
  {
    id: 'property_1',
    type: 'property',
    name: 'Маленькая квартира',
    description: 'Скромное, но свое жилье. Снижает ежегодные расходы.',
    cost: 120000,
  },
  {
    id: 'property_2',
    type: 'property',
    name: 'Загородный дом',
    description: 'Просторный дом с участком. Открывает уникальные семейные события.',
    cost: 450000,
  },
  {
    id: 'investment_1',
    type: 'investment',
    name: 'Акции (низкий риск)',
    description: 'Небольшой, но стабильный пассивный доход.',
    cost: 20000,
    passiveEffect: (char) => ({ wealth: char.wealth + 500 }), // Пример: +$500 в год
  },
  {
    id: 'investment_2',
    type: 'investment',
    name: 'Криптовалюта (высокий риск)',
    description: 'Может принести как огромную прибыль, так и большие убытки.',
    cost: 10000,
  },
];
