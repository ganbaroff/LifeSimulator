// HistoricalEvents.ts - База исторических событий 1850-2025
// Влияет на 20-30% сценариев в зависимости от страны и года рождения

import type { HistoricalEvent, EventEffects } from '../types';

interface HistoricalEventData {
  event: string;
  description: string;
  effects: {
    health: number;
    wealth: number;
    happiness: number;
  };
  tags: string[];
}

type CountryEvents = Record<number, HistoricalEventData>;
type HistoricalEventsMap = Record<string, CountryEvents>;

export const HISTORICAL_EVENTS: HistoricalEventsMap = {
  USA: {
    1861: {
      event: 'Civil War',
      description: 'American Civil War begins',
      effects: { health: 0.7, wealth: 0.8, happiness: 0.6 },
      tags: ['war', 'crisis'],
    },
    1918: {
      event: 'Spanish Flu',
      description: 'Pandemic sweeps the nation',
      effects: { health: 0.5, wealth: 0.9, happiness: 0.7 },
      tags: ['pandemic', 'health'],
    },
    1929: {
      event: 'Great Depression',
      description: 'Stock market crash, economic collapse',
      effects: { health: 0.9, wealth: 0.3, happiness: 0.4 },
      tags: ['economic', 'crisis'],
    },
    1941: {
      event: 'WW2',
      description: 'United States enters World War II',
      effects: { health: 0.7, wealth: 0.8, happiness: 0.7 },
      tags: ['war'],
    },
    1950: {
      event: 'Post-war Boom',
      description: 'Economic prosperity and growth',
      effects: { health: 1.0, wealth: 1.3, happiness: 1.2 },
      tags: ['prosperity'],
    },
    1969: {
      event: 'Moon Landing',
      description: 'First human on the moon',
      effects: { health: 1.0, wealth: 1.1, happiness: 1.2 },
      tags: ['achievement'],
    },
    1973: {
      event: 'Oil Crisis',
      description: 'Energy crisis affects economy',
      effects: { health: 0.95, wealth: 0.7, happiness: 0.8 },
      tags: ['economic'],
    },
    1987: {
      event: 'Stock Market Crash',
      description: 'Black Monday market collapse',
      effects: { health: 1.0, wealth: 0.6, happiness: 0.7 },
      tags: ['economic'],
    },
    2001: {
      event: '9/11 Attacks',
      description: 'Terrorist attacks shake nation',
      effects: { health: 0.9, wealth: 0.8, happiness: 0.5 },
      tags: ['crisis', 'terror'],
    },
    2008: {
      event: 'Financial Crisis',
      description: 'Housing market collapse, recession',
      effects: { health: 0.95, wealth: 0.5, happiness: 0.6 },
      tags: ['economic', 'crisis'],
    },
    2020: {
      event: 'COVID-19 Pandemic',
      description: 'Global pandemic lockdowns',
      effects: { health: 0.7, wealth: 0.7, happiness: 0.6 },
      tags: ['pandemic', 'health'],
    },
  },
  Russia: {
    1914: {
      event: 'WW1',
      description: 'Russian Empire enters World War I',
      effects: { health: 0.6, wealth: 0.7, happiness: 0.5 },
      tags: ['war'],
    },
    1917: {
      event: 'Russian Revolution',
      description: 'Bolshevik Revolution, civil war',
      effects: { health: 0.5, wealth: 0.4, happiness: 0.3 },
      tags: ['revolution', 'war'],
    },
    1941: {
      event: 'Great Patriotic War',
      description: 'Nazi invasion of Soviet Union',
      effects: { health: 0.4, wealth: 0.5, happiness: 0.4 },
      tags: ['war', 'crisis'],
    },
    1961: {
      event: 'Space Race',
      description: 'Gagarin first in space',
      effects: { health: 1.0, wealth: 0.9, happiness: 1.3 },
      tags: ['achievement'],
    },
    1986: {
      event: 'Chernobyl Disaster',
      description: 'Nuclear catastrophe',
      effects: { health: 0.6, wealth: 0.8, happiness: 0.5 },
      tags: ['disaster', 'health'],
    },
    1991: {
      event: 'USSR Collapse',
      description: 'Soviet Union dissolves',
      effects: { health: 0.8, wealth: 0.4, happiness: 0.5 },
      tags: ['crisis', 'economic'],
    },
    1998: {
      event: 'Economic Crisis',
      description: 'Ruble collapse, default',
      effects: { health: 0.9, wealth: 0.3, happiness: 0.4 },
      tags: ['economic', 'crisis'],
    },
  },
  China: {
    1912: {
      event: 'Republic Founded',
      description: 'End of Qing Dynasty',
      effects: { health: 0.8, wealth: 0.7, happiness: 0.8 },
      tags: ['revolution'],
    },
    1949: {
      event: "People's Republic",
      description: 'Communist revolution victory',
      effects: { health: 0.7, wealth: 0.6, happiness: 0.7 },
      tags: ['revolution'],
    },
    1958: {
      event: 'Great Leap Forward',
      description: 'Economic disaster, famine',
      effects: { health: 0.4, wealth: 0.3, happiness: 0.3 },
      tags: ['crisis', 'famine'],
    },
    1966: {
      event: 'Cultural Revolution',
      description: 'Political upheaval',
      effects: { health: 0.6, wealth: 0.5, happiness: 0.4 },
      tags: ['revolution', 'crisis'],
    },
    1978: {
      event: 'Economic Reform',
      description: 'Opening up policy begins',
      effects: { health: 1.0, wealth: 1.2, happiness: 1.1 },
      tags: ['reform', 'prosperity'],
    },
    2008: {
      event: 'Beijing Olympics',
      description: 'China on world stage',
      effects: { health: 1.0, wealth: 1.2, happiness: 1.3 },
      tags: ['achievement'],
    },
    2020: {
      event: 'COVID-19 Origin',
      description: 'Pandemic begins in Wuhan',
      effects: { health: 0.6, wealth: 0.8, happiness: 0.7 },
      tags: ['pandemic', 'health'],
    },
  },
  India: {
    1947: {
      event: 'Independence',
      description: 'Freedom from British rule',
      effects: { health: 0.9, wealth: 0.8, happiness: 1.3 },
      tags: ['independence'],
    },
    1948: {
      event: 'Partition',
      description: 'Violent partition with Pakistan',
      effects: { health: 0.5, wealth: 0.6, happiness: 0.4 },
      tags: ['war', 'crisis'],
    },
    1962: {
      event: 'China Border War',
      description: 'Sino-Indian War',
      effects: { health: 0.7, wealth: 0.8, happiness: 0.6 },
      tags: ['war'],
    },
    1980: {
      event: 'License Raj',
      description: 'Heavy business regulation era',
      effects: { health: 0.95, wealth: 0.6, happiness: 0.7 },
      tags: ['economic'],
    },
    1991: {
      event: 'Economic Liberalization',
      description: 'Market reforms begin',
      effects: { health: 1.0, wealth: 1.3, happiness: 1.2 },
      tags: ['reform', 'prosperity'],
    },
    2000: {
      event: 'IT Boom',
      description: 'Technology sector explosion',
      effects: { health: 1.0, wealth: 1.4, happiness: 1.2 },
      tags: ['prosperity', 'technology'],
    },
  },
  Germany: {
    1914: {
      event: 'WW1',
      description: 'World War I begins',
      effects: { health: 0.6, wealth: 0.7, happiness: 0.5 },
      tags: ['war'],
    },
    1918: {
      event: 'WW1 Defeat',
      description: 'Germany loses, harsh terms',
      effects: { health: 0.7, wealth: 0.4, happiness: 0.3 },
      tags: ['war', 'crisis'],
    },
    1923: {
      event: 'Hyperinflation',
      description: 'Currency collapse',
      effects: { health: 0.8, wealth: 0.2, happiness: 0.3 },
      tags: ['economic', 'crisis'],
    },
    1939: {
      event: 'WW2',
      description: 'Nazi Germany starts World War II',
      effects: { health: 0.5, wealth: 0.6, happiness: 0.5 },
      tags: ['war'],
    },
    1945: {
      event: 'WW2 Defeat',
      description: 'Total defeat, division',
      effects: { health: 0.4, wealth: 0.3, happiness: 0.2 },
      tags: ['war', 'crisis'],
    },
    1961: {
      event: 'Berlin Wall',
      description: 'City divided by wall',
      effects: { health: 0.9, wealth: 0.7, happiness: 0.5 },
      tags: ['crisis'],
    },
    1989: {
      event: 'Wall Falls',
      description: 'Berlin Wall falls, reunification',
      effects: { health: 1.0, wealth: 1.2, happiness: 1.4 },
      tags: ['achievement'],
    },
    2015: {
      event: 'Refugee Crisis',
      description: 'Mass migration influx',
      effects: { health: 0.95, wealth: 0.9, happiness: 0.8 },
      tags: ['crisis'],
    },
  },
  Japan: {
    1923: {
      event: 'Great Kanto Earthquake',
      description: 'Devastating Tokyo earthquake',
      effects: { health: 0.5, wealth: 0.5, happiness: 0.4 },
      tags: ['disaster'],
    },
    1941: {
      event: 'WW2',
      description: 'Japan enters World War II',
      effects: { health: 0.6, wealth: 0.7, happiness: 0.6 },
      tags: ['war'],
    },
    1945: {
      event: 'Atomic Bombs',
      description: 'Hiroshima and Nagasaki',
      effects: { health: 0.3, wealth: 0.4, happiness: 0.2 },
      tags: ['war', 'disaster'],
    },
    1960: {
      event: 'Economic Miracle',
      description: 'Rapid post-war growth',
      effects: { health: 1.1, wealth: 1.5, happiness: 1.3 },
      tags: ['prosperity'],
    },
    1989: {
      event: 'Asset Bubble',
      description: 'Economic bubble peaks',
      effects: { health: 1.0, wealth: 1.4, happiness: 1.2 },
      tags: ['prosperity'],
    },
    1991: {
      event: 'Lost Decade Begins',
      description: 'Economic stagnation',
      effects: { health: 1.0, wealth: 0.7, happiness: 0.7 },
      tags: ['economic'],
    },
    2011: {
      event: 'Fukushima Disaster',
      description: 'Earthquake, tsunami, nuclear meltdown',
      effects: { health: 0.6, wealth: 0.7, happiness: 0.5 },
      tags: ['disaster', 'health'],
    },
  },
  Brazil: {
    1964: {
      event: 'Military Coup',
      description: 'Military dictatorship begins',
      effects: { health: 0.8, wealth: 0.7, happiness: 0.5 },
      tags: ['crisis'],
    },
    1985: {
      event: 'Democracy Restored',
      description: 'Return to civilian rule',
      effects: { health: 0.95, wealth: 0.9, happiness: 1.2 },
      tags: ['reform'],
    },
    1994: {
      event: 'Real Plan',
      description: 'Currency reform, stability',
      effects: { health: 1.0, wealth: 1.2, happiness: 1.1 },
      tags: ['economic', 'reform'],
    },
    2016: {
      event: 'Political Crisis',
      description: 'Impeachment, corruption scandals',
      effects: { health: 0.95, wealth: 0.7, happiness: 0.6 },
      tags: ['crisis'],
    },
  },
};

