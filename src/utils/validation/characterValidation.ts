// Утилиты валидации персонажа - Sprint 2 Task 6
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface CharacterValidationRules {
  name: {
    minLength: number;
    maxLength: number;
    required: boolean;
    pattern?: RegExp;
  };
  year: {
    min: number;
    max: number;
    required: boolean;
  };
  city: {
    required: boolean;
    allowedValues: string[];
  };
}

export const CHARACTER_VALIDATION_RULES: CharacterValidationRules = {
  name: {
    minLength: 2,
    maxLength: 20,
    required: true,
    pattern: /^[a-zA-Z\u0400-\u04FF\s]+$/,
  },
  year: {
    min: 1918,
    max: 2024,
    required: true,
  },
  city: {
    required: true,
    allowedValues: [
      'baku',
      'ganja',
      'sumgait',
      'mingachevir',
      'shirvan',
      'lassa',
      'shaki',
      'nakhchivan',
      'gabala',
      'masalli',
    ],
  },
};

export class CharacterValidator {
  private rules: CharacterValidationRules;

  constructor(rules?: Partial<CharacterValidationRules>) {
    this.rules = {
      ...CHARACTER_VALIDATION_RULES,
      ...rules,
    };
  }

  // Валидация имени
  validateName(name: string): string | null {
    const { name: nameRules } = this.rules;

    if (nameRules.required && !name.trim()) {
      return 'Имя обязательно для заполнения';
    }

    if (name.trim().length < nameRules.minLength) {
      return `Минимальная длина имени - ${nameRules.minLength} символа`;
    }

    if (name.trim().length > nameRules.maxLength) {
      return `Максимальная длина имени - ${nameRules.maxLength} символов`;
    }

    if (nameRules.pattern && !nameRules.pattern.test(name.trim())) {
      return 'Имя может содержать только буквы и пробелы';
    }

    return null;
  }

  // Валидация года рождения
  validateYear(year: number): string | null {
    const { year: yearRules } = this.rules;

    if (yearRules.required && !year) {
      return 'Год рождения обязателен';
    }

    if (year < yearRules.min) {
      return `Минимальный год рождения - ${yearRules.min}`;
    }

    if (year > yearRules.max) {
      return `Максимальный год рождения - ${yearRules.max}`;
    }

    return null;
  }

  // Валидация города
  validateCity(city: string): string | null {
    const { city: cityRules } = this.rules;

    if (cityRules.required && !city) {
      return 'Город рождения обязателен';
    }

    if (!cityRules.allowedValues.includes(city)) {
      return 'Выбран недопустимый город';
    }

    return null;
  }

  // Комплексная валидация
  validateCharacter(data: {
    name?: string;
    yearBase?: number;
    birthCity?: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    // Валидация имени
    if (data.name !== undefined) {
      const nameError = this.validateName(data.name);
      if (nameError) {
        errors.name = nameError;
      }
    }

    // Валидация года
    if (data.yearBase !== undefined) {
      const yearError = this.validateYear(data.yearBase);
      if (yearError) {
        errors.yearBase = yearError;
      }
    }

    // Валидация города
    if (data.birthCity !== undefined) {
      const cityError = this.validateCity(data.birthCity);
      if (cityError) {
        errors.birthCity = cityError;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Валидация в реальном времени
  validateField(field: keyof CharacterValidationRules, value: any): string | null {
    switch (field) {
      case 'name':
        return this.validateName(value);
      case 'year':
        return this.validateYear(value);
      case 'city':
        return this.validateCity(value);
      default:
        return null;
    }
  }

  // Получение подсказок для пользователя
  getFieldHints(field: keyof CharacterValidationRules): string[] {
    const rules = this.rules[field];
    const hints: string[] = [];

    switch (field) {
      case 'name':
        const nameRules = rules as CharacterValidationRules['name'];
        hints.push(`Длина от ${nameRules.minLength} до ${nameRules.maxLength} символов`);
        if (nameRules.pattern) {
          hints.push('Только буквы и пробелы');
        }
        if (nameRules.required) {
          hints.push('Обязательное поле');
        }
        break;

      case 'year':
        const yearRules = rules as CharacterValidationRules['year'];
        hints.push(`От ${yearRules.min} до ${yearRules.max} года`);
        if (yearRules.required) {
          hints.push('Обязательное поле');
        }
        break;

      case 'city':
        hints.push('Выберите из списка доступных городов');
        if (rules.required) {
          hints.push('Обязательное поле');
        }
        break;
    }

    return hints;
  }
}

// Создание экземпляра валидатора по умолчанию
export const defaultCharacterValidator = new CharacterValidator();

// Утилиты для работы с валидацией
export const ValidationUtils = {
  // Очистка имени
  cleanName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  },

  // Расчет возраста
  calculateAge(yearBase: number): number {
    return 2024 - yearBase;
  },

  // Проверка на совершеннолетие
  isAdult(yearBase: number): boolean {
    return this.calculateAge(yearBase) >= 18;
  },

  // Получение возрастной категории
  getAgeCategory(yearBase: number): 'child' | 'teen' | 'adult' | 'elderly' {
    const age = this.calculateAge(yearBase);
    if (age < 13) return 'child';
    if (age < 18) return 'teen';
    if (age < 65) return 'adult';
    return 'elderly';
  },

  // Валидация сложных комбинаций
  validateComplexRules(data: {
    name?: string;
    yearBase?: number;
    birthCity?: string;
  }): ValidationResult {
    const baseValidation = defaultCharacterValidator.validateCharacter(data);
    const additionalErrors: Record<string, string> = {};

    // Проверка на историческую корректность
    if (data.yearBase && data.birthCity) {
      // Баку был основан до 1918, все города доступны
      // Но можно добавить специфичные правила
      if (data.yearBase < 1920 && data.birthCity === 'sumgait') {
        additionalErrors.birthCity = 'Сумгаит как промышленный центр был развит после 1920 года';
      }
    }

    // Проверка на реалистичный возраст
    if (data.yearBase) {
      const age = this.calculateAge(data.yearBase);
      if (age > 120) {
        additionalErrors.yearBase = 'Слишком большой возраст для персонажа';
      }
    }

    return {
      isValid:
        Object.keys(baseValidation.errors).length === 0 &&
        Object.keys(additionalErrors).length === 0,
      errors: { ...baseValidation.errors, ...additionalErrors },
    };
  },
};

export default defaultCharacterValidator;
