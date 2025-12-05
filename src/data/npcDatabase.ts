// База данных NPC (неигровых персонажей)
export interface NPC {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  personality: string;
  appearance: string;
  background: string;
  relationship: number; // -100 до 100
  status: 'stranger' | 'acquaintance' | 'friend' | 'best_friend' | 'romantic' | 'enemy';
  canMeetAt: string[]; // Где можно встретить
  specialEvents: string[]; // Особые события с этим NPC
}

export const NPC_DATABASE: NPC[] = [
  {
    id: 'alex_best_friend',
    name: 'Алексей Петров',
    age: 25,
    gender: 'male',
    personality: 'Дружелюбный, надежный, немного застенчивый',
    appearance: 'Среднего роста, каштановые волосы, зеленые глаза',
    background: 'Детский друг, вместе выросли в одном районе',
    relationship: 75,
    status: 'best_friend',
    canMeetAt: ['school', 'university', 'work', 'park'],
    specialEvents: ['birthday_party', 'graduation', 'wedding']
  },
  {
    id: 'maria_romantic',
    name: 'Мария Соколова',
    age: 24,
    gender: 'female',
    personality: 'Интеллигентная, мечтательная, добрая',
    appearance: 'Высокая, длинные светлые волосы, голубые глаза',
    background: 'Однокурсница по университету, изучали литературу',
    relationship: 50,
    status: 'acquaintance',
    canMeetAt: ['university', 'library', 'cafe', 'park'],
    specialEvents: ['first_date', 'valentine_day', 'anniversary']
  },
  {
    id: 'igor_mentor',
    name: 'Игорь Волков',
    age: 45,
    gender: 'male',
    personality: 'Строгий, мудрый, требовательный',
    appearance: 'Крепкий, коротко стриженные волосы, усы',
    background: 'Начальник на первой работе, научил многому',
    relationship: 60,
    status: 'friend',
    canMeetAt: ['work', 'business_meeting', 'conference'],
    specialEvents: ['promotion', 'project_success', 'retirement']
  },
  {
    id: 'anna_rival',
    name: 'Анна Белова',
    age: 26,
    gender: 'female',
    personality: 'Амбициозная, конкурентоспособная, хитрая',
    appearance: 'Стройная, темные волосы, пронзительный взгляд',
    background: 'Коллега по работе, постоянно конкурирует за повышение',
    relationship: -20,
    status: 'enemy',
    canMeetAt: ['work', 'office', 'meeting'],
    specialEvents: ['competition', 'conflict', 'reconciliation']
  },
  {
    id: 'dmitri_family',
    name: 'Дмитрий Смирнов',
    age: 30,
    gender: 'male',
    personality: 'Заботливый, семейный, спокойный',
    appearance: 'Высокий, светло-каштановые волосы, очки',
    background: 'Двоюродный брат, семья всегда поддерживала',
    relationship: 80,
    status: 'friend',
    canMeetAt: ['family_gathering', 'holiday', 'home'],
    specialEvents: ['family_dinner', 'holiday_celebration', 'help_needed']
  },
  {
    id: 'ekaterina_teacher',
    name: 'Екатерина Новикова',
    age: 38,
    gender: 'female',
    personality: 'Строгая, но справедливая, терпеливая',
    appearance: 'Среднего роста, строгая прическа, добрые глаза',
    background: 'Школьная учительница, повлияла на выбор профессии',
    relationship: 65,
    status: 'friend',
    canMeetAt: ['school_reunion', 'teacher_conference', 'city_event'],
    specialEvents: ['school_reunion', 'teacher_day', 'achievement_celebration']
  }
];

// Функции для работы с NPC
export const getRandomNPC = (location: string, age: number): NPC => {
  const availableNPCs = NPC_DATABASE.filter(npc => 
    npc.canMeetAt.includes(location) && 
    Math.abs(npc.age - age) <= 15 // Возрастная разница не более 15 лет
  );
  
  if (availableNPCs.length === 0) {
    // Возвращаем случайного NPC если нет подходящих по локации
    return NPC_DATABASE[Math.floor(Math.random() * NPC_DATABASE.length)];
  }
  
  return availableNPCs[Math.floor(Math.random() * availableNPCs.length)];
};

export const updateNPCRelationship = (npcId: string, change: number): NPC | null => {
  const npc = NPC_DATABASE.find(n => n.id === npcId);
  if (!npc) return null;
  
  npc.relationship = Math.max(-100, Math.min(100, npc.relationship + change));
  
  // Обновляем статус в зависимости от уровня отношений
  if (npc.relationship >= 80) {
    npc.status = 'best_friend';
  } else if (npc.relationship >= 60) {
    npc.status = 'friend';
  } else if (npc.relationship >= 20) {
    npc.status = 'acquaintance';
  } else if (npc.relationship <= -50) {
    npc.status = 'enemy';
  } else {
    npc.status = 'stranger';
  }
  
  return npc;
};

export const getNPCsByStatus = (status: NPC['status']): NPC[] => {
  return NPC_DATABASE.filter(npc => npc.status === status);
};

export const getNPCById = (id: string): NPC | undefined => {
  return NPC_DATABASE.find(npc => npc.id === id);
};