// ФУНКЦИЯ: Получить исторический контекст для года и страны
export const getHistoricalContext = (country: string, year: number): HistoricalEvent | null => {
  const countryEvents = HISTORICAL_EVENTS[country];
  if (!countryEvents) return null;

  // Находим ближайшее событие (в пределах 5 лет)
  let closestEvent = null;
  let closestDistance = Infinity;

  for (const eventYear in countryEvents) {
    const distance = Math.abs(parseInt(eventYear, 10) - year);
    if (distance <= 5 && distance < closestDistance) {
      closestDistance = distance;
      closestEvent = {
        year: parseInt(eventYear, 10),
        ...countryEvents[eventYear],
      };
    }
  }

  return closestEvent as HistoricalEvent | null;
};

// ФУНКЦИЯ: Применить исторические эффекты к выбору события
export const applyHistoricalEffects = (
  baseEffects: EventEffects,
  historicalEvent: HistoricalEvent,
): EventEffects => {
  if (!historicalEvent) return baseEffects;

  const modified = { ...baseEffects };

  // Применяем множители из исторического события
  if (modified.health !== undefined && historicalEvent.impact.health !== undefined) {
    modified.health = Math.floor(modified.health * historicalEvent.impact.health);
  }
  if (modified.wealth !== undefined && historicalEvent.impact.wealth !== undefined) {
    modified.wealth = Math.floor(modified.wealth * historicalEvent.impact.wealth);
  }
  if (modified.happiness !== undefined && historicalEvent.impact.happiness !== undefined) {
    modified.happiness = Math.floor(modified.happiness * historicalEvent.impact.happiness);
  }

  return modified;
};

// ФУНКЦИЯ: Генерация исторического контекста для AI промпта
export const generateHistoricalPromptContext = (
  country: string,
  year: number,
  age: number,
): string => {
  const event = getHistoricalContext(country, year);

  if (!event) {
    return `It is ${year} in ${country}. Normal peacetime conditions.`;
  }

  return `It is ${year} in ${country}. Historical context: ${event.title} - ${event.description}. This significantly affects daily life, economy, and opportunities. The character is ${age} years old during this period.`;
};

// ФУНКЦИЯ: Проверка, является ли событие подходящим для текущего исторического контекста
export const isEventAppropriate = (
  eventTags: string[] | undefined,
  historicalEvent: HistoricalEvent | null,
): boolean => {
  if (!historicalEvent || !eventTags) return true;

  // Например, бизнес-события не подходят во время войны
  const warTimes = historicalEvent.title.toLowerCase().includes('war');
  const businessEvent = eventTags.includes('business');

  if (warTimes && businessEvent) {
    return Math.random() > 0.7; // 30% шанс бизнес-события во время войны
  }

  return true;
};

export default {
  HISTORICAL_EVENTS,
  getHistoricalContext,
  applyHistoricalEffects,
  generateHistoricalPromptContext,
  isEventAppropriate,
};
