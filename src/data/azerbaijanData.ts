// Исторические данные Азербайджана с 1918 года
export interface AzerbaijanCity {
  id: string;
  name: string;
  region: string;
  population: number;
  description: string;
  bonuses: {
    health: number;
    happiness: number;
    wealth: number;
    energy: number;
  };
}

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  type: 'political' | 'economic' | 'social' | 'cultural' | 'military' | 'migration' | 'infrastructure';
  impact: 'positive' | 'negative' | 'neutral' | 'mixed';
  affectedCities: string[];
  choices: {
    A: {
      text: string;
      effects: {
        health?: number;
        happiness?: number;
        wealth?: number;
        energy?: number;
      };
    };
    B: {
      text: string;
      effects: {
        health?: number;
        happiness?: number;
        wealth?: number;
        energy?: number;
      };
    };
    C: {
      text: string;
      effects: {
        health?: number;
        happiness?: number;
        wealth?: number;
        energy?: number;
      };
    };
  };
}

// Города Азербайджана
export const CITIES: AzerbaijanCity[] = [
  {
    id: 'baku',
    name: 'Баку',
    region: 'Апшерон',
    population: 2300000,
    description: 'Столица Азербайджана, крупнейший экономический и культурный центр',
    bonuses: { health: 10, happiness: 15, wealth: 20, energy: 5 }
  },
  {
    id: 'ganja',
    name: 'Гянджа',
    region: 'Гянджа-Газах',
    population: 340000,
    description: 'Второй по величине город, промышленный центр',
    bonuses: { health: 5, happiness: 10, wealth: 15, energy: 10 }
  },
  {
    id: 'sumgait',
    name: 'Сумгаит',
    region: 'Апшерон',
    population: 350000,
    description: 'Промышленный центр, важный экономический узел',
    bonuses: { health: 0, happiness: 5, wealth: 25, energy: 0 }
  },
  {
    id: 'mingachevir',
    name: 'Мингечевир',
    region: 'Центральный Аран',
    population: 100000,
    description: 'Город энергетиков, "город света"',
    bonuses: { health: 10, happiness: 5, wealth: 10, energy: 15 }
  },
  {
    id: 'shirvan',
    name: 'Ширван',
    region: 'Ширван-Сальян',
    population: 90000,
    description: 'Сельскохозяйственный центр',
    bonuses: { health: 15, happiness: 10, wealth: 5, energy: 10 }
  },
  {
    id: 'lassa',
    name: 'Ленкорань',
    region: 'Ленкорань',
    population: 90000,
    description: 'Южный город, центр чайного производства',
    bonuses: { health: 20, happiness: 15, wealth: 10, energy: 5 }
  },
  {
    id: 'shaki',
    name: 'Шеки',
    region: 'Шаки-Загатала',
    population: 70000,
    description: 'Исторический город, центр туризма и ремесел',
    bonuses: { health: 10, happiness: 20, wealth: 5, energy: 10 }
  },
  {
    id: 'nakhchivan',
    name: 'Нахчыван',
    region: 'Нахчыванская АР',
    population: 100000,
    description: 'Автономная республика, древний исторический центр',
    bonuses: { health: 5, happiness: 15, wealth: 10, energy: 10 }
  },
  {
    id: 'gabala',
    name: 'Габала',
    region: 'Шаки-Загатала',
    population: 20000,
    description: 'Горный курорт, туристический центр',
    bonuses: { health: 25, happiness: 20, wealth: 0, energy: 15 }
  },
  {
    id: 'masalli',
    name: 'Масаллы',
    region: 'Ленкорань',
    population: 50000,
    description: 'Южный район, известный природными достопримечательностями',
    bonuses: { health: 20, happiness: 15, wealth: 5, energy: 10 }
  }
];

