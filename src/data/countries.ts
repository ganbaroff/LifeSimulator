// Данные о странах с флагами и бонусами
export interface CountryData {
  id: string;
  name: string;
  flag: string; // Эмодзи флага
  description: string;
  bonuses: {
    health: number;
    happiness: number;
    wealth: number;
    energy: number;
  };
  specialEvents: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    id: 'usa',
    name: 'США',
    flag: '🇺🇸',
    description: 'Американская мечта с большими возможностями',
    bonuses: { health: 5, happiness: 10, wealth: 20, energy: 5 },
    specialEvents: ['silicon_valley', 'hollywood', 'wall_street', 'american_dream'],
    difficulty: 'medium'
  },
  {
    id: 'russia',
    name: 'Россия',
    flag: '🇷🇺',
    description: 'Сила духа и богатые традиции',
    bonuses: { health: 10, happiness: 5, wealth: 0, energy: 10 },
    specialEvents: ['space_program', 'winter_sports', 'literature', 'family_values'],
    difficulty: 'hard'
  },
  {
    id: 'japan',
    name: 'Япония',
    flag: '🇯🇵',
    description: 'Технологии и гармония традиций',
    bonuses: { health: 15, happiness: 5, wealth: 10, energy: 0 },
    specialEvents: ['technology_hub', 'anime_culture', 'samurai_heritage', 'longevity'],
    difficulty: 'medium'
  },
  {
    id: 'germany',
    name: 'Германия',
    flag: '🇩🇪',
    description: 'Инженерия и стабильность',
    bonuses: { health: 10, happiness: 0, wealth: 15, energy: 5 },
    specialEvents: ['engineering_excellence', 'beer_festival', 'car_industry', 'efficiency'],
    difficulty: 'medium'
  },
  {
    id: 'france',
    name: 'Франция',
    flag: '🇫🇷',
    description: 'Романтика и искусство',
    bonuses: { health: 5, happiness: 15, wealth: 5, energy: 5 },
    specialEvents: ['wine_culture', 'fashion_capital', 'cuisine_excellence', 'love_romance'],
    difficulty: 'easy'
  },
  {
    id: 'uk',
    name: 'Великобритания',
    flag: '🇬🇧',
    description: 'История и инновации',
    bonuses: { health: 5, happiness: 5, wealth: 15, energy: 5 },
    specialEvents: ['financial_center', 'royal_family', 'music_revolution', 'education_excellence'],
    difficulty: 'medium'
  },
  {
    id: 'china',
    name: 'Китай',
    flag: '🇨🇳',
    description: 'Древняя мудрость и современный рост',
    bonuses: { health: 10, happiness: 0, wealth: 10, energy: 10 },
    specialEvents: ['economic_growth', 'ancient_wisdom', 'family_importance', 'tech_innovation'],
    difficulty: 'hard'
  },
  {
    id: 'brazil',
    name: 'Бразилия',
    flag: '🇧🇷',
    description: 'Карнавал и футболная страсть',
    bonuses: { health: 15, happiness: 20, wealth: -5, energy: 10 },
    specialEvents: ['carnival_festival', 'football_passion', 'beach_life', 'amazon_adventure'],
    difficulty: 'easy'
  }
];

export const getCountryById = (id: string): CountryData | undefined => {
  return COUNTRIES_DATA.find(country => country.id === id);
};

export const getRandomCountry = (): CountryData => {
  return COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
};

export const getCountriesByDifficulty = (difficulty: CountryData['difficulty']): CountryData[] => {
  return COUNTRIES_DATA.filter(country => country.difficulty === difficulty);
};
