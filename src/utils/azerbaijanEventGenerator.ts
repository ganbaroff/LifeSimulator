// Генератор исторических событий для Азербайджана
import { HistoricalEvent, AzerbaijanCity, getEventsByYearAndCity } from '../data/azerbaijanData';
import { GameEvent } from '../types/game';

export interface CharacterLocation {
  currentCity: string;
  birthCity: string;
  age: number;
  year: number;
  stats?: any;
  eventCount?: number;
}

export class AzerbaijanEventGenerator {
  private static instance: AzerbaijanEventGenerator;
  private usedEvents: Set<string> = new Set();

  static getInstance(): AzerbaijanEventGenerator {
    if (!AzerbaijanEventGenerator.instance) {
      AzerbaijanEventGenerator.instance = new AzerbaijanEventGenerator();
    }
    return AzerbaijanEventGenerator.instance;
  }

  // Генерация события на основе года, города и возраста персонажа
  generateEvent(location: CharacterLocation): GameEvent | null {
    const { currentCity, age, year } = location;
    
    // Получаем исторические события для текущего года и города
    const historicalEvents = getEventsByYearAndCity(year, currentCity);
    
    if (historicalEvents.length > 0) {
      // Выбираем случайное историческое событие
      const event = historicalEvents[Math.floor(Math.random() * historicalEvents.length)];
      const eventId = `hist_${event.id}_${currentCity}_${year}`;
      
      // Проверяем, не использовали ли мы это событие уже
      if (!this.usedEvents.has(eventId)) {
        this.usedEvents.add(eventId);
        return this.createGameEventFromHistorical(event, age, currentCity, year);
      }
    }
    
    // Если нет исторических событий или они все использованы, генерируем базовые события
    return this.generateBasicEvent(age, currentCity, year);
  }

  // Генерация базовых событий когда нет исторических
  private generateBasicEvent(age: number, city: string, year: number): GameEvent {
    const basicEvents = [
      {
        id: `basic_${Date.now()}`,
        source: 'fallback' as const,
        situation: `Жизнь в ${city} течет своим чередом. Что вы будете делать сегодня?`,
        A: 'Работать и зарабатывать',
        B: 'Отдыхать и восстанавливать силы',
        C: 'Учиться новому',
        effects: {
          A: { wealth: 10, energy: -5 },
          B: { energy: 10, happiness: 5 },
          C: { energy: -5, happiness: 10 }
        }
      },
      {
        id: `basic_social_${Date.now()}`,
        source: 'fallback' as const,
        situation: `Ваши друзья приглашают вас на встречу. Как вы поступите?`,
        A: 'С радостью пойду',
        B: 'Предложу альтернативу',
        C: 'Откажусь, нужно отдыхать',
        effects: {
          A: { happiness: 15, energy: -10 },
          B: { happiness: 5, energy: -5 },
          C: { energy: 10, happiness: -5 }
        }
      }
    ];

    return basicEvents[Math.floor(Math.random() * basicEvents.length)];
  }

  // Создание игрового события из исторического
  private createGameEventFromHistorical(
    historicalEvent: HistoricalEvent, 
    age: number, 
    city: string, 
    year: number
  ): GameEvent {
    return {
      id: `historical_${historicalEvent.id}_${Date.now()}`,
      source: 'historical' as const,
      situation: `${historicalEvent.year} год. ${historicalEvent.title}\n\n${historicalEvent.description}`,
      A: historicalEvent.choices.A.text,
      B: historicalEvent.choices.B.text,
      C: historicalEvent.choices.C.text,
      effects: {
        A: historicalEvent.choices.A.effects,
        B: historicalEvent.choices.B.effects,
        C: historicalEvent.choices.C.effects,
      }
    };
  }

  // Сброс использованных событий (для новой игры)
  resetUsedEvents(): void {
    this.usedEvents.clear();
  }
}
