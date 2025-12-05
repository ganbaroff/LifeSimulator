# Contributing to Life Simulator Azerbaijan

🎮 **Thank you for your interest in contributing to Life Simulator Azerbaijan!**

This guide will help you get started with contributing to our professional life simulation game.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Expo CLI: `npm install -g @expo/cli`

### Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/life-simulator-azerbaijan.git
   cd life-simulator-azerbaijan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/issue-description
```

### 2. Make Changes

- Follow our [Code Standards](#code-standards)
- Write tests for your changes
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Run all quality checks
npm run validate

# Or run individually
npm run lint
npm run type-check
npm run test
npm run format
```

### 4. Commit Changes

Follow our [Commit Convention](#commit-convention):

```bash
git add .
git commit -m "feat: add character creation validation"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 📝 Code Standards

### TypeScript Guidelines

- **Strict Mode**: Always use TypeScript strict mode
- **Types**: Define interfaces/types for all data structures
- **No `any`**: Avoid using `any` type
- **Explicit Returns**: Always specify return types for functions

```typescript
// ✅ Good
interface CharacterStats {
  health: number;
  happiness: number;
  wealth: number;
  energy: number;
}

const calculateStats = (baseStats: CharacterStats): CharacterStats => {
  return {
    ...baseStats,
    health: Math.max(0, baseStats.health),
  };
};

// ❌ Bad
const calculateStats = (baseStats: any): any => {
  return baseStats;
};
```

### React Component Guidelines

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define props interface
- **Default Exports**: Use default exports for components
- **Destructuring**: Destructure props and state

```typescript
// ✅ Good
interface CharacterCardProps {
  character: Character;
  onPress: (character: Character) => void;
  variant?: 'primary' | 'secondary';
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
  variant = 'primary',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card onPress={() => onPress(character)}>
      {/* Component JSX */}
    </Card>
  );
};

export default CharacterCard;
```

### Redux Guidelines

- **Slices**: Use Redux Toolkit createSlice
- **Async Thunks**: Use createAsyncThunk for async operations
- **Type Safety**: Define RootState and action types
- **Middleware**: Use middleware for cross-cutting concerns

```typescript
// ✅ Good
const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<Partial<CharacterStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCharacter.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.character = action.payload;
        state.loading = false;
      });
  },
});
```

### File Naming

- **Components**: PascalCase (`CharacterCard.tsx`)
- **Utilities**: camelCase (`characterUtils.ts`)
- **Hooks**: camelCase with `use` prefix (`useCharacter.ts`)
- **Types**: camelCase (`characterTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party imports
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// 3. Internal imports
import { Character } from '../types/characterTypes';
import { createCharacter } from '../store/slices/characterSlice';
import { Card, Button } from '../components/ui';
import { Theme } from '../styles/DesignSystem';
```

---

## 🧪 Testing Requirements

### Test Structure

```
src/
├── __tests__/
│   ├── components/     # Component tests
│   ├── store/         # Redux store tests
│   ├── integration/    # Integration tests
│   └── utils/         # Utility function tests
```

### Component Testing

```typescript
// CharacterCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CharacterCard from '../CharacterCard';
import { mockCharacter } from '../__mocks__/characterMocks';

describe('CharacterCard', () => {
  it('renders character information correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CharacterCard 
        character={mockCharacter} 
        onPress={mockOnPress} 
      />
    );

    expect(getByText(mockCharacter.info.name)).toBeTruthy();
    expect(getByText(`Age: ${mockCharacter.info.age}`)).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <CharacterCard 
        character={mockCharacter} 
        onPress={mockOnPress} 
      />
    );

    fireEvent.press(getByTestId('character-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockCharacter);
  });
});
```

### Redux Testing

```typescript
// characterSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import characterReducer, { createCharacter, updateStats } from '../characterSlice';

