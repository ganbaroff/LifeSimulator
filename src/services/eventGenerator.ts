// Event Generator - Генерация случайных событий
import { GameEvent } from '../store/slices/gameLoopSlice';
import { Character } from '../types/game';

// Define local interfaces to avoid circular imports
interface EventChoice {
  id: string;
  text: string;
  effects: {
    health?: number;
    happiness?: number;
    wealth?: number;
    energy?: number;
  };
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  timestamp: number;
}

interface EventTemplate {
  id: string;
  title: string;
  description: string;
  choices: Array<{
    id: string;
    text: string;
    effects: {
      health?: number;
      happiness?: number;
      wealth?: number;
      energy?: number;
    };
  }>;
  requirements?: {
    minAge?: number;
    maxAge?: number;
    minStat?: {
      stat: keyof Character['stats'];
      value: number;
    };
  };
}

const BASIC_EVENTS: EventTemplate[] = [
  {
    id: 'work_offer',
    title: 'Предложение о работе',
    description: 'Вам предложили подработку на выходных. Дополнительные деньги всегда пригодятся.',
    choices: [
      {
        id: 'accept',
        text: 'Согласиться',
        effects: { wealth: 50, energy: -20, happiness: -10 }
      },
      {
        id: 'decline',
        text: 'Отказаться',
        effects: { energy: 10, happiness: 5 }
      }
    ],
    requirements: { minAge: 16 }
  },
  {
    id: 'health_check',
    title: 'Медицинский осмотр',
    description: 'Пора пройти плановый медицинский осмотр. Лучше знать о своем здоровье заранее.',
    choices: [
      {
        id: 'visit_doctor',
        text: 'Пойти к врачу',
        effects: { health: 15, wealth: -30 }
      },
      {
        id: 'skip',
        text: 'Пропустить',
        effects: { energy: 10 }
      }
    ]
  },
  {
    id: 'friend_meeting',
    title: 'Встреча с другом',
    description: 'Старый друг позвал встретиться и провести время вместе.',
    choices: [
      {
        id: 'meet',
        text: 'Встретиться',
        effects: { happiness: 20, energy: -10, wealth: -20 }
      },
      {
        id: 'busy',
        text: 'Отказаться, занят',
        effects: { energy: 5 }
      }
    ]
  },
  {
    id: 'learning_opportunity',
    title: 'Возможность учиться',
    description: 'Появился шанс пройти бесплатные онлайн-курсы. Новые навыки могут пригодиться.',
    choices: [
      {
        id: 'study',
        text: 'Учиться',
        effects: { energy: -25, happiness: 10 }
      },
      {
        id: 'rest',
        text: 'Отдохнуть',
        effects: { energy: 20 }
      }
    ],
    requirements: { minAge: 14, maxAge: 30 }
  },
  {
    id: 'family_help',
    title: 'Просьба о помощи',
    description: 'Родственники попросили вас помочь с семейными делами.',
    choices: [
      {
        id: 'help',
        text: 'Помочь',
        effects: { happiness: 15, energy: -15, wealth: 10 }
      },
      {
        id: 'refuse',
        text: 'Вежливо отказаться',
        effects: { happiness: -10, energy: 10 }
      }
    ]
  },
  {
    id: 'sickness',
    title: 'Недомогание',
    description: 'Вы чувствуете себя не очень. Возможно, вы заболели.',
    choices: [
      {
        id: 'rest',
        text: 'Отдохнуть дома',
        effects: { health: 10, energy: 10, wealth: -20 }
      },
      {
        id: 'ignore',
        text: 'Игнорировать',
        effects: { health: -15, energy: -10 }
      }
    ]
  },
  {
    id: 'celebration',
    title: 'Праздник',
    description: 'В городе проходит праздник! Можно весело провести время.',
    choices: [
      {
        id: 'participate',
        text: 'Участвовать',
        effects: { happiness: 25, energy: -20, wealth: -30 }
      },
      {
        id: 'watch',
        text: 'Наблюдать со стороны',
        effects: { happiness: 10, energy: -5 }
      }
    ]
  },
  {
    id: 'investment',
    title: 'Инвестиционная возможность',
    description: 'Рискнуть и вложить деньги в перспективное дело?',
    choices: [
      {
        id: 'invest',
        text: 'Вложить деньги',
        effects: { wealth: -100 }
      },
      {
        id: 'save',
        text: 'Сохранить деньги',
        effects: { happiness: 5 }
      }
    ],
    requirements: { 
      minAge: 18,
      minStat: { stat: 'wealth', value: 150 }
    }
  },
  // NEW EVENTS
  {
    id: 'romantic_encounter',
    title: 'Романтическая встреча',
    description: 'Вы познакомились с интересным человеком. Может это что-то серьезное?',
    choices: [
      {
        id: 'date',
        text: 'Сходить на свидание',
        effects: { happiness: 30, energy: -15, wealth: -25 }
      },
      {
        id: 'take_it_slow',
        text: 'Не торопиться',
        effects: { happiness: 10, energy: -5 }
      }
    ],
    requirements: { minAge: 16, maxAge: 50 }
  },
  {
    id: 'career_opportunity',
    title: 'Карьерный рост',
    description: 'Вам предложили повышение! Но это потребует больше ответственности.',
    choices: [
      {
        id: 'accept_promotion',
        text: 'Принять повышение',
        effects: { wealth: 100, happiness: 15, energy: -25 }
      },
      {
        id: 'decline_promotion',
        text: 'Отказаться',
        effects: { happiness: -5, energy: 10 }
      }
    ],
    requirements: { minAge: 22, maxAge: 60 }
  },
  {
    id: 'health_crisis',
    title: 'Проблемы со здоровьем',
    description: 'Врачи обнаружили проблемы со здоровьем. Нужно срочное лечение.',
    choices: [
      {
        id: 'expensive_treatment',
        text: 'Дорогое лечение',
        effects: { health: 40, wealth: -200 }
      },
      {
        id: 'cheap_treatment',
        text: 'Дешевое лечение',
        effects: { health: 20, wealth: -50 }
      },
      {
        id: 'no_treatment',
        text: 'Не лечиться',
        effects: { health: -30, wealth: 0 }
      }
    ],
    requirements: { minAge: 40 }
  },
  {
    id: 'family_tragedy',
    title: 'Семейная трагедия',
    description: 'В вашей семье случилось горе. Нужно поддержать близких.',
    choices: [
      {
        id: 'full_support',
        text: 'Полностью поддержать',
        effects: { happiness: -30, energy: -20, wealth: -100 }
      },
      {
        id: 'partial_support',
        text: 'Частичная поддержка',
        effects: { happiness: -15, energy: -10, wealth: -50 }
      }
    ],
    requirements: { minAge: 25 }
  },
  {
    id: 'windfall',
    title: 'Неожиданное наследство',
    description: 'Вы получили неожиданное наследство от дальнего родственника!',
    choices: [
      {
        id: 'invest_wisely',
        text: 'Мудро инвестировать',
        effects: { wealth: 200, happiness: 20 }
      },
      {
        id: 'spend_lavishly',
        text: 'Потратить с размахом',
        effects: { wealth: 100, happiness: 40, energy: 20 }
      },
      {
        id: 'save_conservatively',
        text: 'Отложить консервативно',
        effects: { wealth: 150, happiness: 10 }
      }
    ],
    requirements: { minAge: 18 }
  },
  {
    id: 'midlife_crisis',
    title: 'Кризис среднего возраста',
    description: 'Вы переосмысливаете свою жизнь. Может пора что-то изменить?',
    choices: [
      {
        id: 'change_career',
        text: 'Сменить карьеру',
        effects: { happiness: 30, wealth: -150, energy: -20 }
      },
      {
        id: 'start_hobby',
        text: 'Начать хобби',
        effects: { happiness: 20, wealth: -50, energy: -10 }
      },
      {
        id: 'accept_life',
        text: 'Принять жизнь как есть',
        effects: { happiness: -10, energy: 10 }
      }
    ],
    requirements: { minAge: 35, maxAge: 55 }
  },
  {
    id: 'retirement_decision',
    title: 'Решение о пенсии',
    description: 'Пора думать о пенсии. Когда вам стоит уйти на заслуженный отдых?',
    choices: [
      {
        id: 'retire_early',
        text: 'Уйти на пенсию раньше',
        effects: { happiness: 25, wealth: -100, energy: 30 }
      },
      {
        id: 'work_longer',
        text: 'Работать дольше',
        effects: { happiness: -10, wealth: 200, energy: -20 }
      },
      {
        id: 'part_time_retirement',
        text: 'Частичная занятость',
        effects: { happiness: 15, wealth: 50, energy: 10 }
      }
    ],
    requirements: { minAge: 55 }
  }
];