// Исторические события Азербайджана с 1918 года
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  // 1918-1920: Азербайджанская Демократическая Республика
  {
    id: 'adr_1918',
    year: 1918,
    title: 'Провозглашение Азербайджанской Демократической Республики',
    description: '28 мая 1918 года была провозглашена первая демократическая республика в мусульманском востоке.',
    type: 'political',
    impact: 'positive',
    affectedCities: ['baku', 'ganja'],
    choices: {
      A: {
        text: 'Активно поддержать новое правительство',
        effects: { happiness: 15, wealth: 10, energy: 5 }
      },
      B: {
        text: 'Остаться нейтральным и наблюдать',
        effects: { happiness: 5, energy: 10 }
      },
      C: {
        text: 'Выразить сомнения в стабильности',
        effects: { happiness: -5, wealth: 5 }
      }
    }
  },
  {
    id: 'baku_battle_1918',
    year: 1918,
    title: 'Битва за Баку',
    description: 'Сентябрьские бои за освобождение Баку от диктатуры.',
    type: 'military',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Участвовать в освобождении города',
        effects: { health: -10, happiness: 20, wealth: 5 }
      },
      B: {
        text: 'Помогать раненым и беженцам',
        effects: { health: 5, happiness: 15, energy: -5 }
      },
      C: {
        text: 'Остаться дома для безопасности семьи',
        effects: { health: 5, energy: 10 }
      }
    }
  },

  // 1920-1991: Советский период
  {
    id: 'soviet_1920',
    year: 1920,
    title: 'Установление Советской власти',
    description: 'Красная армия вошла в Баку, установив советскую власть.',
    type: 'political',
    impact: 'negative',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Активно поддержать новую власть',
        effects: { happiness: 10, wealth: 15, energy: 5 }
      },
      B: {
        text: 'Принять новую реальность',
        effects: { happiness: 5, energy: 10 }
      },
      C: {
        text: 'Сопротивляться переменам',
        effects: { happiness: -10, health: -5 }
      }
    }
  },
  {
    id: 'industrialization_1930',
    year: 1930,
    title: 'Индустриализация Азербайджана',
    description: 'Массовое строительство заводов и фабрик, развитие промышленности.',
    type: 'economic',
    impact: 'positive',
    affectedCities: ['baku', 'sumgait', 'ganja'],
    choices: {
      A: {
        text: 'Работать на новом заводе',
        effects: { wealth: 20, energy: -10, health: -5 }
      },
      B: {
        text: 'Стать инженером',
        effects: { wealth: 15, happiness: 10, energy: -5 }
      },
      C: {
        text: 'Продолжить традиционную деятельность',
        effects: { happiness: 5, energy: 10 }
      }
    }
  },
  {
    id: 'world_war_II_1941',
    year: 1941,
    title: 'Начало Великой Отечественной войны',
    description: 'Немецкое вторжение в СССР, Азербайджан отправляет солдат на фронт.',
    type: 'military',
    impact: 'negative',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Уйти на фронт добровольцем',
        effects: { health: -20, happiness: 15, wealth: 10 }
      },
      B: {
        text: 'Работать в тылу для победы',
        effects: { wealth: 15, energy: -10, happiness: 10 }
      },
      C: {
        text: 'Помогать семьям фронтовиков',
        effects: { happiness: 20, energy: -5, wealth: 5 }
      }
    }
  },
  {
    id: 'oil_boom_1950',
    year: 1950,
    title: 'Нефтяной бум в Баку',
    description: 'Открытие новых нефтяных месторождений, экономический рост.',
    type: 'economic',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Работать в нефтяной промышленности',
        effects: { wealth: 25, health: -10, energy: -5 }
      },
      B: {
        text: 'Открыть малый бизнес',
        effects: { wealth: 20, happiness: 15, energy: -10 }
      },
      C: {
        text: 'Инвестировать в образование',
        effects: { happiness: 10, energy: 5, wealth: 10 }
      }
    }
  },
  {
    id: 'stalin_death_1953',
    year: 1953,
    title: 'Смерть Сталина и начало оттепели',
    description: 'Смерть диктатора открывает новую эру в советской истории.',
    type: 'political',
    impact: 'positive',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'С надеждой смотреть в будущее',
        effects: { happiness: 20, energy: 10 }
      },
      B: {
        text: 'Остаться осторожным',
        effects: { happiness: 10, energy: 5 }
      },
      C: {
        text: 'Требовать больших перемен',
        effects: { happiness: 15, wealth: -5 }
      }
    }
  },
  {
    id: 'space_race_1961',
    year: 1961,
    title: 'Первый полет человека в космос',
    description: 'Гагарин в космосе! Вся страна празднует победу советской науки.',
    type: 'cultural',
    impact: 'positive',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Гордиться достижением страны',
        effects: { happiness: 25, energy: 5 }
      },
      B: {
        text: 'Мечтать о науке и космосе',
        effects: { happiness: 20, wealth: 5 }
      },
      C: {
        text: 'Продолжать работать',
        effects: { wealth: 10, energy: 10 }
      }
    }
  },
  {
    id: 'baku_metro_1967',
    year: 1967,
    title: 'Открытие Бакинского метрополитена',
    description: 'Первый метрополитен на Кавказе открывается в Баку.',
    type: 'infrastructure',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Регулярно пользоваться метро',
        effects: { wealth: -5, energy: 15, happiness: 10 }
      },
      B: {
        text: 'Работать на строительстве линий',
        effects: { wealth: 15, energy: -10, health: -5 }
      },
      C: {
        text: 'Гордиться городским развитием',
        effects: { happiness: 15, energy: 5 }
      }
    }
  },
  {
    id: 'perestroika_1985',
    year: 1985,
    title: 'Начало Перестройки',
    description: 'Горбачев начинает реформы, меняющие советскую систему.',
    type: 'political',
    impact: 'mixed',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Поддержать реформы',
        effects: { happiness: 15, wealth: 10, energy: 5 }
      },
      B: {
        text: 'Остаться консервативным',
        effects: { happiness: -5, energy: 10 }
      },
      C: {
        text: 'Требовать более быстрых перемен',
        effects: { happiness: 10, wealth: -5 }
      }
    }
  },
  {
    id: 'black_january_1990',
    year: 1990,
    title: 'Черный январь в Баку',
    description: 'Советская армия вводит войска в Баку, жертвы среди мирных жителей.',
    type: 'political',
    impact: 'negative',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Участвовать в протестах',
        effects: { health: -15, happiness: 20, wealth: -10 }
      },
      B: {
        text: 'Помогать пострадавшим',
        effects: { health: -5, happiness: 15, energy: -10 }
      },
      C: {
        text: 'Остаться дома с семьей',
        effects: { health: 5, energy: 10, happiness: -5 }
      }
    }
  },

  // 1991-2024: Независимый Азербайджан
  {
    id: 'independence_1991',
    year: 1991,
    title: 'Объявление независимости Азербайджана',
    description: 'Азербайджан провозглашает независимость от СССР.',
    type: 'political',
    impact: 'positive',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Активно поддержать независимость',
        effects: { happiness: 25, energy: 10, wealth: 5 }
      },
      B: {
        text: 'С оптимизмом смотреть в будущее',
        effects: { happiness: 20, energy: 5 }
      },
      C: {
        text: 'Беспокоиться об экономике',
        effects: { happiness: 5, wealth: -10 }
      }
    }
  },
  {
    id: 'oil_contracts_1994',
    year: 1994,
    title: '"Контракт века" - нефтяные контракты с Западом',
    description: 'Подписание исторических контрактов на разработку каспийской нефти.',
    type: 'economic',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Работать в нефтяном секторе',
        effects: { wealth: 30, health: -5, energy: -10 }
      },
      B: {
        text: 'Открыть бизнес в смежной отрасли',
        effects: { wealth: 20, happiness: 15, energy: -5 }
      },
      C: {
        text: 'Инвестировать в образование детей',
        effects: { happiness: 20, wealth: 10, energy: 5 }
      }
    }
  },
  {
    id: 'karabakh_war_1994',
    year: 1994,
    title: 'Карабахская война и прекращение огня',
    description: 'Заканчивается горячая фаза Карабахской войны.',
    type: 'military',
    impact: 'negative',
    affectedCities: ['baku', 'ganja'],
    choices: {
      A: {
        text: 'Служить в армии',
        effects: { health: -20, happiness: 10, wealth: 5 }
      },
      B: {
        text: 'Помогать беженцам',
        effects: { happiness: 15, energy: -10, wealth: -5 }
      },
      C: {
        text: 'Работать для поддержки экономики',
        effects: { wealth: 15, energy: -5, happiness: 5 }
      }
    }
  },
  {
    id: 'heydar_aliyev_1993',
    year: 1993,
    title: 'Приход к власти Гейдара Алиева',
    description: 'Гейдар Алиев становится президентом, начинается стабилизация.',
    type: 'political',
    impact: 'positive',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Поддержать нового лидера',
        effects: { happiness: 20, wealth: 10, energy: 5 }
      },
      B: {
        text: 'Остаться нейтральным',
        effects: { happiness: 10, energy: 10 }
      },
      C: {
        text: 'С осторожностью наблюдать',
        effects: { happiness: 5, energy: 5 }
      }
    }
  },
  {
    id: 'flame_towers_2012',
    year: 2012,
    title: 'Открытие Flame Towers',
    description: 'Символ современного Баку - Flame Towers открываются.',
    type: 'cultural',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Гордиться современным городом',
        effects: { happiness: 20, wealth: 10 }
      },
      B: {
        text: 'Работать в строительной отрасли',
        effects: { wealth: 20, energy: -5 }
      },
      C: {
        text: 'Развивать туризм',
        effects: { wealth: 15, happiness: 15, energy: -5 }
      }
    }
  },
  {
    id: 'eurovision_2012',
    year: 2012,
    title: 'Евровидение в Баку',
    description: 'Баку принимает международный конкурс песни Евровидение.',
    type: 'cultural',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Участвовать в организации',
        effects: { wealth: 15, happiness: 20, energy: -10 }
      },
      B: {
        text: 'Наслаждаться событием',
        effects: { happiness: 25, energy: 5 }
      },
      C: {
        text: 'Работать в сфере услуг',
        effects: { wealth: 20, happiness: 10, energy: -5 }
      }
    }
  },
  {
    id: 'formula1_2016',
    year: 2016,
    title: 'Гран-при Формулы-1 в Баку',
    description: 'Баку принимает уличные гонки Формулы-1.',
    type: 'cultural',
    impact: 'positive',
    affectedCities: ['baku'],
    choices: {
      A: {
        text: 'Работать на мероприятии',
        effects: { wealth: 20, happiness: 15, energy: -5 }
      },
      B: {
        text: 'Развивать спортивный бизнес',
        effects: { wealth: 15, happiness: 10, energy: 5 }
      },
      C: {
        text: 'Гордиться международным признанием',
        effects: { happiness: 20, energy: 10 }
      }
    }
  },
  {
    id: 'victory_2020',
    year: 2020,
    title: 'Победа в Карабахской войне',
    description: 'Азербайджан возвращает контроль над Карабахом.',
    type: 'military',
    impact: 'positive',
    affectedCities: ['baku', 'ganja', 'sumgait'],
    choices: {
      A: {
        text: 'Служить в армии',
        effects: { health: -10, happiness: 25, wealth: 10 }
      },
      B: {
        text: 'Помогать раненым и семьям',
        effects: { happiness: 20, energy: -5, wealth: 5 }
      },
      C: {
        text: 'Работать для восстановления',
        effects: { wealth: 20, happiness: 15, energy: -5 }
      }
    }
  },
  {
    id: 'shusha_declaration_2021',
    year: 2021,
    title: 'Шушинская декларация',
    description: 'Подписание исторического документа о союзничестве с Турцией.',
    type: 'political',
    impact: 'positive',
    affectedCities: ['baku', 'shusha'],
    choices: {
      A: {
        text: 'Поддержать укрепление союза',
        effects: { happiness: 20, wealth: 10, energy: 5 }
      },
      B: {
        text: 'Развивать турецко-азербайджанские связи',
        effects: { wealth: 15, happiness: 15, energy: 5 }
      },
      C: {
        text: 'Гордиться историческим моментом',
        effects: { happiness: 25, energy: 10 }
      }
    }
  }
];

// Utility functions for accessing data
export const getEventsByYearAndCity = (year: number, city: string): HistoricalEvent[] => {
  return HISTORICAL_EVENTS.filter(event => 
    event.year === year && 
    event.affectedCities.includes(city)
  );
};

export const getCityById = (id: string): AzerbaijanCity | undefined => {
  return CITIES.find(city => city.id === id);
};

export const getCitiesByRegion = (region: string): AzerbaijanCity[] => {
  return CITIES.filter(city => city.region === region);
};

export const getRandomCity = (): AzerbaijanCity => {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
};