describe('characterSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        character: characterReducer,
      },
    });
  });

  it('should handle createCharacter', async () => {
    const characterData = {
      name: 'Test Character',
      age: 0,
      birthYear: 1995,
      birthCity: 'Baku',
      gender: 'male' as const,
    };

    await store.dispatch(createCharacter(characterData));

    const state = store.getState().character;
    expect(state.character?.info.name).toBe(characterData.name);
    expect(state.loading).toBe(false);
  });

  it('should handle updateStats', () => {
    const initialStats = { health: 100, happiness: 100, wealth: 100, energy: 100 };
    
    store.dispatch(updateStats({ health: 85 }));

    const state = store.getState().character;
    expect(state.character?.stats.health).toBe(85);
  });
});
```

### Coverage Requirements

- **Overall Coverage**: 85%+
- **Critical Paths**: 95%+
- **UI Components**: 90%+
- **Redux Store**: 95%+

Run coverage with:
```bash
npm run test:coverage
```

---

## 🔒 Security Guidelines

### Input Validation

Always validate user input:

```typescript
import { InputValidator } from '../security/inputValidation';

const handleSubmit = (name: string) => {
  const validation = InputValidator.getInstance().validate('characterName', name);
  
  if (!validation.isValid) {
    // Handle validation errors
    validation.errors.forEach(error => {
      console.error(`${error.field}: ${error.message}`);
    });
    return;
  }

  // Use sanitized value
  const sanitizedName = validation.sanitizedValue;
  // Proceed with sanitized input
};
```

### Secure Storage

Use encrypted storage for sensitive data:

```typescript
import { SecureStorage } from '../security/secureStorage';

const saveUserData = async (data: UserData) => {
  await SecureStorage.getInstance().set('user_data', data);
};
```

### API Security

Never expose sensitive information:

```typescript
// ✅ Good - Use environment variables
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// ❌ Bad - Hardcoded secrets
const API_KEY = 'sk-1234567890abcdef';
```

---

## 📚 Documentation

### Code Documentation

Use JSDoc for functions and classes:

```typescript
/**
 * Creates a new character with the provided information
 * @param characterData - Character creation data
 * @returns Promise<Character> - Created character
 * @throws {ValidationError} When validation fails
 * @example
 * ```typescript
 * const character = await createCharacter({
 *   name: 'John Doe',
 *   age: 0,
 *   birthYear: 1995,
 *   birthCity: 'Baku',
 *   gender: 'male'
 * });
 * ```
 */
export const createCharacter = async (
  characterData: CharacterData
): Promise<Character> => {
  // Implementation
};
```

### README Updates

Update README.md for:
- New features
- API changes
- Configuration updates
- Breaking changes

### API Documentation

Update API.md for:
- New endpoints
- Parameter changes
- Response format updates
- Authentication changes

---

## 🔄 Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Security
- [ ] Input validation implemented
- [ ] Security review completed

## Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Code comments added

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
```

### Review Process

1. **Automated Checks**: CI/CD runs all tests and quality checks
2. **Code Review**: At least one team member review required
3. **Security Review**: Security team review for sensitive changes
4. **Documentation Review**: Documentation team review for API changes

### Merge Requirements

- All checks must pass
- At least one approval required
- No merge conflicts
- Documentation updated

---

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `security`: Security-related changes

### Examples

```bash
feat(character): add character validation
fix(game): resolve game state persistence issue
docs(api): update authentication documentation
test(character): add character creation tests
security(input): implement input sanitization
```

---

## 👥 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions
- No harassment or discrimination

### Communication

- Use GitHub Issues for bug reports and feature requests
- Use Discussions for questions and ideas
- Join our Discord community for real-time chat
- Follow project announcements on Twitter

### Getting Help

- Check existing documentation and issues
- Search for similar problems first
- Provide detailed information when asking for help
- Be patient and respectful

---

## 🎯 Good First Issues

Look for issues labeled `good first issue` for beginner-friendly contributions:

- Documentation improvements
- Test coverage gaps
- UI component enhancements
- Bug fixes with clear reproduction steps

---

## 🏆 Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes for significant contributions
- Annual contributor awards
- Special Discord roles for active contributors

---

## 📞 Get Help

If you need help with contributing:

- 📧 Email: contributors@lifesimulator.az
- 💬 Discord: [Contributors Channel](https://discord.gg/lifesimulator-contributors)
- 📖 Documentation: [docs.lifesimulator.az](https://docs.lifesimulator.az)
- 🐛 Issues: [GitHub Issues](https://github.com/lifesimulator/azerbaijan/issues)

---

## 🎉 Thank You!

Thank you for contributing to Life Simulator Azerbaijan! Your contributions help make our game better for everyone.

**🎮 Together we're building the ultimate life simulation experience! 🇦🇿**
