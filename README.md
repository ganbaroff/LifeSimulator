# Life Simulator Azerbaijan - Professional Life Simulation Game

🎮 **Professional life simulator with AI-powered scenarios, historical events, and comprehensive gameplay mechanics.**

## 🏗️ Architecture Overview

Life Simulator Azerbaijan is built with **Clean Architecture** principles and modern React Native development practices:

- **React Native + Expo** - Cross-platform mobile development
- **TypeScript (Strict)** - Type-safe development
- **Redux Toolkit** - State management with unified store
- **Clean Architecture** - Separation of concerns and testability
- **Comprehensive Testing** - Unit, integration, and UI tests
- **Security-First** - Input validation, secure storage, rate limiting
- **Analytics-Driven** - Real-time user behavior tracking
- **Professional CI/CD** - Automated testing and deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (for Android builds)
- Xcode (for iOS builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/life-simulator-azerbaijan.git
cd life-simulator-azerbaijan

# Install dependencies
npm install

# Start development server
npm start

# Run on device/simulator
npm run android
npm run ios
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Analytics
ANALYTICS_API_KEY=your_analytics_api_key
ANALYTICS_ENDPOINT=https://api.lifesimulator.az/analytics

# Security
ENCRYPTION_KEY=your_encryption_key
JWT_SECRET=your_jwt_secret

# Development
DEV_MODE=true
DEBUG_LOGGING=true
```

### Development

```bash
# Start development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator
npm run ios
```

#### Code Quality

```bash
# Lint all files
npm run lint

# Auto-format with Prettier
npm run format

# Type-check TypeScript files
npm run type-check

# Run all checks before commit
npm run validate
```

#### Code Quality & Testing

```bash
# Lint all files
npm run lint

# Auto-format with Prettier
npm run format

# Type-check TypeScript files
npm run type-check

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run UI component tests
npm run test:ui

# Run Redux store tests
npm run test:store

# Run all checks before commit
npm run validate
```

#### Security & Analytics

```bash
# Run security audit
npm run security:audit

# Check input validation
npm run security:validation

# View analytics dashboard
npm run analytics:dashboard

# Generate security report
npm run security:report
```

---

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── analytics/       # Analytics components
│   └── features/        # Feature-specific components
├── screens/             # Screen components
├── store/               # Redux store and state management
│   ├── unified/         # Unified Redux slices
│   ├── middleware/      # Custom middleware
│   └── slices/          # Individual slices
├── security/            # Security utilities
├── analytics/           # Analytics service
├── types/               # TypeScript type definitions
│   └── unified/         # Unified type system
├── utils/               # Utility functions
├── styles/              # Design system and themes
└── __tests__/           # Test files
    ├── store/           # Redux store tests
    ├── integration/     # Integration tests
    └── ui/              # UI component tests
```

## 🎨 Design System

Our design system ensures consistency across the application:

- **Colors**: Centralized color palette with dark/light theme support
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing scale
- **Components**: Reusable, tested UI components
- **Themes**: Built-in theme switching capability

### Available Components

- `Button` - Primary, secondary, outline variants
- `Card` - Container components with shadows
- `Badge` - Status indicators and chips
- `Avatar` - User avatars with status indicators
- `Modal` - Dialog and alert components
- `Input` - Text input with validation
- `Loading` - Loading states and spinners
- `Toast` - Notification system

## 🔧 State Management

We use **Redux Toolkit** with a unified store architecture:

### Unified Store Structure

```typescript
interface RootState {
  character: CharacterSliceState;    // Character data and actions
  game: GameSliceState;             // Game state and settings
  ui: UISliceState;                // UI state and preferences
  activities: ActivitiesSliceState; // Activity management
}
```

### Key Features

- **Type-safe**: Full TypeScript integration
- **Persistence**: Automatic state persistence with AsyncStorage
- **Middleware**: Analytics, security, and performance monitoring
- **Testing**: Comprehensive test coverage

## 🧪 Testing Strategy

Our testing approach ensures code quality and reliability:

### Test Types

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Component interactions and data flow
3. **UI Tests** - User interface behavior
4. **Store Tests** - Redux state management

### Coverage Targets

- **Overall**: 85%+ coverage
- **Critical Paths**: 95%+ coverage
- **UI Components**: 90%+ coverage

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:ui
npm run test:store

# Generate coverage report
npm run test:coverage
```

## 🔒 Security Features

Security is built into every layer of the application:

### Input Validation

- Comprehensive input sanitization
- Type validation and bounds checking
- XSS and injection prevention
- Profanity filtering

### Secure Storage

- Encrypted data storage with CryptoJS
- Secure key management
- Sensitive data protection

### Rate Limiting

- API request throttling
- Abuse prevention
- Performance optimization

### Security Auditing

- Automated security scanning
- Vulnerability assessment
- Security event logging

## 📊 Analytics & Monitoring

Real-time insights into user behavior and application performance:

### Tracking Capabilities

- User engagement metrics
- Game progression analytics
- Performance monitoring
- Error tracking
- A/B testing framework

### Analytics Dashboard

- Real-time metrics visualization
- User behavior analysis
- Performance monitoring
- Custom reports

### Privacy Compliance

- GDPR-compliant data collection
- User consent management
- Data anonymization
- Secure data transmission

## 🚀 Deployment & CI/CD

Professional deployment pipeline with automated quality checks:

### CI/CD Pipeline

1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Testing**: Automated test execution
3. **Security**: Security audit and vulnerability scanning
4. **Build**: Multi-environment build process
5. **Deployment**: Automated deployment to staging/production

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Web build
npm run build:web

# Android build
npm run build:android

# iOS build
npm run build:ios
```

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live application environment

---

## 🤝 Contributing

We welcome contributions! Please follow our guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run validate`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Follow Git commit conventions

### Reporting Issues

- Use GitHub Issues for bug reports
- Provide detailed reproduction steps
- Include environment information
- Add relevant logs or screenshots

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Native** team for the amazing framework
- **Expo** for simplified development workflow
- **Redux Toolkit** for excellent state management
- **TypeScript** for type safety
- Our amazing **Agile Team** for dedication and hard work!

---

## 📞 Support

For support and questions:

- 📧 Email: support@lifesimulator.az
- 💬 Discord: [Join our community](https://discord.gg/lifesimulator)
- 🐦 Twitter: [@LifeSimAZ](https://twitter.com/lifesimaz)
- 📱 Instagram: [@lifesimulator.az](https://instagram.com/lifesimulator.az)

---

**🎮 Life Simulator Azerbaijan - Where Every Life Tells a Story! 🇦🇿**

👉 **[ANALYSIS_INDEX.md](./ANALYSIS_INDEX.md)** - Начните здесь!

**Быстрые ссылки**:
- [Краткая сводка](./ANALYSIS_SUMMARY.md) - 5 минут
- [План действий](./ACTION_PLAN.md) - Что делать прямо сейчас
- [Визуальная карта](./PROJECT_MAP.md) - Структура проекта
- [Анализ компонентов](./COMPONENT_ANALYSIS.md) - Детали
- [Технические проблемы](./TECHNICAL_GAPS.md) - Что нужно исправить

**Ключевые метрики**:
- ✅ Готовность к релизу: **75%**
- ✅ TypeScript покрытие: **70%**
- ⚠️ Тесты: **0%** (нужно добавить)
- 🎯 Цель: **95%** готовности через 4 недели

---

## 🗺️ Development Roadmap

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for the complete development plan:

- **Phase 1**: TypeScript Migration (Current)
- **Phase 2**: Architecture Improvements
- **Phase 3**: Performance Optimization
- **Phase 4**: Testing Infrastructure
- **Phase 5**: Game-Specific Features
- **Phase 6**: Production Launch

---

### Configuration

#### 1. Gemini API Key

Open `src/services/AIEngine.js` and add your API key:

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

Get key at: https://makersuite.google.com/app/apikey

#### 2. Adapty Setup (Optional - for monetization)

Open `src/services/MonetizationService.js`:

```javascript
const ADAPTY_PUBLIC_KEY = 'YOUR_ADAPTY_PUBLIC_KEY';
```

Get key at: https://app.adapty.io/

#### 3. Avaturn Setup (Optional - for avatar morphing)

Open `src/services/AvatarService.js`:

```javascript
const AVATURN_API_KEY = 'YOUR_AVATURN_API_KEY';
```

Get key at: https://avaturn.me/

## 🏗️ Project Structure

```
src/
├── components/         # UI components
│   ├── HUD.js         # Health/Happiness/Wealth/Skills bars
│   ├── EventCard.js   # Event display with choices
│   └── AvatarView.js  # Avatar display component
├── screens/           # App screens
│   ├── MainScreen.js  # Character creation & level selection
│   ├── GameScreen.js  # Main gameplay loop
│   ├── EventScreen.js # Event interaction screen
│   └── ShareScreen.js # Share achievements
├── services/          # Core game logic
│   ├── AIEngine.js    # Gemini AI + fallback events
│   ├── CharacterManager.js # Character state management
│   ├── HistoricalEvents.js # Historical context 1850-2025
│   ├── LevelSystem.js # Level progression & achievements
│   ├── AvatarService.js # Avatar aging system
│   └── MonetizationService.js # IAP & Rewind
├── context/           # React Context
│   ├── GameContext.js # Global game state
│   └── CharacterContext.js # Character data
└── data/              # Static data
    ├── fallbackEvents.json # Offline events
    ├── historicalData.json # Historical events by country/year
    └── achievements.json   # Achievement definitions
```

## 🎮 Game Features

### Character System

- **Attributes**: Health (0-100), Happiness (0-100), Wealth (0-100), Skills (0-100)
- **Age**: 0-80 years, Quick Mode: 1.5-4h = 40 years
- **Professions**: PMP, Programmer, Doctor, Teacher, etc.
- **Skills**: Affect event outcomes and career progression
- **Randomize**: On setup screen tap "Randomize character" to auto-fill name, country, and year

### Historical Events

- **Countries**: USA, Russia, India, China, Germany, Japan, Brazil, etc.
- **Years**: 1850-2025
- **Impact**: 20-30% of scenarios affected by historical context
- **Examples**:
  - 1929 USA → Great Depression → Wealth penalties
  - 1941 USSR → WW2 → Health/survival risks
  - 1980 India → License Raj → Business restrictions

### AI Event System

Events generated by Gemini Flash API with structure:

```json
{
  "situation": "Realistic life event (max 200 chars)",
  "A": "Safe choice (low risk, low reward)",
  "B": "Balanced choice (moderate risk/reward)",
  "C": "Risky choice (high reward, death chance)",
  "D": "Custom choice (player input, AI evaluates)",
  "effects": {
    "A": { "health": 0, "happiness": 5, "wealth": 100, "skills": 0 },
    "B": { "health": -5, "happiness": 10, "wealth": 500, "skills": 5 },
    "C": { "health": -20, "happiness": 30, "wealth": 2000, "skills": 10, "deathChance": 0.3 }
  }
}
```

**NEW: Choice D - Custom Input**

- Players can type their own action (max 200 chars)
- AI evaluates if the choice is logical and creative
- Correct choices award +1-3 Skills bonus
- AI provides explanation of consequences
- Example: "I'll start my own business" → AI evaluates based on character's skills, wealth, age

**Event Memory:**

- AI remembers last 10 events to avoid repetition
- All choices are saved to `character.history`
- Rewind system allows rolling back 5 events

### Level System

- **Demo**: 5 minutes, easy scenarios
- **Levels 1-5**: Progressive difficulty, unlock sequentially
- **C-Risks**: 20-60% chance of death/criminal outcomes
- **Achievements**: Farm crystals for Rewind purchases

### Monetization

- **Rewind IAP**: $0.99 - $4.99 via Adapty
- **Daily Rewards**: Free crystals
- **Achievements**: Unlock rewards
- **Viral Marketing**: TikTok selfie→death→Rewind campaigns

## 🛠️ Development Guide

### Adding New Events

Edit `src/data/fallbackEvents.json`:

```json
{
- Event generation preview
- AI prompt inspection (check console)

## 📊 Analytics & Metrics
- Age reached
- Wealth accumulated
- Rewind purchases
- Death causes
- Achievement completion rate

## 🎨 UI Customization
- Colors: `src/styles/theme.js`
- Fonts: Add to `assets/fonts/`
- Avatar styles: `src/components/AvatarView.js`

## 🔒 Privacy & Safety
- All data stored locally (AsyncStorage)
- No data collection without consent
- 18+ content warnings
- Optional AI features

## 📝 License
MIT License - Free for personal/commercial use

## 🤝 Contributing
1. Fork the repo
2. Create feature branch
3. Test thoroughly
4. Submit pull request

## 🆘 Troubleshooting

### Common Issues
1. **"Unable to resolve module"**: Run `npm install` again
2. **Android build fails**: Check Android SDK installation
3. **AI not working**: Check API key and internet connection
4. **Slow performance**: Enable Hermes engine in app.json

### Support
- GitHub Issues: Report bugs
- Discord: Community support
- Email: support@lifesim.com

## 🎯 Roadmap
- [ ] Multiplayer mode
- [ ] More countries & historical periods
- [ ] Career progression trees
- [ ] Relationship system
- [ ] Housing & assets
- [ ] iOS version
- [ ] Cloud save sync

---

**Version**: 1.0.0
**Last Updated**: November 2025
**Made with ❤️ for realistic life simulation**
```
