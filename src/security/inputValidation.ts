// 🛡️ Input Validation - Life Simulator Azerbaijan
// Создано: Security Engineer (Agile Team)
// Версия: 3.0.0

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedValue?: string;
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationRule {
  name: string;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  allowedValues?: string[];
  customValidator?: (value: string) => boolean;
  errorMessage?: string;
}

export class InputValidator {
  private static instance: InputValidator;
  private validationRules: Map<string, ValidationRule[]> = new Map();

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
      InputValidator.instance.initializeDefaultRules();
    }
    return InputValidator.instance;
  }

  private initializeDefaultRules() {
    // Character name validation
    this.addRule('characterName', [
      {
        name: 'required',
        required: true,
        errorMessage: 'Character name is required',
      },
      {
        name: 'minLength',
        minLength: 2,
        errorMessage: 'Character name must be at least 2 characters long',
      },
      {
        name: 'maxLength',
        maxLength: 50,
        errorMessage: 'Character name cannot exceed 50 characters',
      },
      {
        name: 'allowedCharacters',
        pattern: /^[a-zA-Zа-яА-Я\s'-]+$/,
        errorMessage: 'Character name can only contain letters, spaces, hyphens, and apostrophes',
      },
      {
        name: 'noProfanity',
        customValidator: this.validateNoProfanity,
        errorMessage: 'Character name contains inappropriate content',
      },
    ]);

    // Email validation
    this.addRule('email', [
      {
        name: 'emailFormat',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: 'Please enter a valid email address',
      },
      {
        name: 'maxLength',
        maxLength: 254,
        errorMessage: 'Email address is too long',
      },
    ]);

    // Password validation
    this.addRule('password', [
      {
        name: 'required',
        required: true,
        errorMessage: 'Password is required',
      },
      {
        name: 'minLength',
        minLength: 8,
        errorMessage: 'Password must be at least 8 characters long',
      },
      {
        name: 'maxLength',
        maxLength: 128,
        errorMessage: 'Password cannot exceed 128 characters',
      },
      {
        name: 'containsUppercase',
        pattern: /[A-Z]/,
        errorMessage: 'Password must contain at least one uppercase letter',
      },
      {
        name: 'containsLowercase',
        pattern: /[a-z]/,
        errorMessage: 'Password must contain at least one lowercase letter',
      },
      {
        name: 'containsNumber',
        pattern: /\d/,
        errorMessage: 'Password must contain at least one number',
      },
      {
        name: 'containsSpecialChar',
        pattern: /[!@#$%^&*(),.?":{}|<>]/,
        errorMessage: 'Password must contain at least one special character',
      },
    ]);

    // Age validation
    this.addRule('age', [
      {
        name: 'required',
        required: true,
        errorMessage: 'Age is required',
      },
      {
        name: 'numeric',
        pattern: /^\d+$/,
        errorMessage: 'Age must be a number',
      },
      {
        name: 'minAge',
        customValidator: (value) => parseInt(value) >= 0,
        errorMessage: 'Age cannot be negative',
      },
      {
        name: 'maxAge',
        customValidator: (value) => parseInt(value) <= 150,
        errorMessage: 'Age cannot exceed 150',
      },
    ]);

    // Birth year validation
    this.addRule('birthYear', [
      {
        name: 'required',
        required: true,
        errorMessage: 'Birth year is required',
      },
      {
        name: 'numeric',
        pattern: /^\d{4}$/,
        errorMessage: 'Birth year must be a 4-digit number',
      },
      {
        name: 'validYear',
        customValidator: (value) => {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          return year >= 1900 && year <= currentYear;
        },
        errorMessage: 'Birth year must be between 1900 and current year',
      },
    ]);

    // City name validation
    this.addRule('city', [
      {
        name: 'required',
        required: true,
        errorMessage: 'City is required',
      },
      {
        name: 'minLength',
        minLength: 2,
        errorMessage: 'City name must be at least 2 characters long',
      },
      {
        name: 'maxLength',
        maxLength: 100,
        errorMessage: 'City name cannot exceed 100 characters',
      },
      {
        name: 'allowedCharacters',
        pattern: /^[a-zA-Zа-яА-Я\s'-]+$/,
        errorMessage: 'City name can only contain letters, spaces, hyphens, and apostrophes',
      },
    ]);
  }

  addRule(fieldName: string, rules: ValidationRule[]) {
    this.validationRules.set(fieldName, rules);
  }

  validate(field: string, value: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let sanitizedValue = value;

    const rules = this.validationRules.get(field) || [];

    for (const rule of rules) {
      const result = this.applyRule(rule, value, field);
      
      if (!result.isValid) {
        if (result.severity === 'error') {
          errors.push({
            field,
            code: rule.name,
            message: result.message || rule.errorMessage || 'Validation failed',
            severity: 'error',
          });
        } else {
          warnings.push(result.message || rule.errorMessage || 'Validation warning');
        }
      }
    }

    // Sanitize input
    sanitizedValue = this.sanitizeInput(value, field);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private applyRule(rule: ValidationRule, value: string, field: string): ValidationResult {
    // Check required
    if (rule.required && (!value || value.trim() === '')) {
      return {
        isValid: false,
        errors: [],
        message: `${field} is required`,
      };
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return { isValid: true, errors: [] };
    }

    // Check min length
    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        errors: [],
        message: `${field} must be at least ${rule.minLength} characters long`,
      };
    }

    // Check max length
    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        errors: [],
        message: `${field} cannot exceed ${rule.maxLength} characters`,
      };
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        isValid: false,
        errors: [],
        message: rule.errorMessage || `${field} format is invalid`,
      };
    }

    // Check allowed values
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      return {
        isValid: false,
        errors: [],
        message: `${field} must be one of: ${rule.allowedValues.join(', ')}`,
      };
    }

    // Check custom validator
    if (rule.customValidator && !rule.customValidator(value)) {
      return {
        isValid: false,
        errors: [],
        message: rule.errorMessage || `${field} validation failed`,
      };
    }

    return { isValid: true, errors: [] };
  }

  private sanitizeInput(value: string, field: string): string {
    if (!value) return value;

    let sanitized = value;

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Normalize Unicode
    sanitized = sanitized.normalize('NFC');

    // Field-specific sanitization
    switch (field) {
      case 'characterName':
      case 'city':
        // Capitalize first letter of each word
        sanitized = sanitized.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        break;
      
      case 'email':
        sanitized = sanitized.toLowerCase();
        break;
    }

    return sanitized;
  }

  private static validateNoProfanity(value: string): boolean {
    // Simple profanity check (in real app, use comprehensive profanity filter)
    const profanityList = [
      'damn', 'hell', 'stupid', 'idiot', 'dumb',
      // Add more words as needed
    ];

    const lowerValue = value.toLowerCase();
    return !profanityList.some(word => lowerValue.includes(word));
  }

  // Batch validation for multiple fields
  validateBatch(fields: Record<string, string>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, value] of Object.entries(fields)) {
      results[fieldName] = this.validate(fieldName, value);
    }

    return results;
  }

  // Get overall validation status
  getOverallStatus(results: Record<string, ValidationResult>): {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    fieldsWithErrors: string[];
  } {
    let totalErrors = 0;
    let totalWarnings = 0;
    const fieldsWithErrors: string[] = [];

    for (const [fieldName, result] of Object.entries(results)) {
      totalErrors += result.errors.length;
      totalWarnings += result.warnings?.length || 0;
      
      if (result.errors.length > 0) {
        fieldsWithErrors.push(fieldName);
      }
    }

    return {
      isValid: totalErrors === 0,
      totalErrors,
      totalWarnings,
      fieldsWithErrors,
    };
  }
}

export default InputValidator;