export class EventGenerator {
  private static instance: EventGenerator;
  
  static getInstance(): EventGenerator {
    if (!EventGenerator.instance) {
      EventGenerator.instance = new EventGenerator();
    }
    return EventGenerator.instance;
  }

  generateEvent(character: Character): GameEvent | null {
    // Filter events by requirements
    const availableEvents = BASIC_EVENTS.filter(event => {
      if (event.requirements) {
        if (event.requirements.minAge && character.age < event.requirements.minAge) {
          return false;
        }
        if (event.requirements.maxAge && character.age > event.requirements.maxAge) {
          return false;
        }
        if (event.requirements.minStat) {
          const statValue = character.stats[event.requirements.minStat.stat];
          if (statValue < event.requirements.minStat.value) {
            return false;
          }
        }
      }
      return true;
    });

    if (availableEvents.length === 0) return null;

    // Select random event
    const template = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    return {
      id: `${template.id}_${Date.now()}`,
      title: template.title,
      description: template.description,
      choices: template.choices,
      timestamp: Date.now()
    };
  }

  // Special events for specific situations
  generateBirthdayEvent(character: Character): GameEvent {
    return {
      id: `birthday_${Date.now()}`,
      title: `День рождения! Вам ${character.age} лет`,
      description: 'Сегодня ваш особенный день. Как вы хотите его отметить?',
      choices: [
        {
          id: 'party',
          text: 'Устроить вечеринку',
          effects: { happiness: 30, wealth: -50, energy: -30 }
        },
        {
          id: 'quiet',
          text: 'Тихо отметить с близкими',
          effects: { happiness: 20, wealth: -20, energy: -10 }
        },
        {
          id: 'work',
          text: 'Работать как обычно',
          effects: { wealth: 30, happiness: -10 }
        }
      ],
      timestamp: Date.now()
    };
  }

  generateGameOverEvent(cause: string): GameEvent {
    return {
      id: `gameover_${Date.now()}`,
      title: 'Конец пути',
      description: `Ваша жизнь подошла к концу. Причина: ${cause}.`,
      choices: [
        {
          id: 'accept',
          text: 'Принять судьбу',
          effects: {}
        }
      ],
      timestamp: Date.now()
    };
  }
}

export default EventGenerator.getInstance();
