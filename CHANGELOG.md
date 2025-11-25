# Changelog

## [1.0.0] - 2025-11-25

### Added
- ✨ Full React Native (Expo) implementation
- 🤖 Gemini Flash AI integration for event generation
- 📜 Historical events system (1850-2025) for 7 countries
- 🎮 5 difficulty levels + Demo mode
- 💎 Crystal currency and achievement system
- ⏮️ Rewind system with IAP support (Adapty)
- 👤 Avatar system with Avaturn SDK integration
- 💾 AsyncStorage for local save system
- 🎯 HUD with 4 attribute bars (Health, Happiness, Wealth, Skills)
- 🎲 A/B/C choice system with risk/reward balance
- ☠️ Death mechanics with multiple outcomes
- 🏆 15 achievements with rewards
- 📱 Android-ready build configuration

### Features
- Character creation with country and birth year selection
- Dynamic event generation based on age, profession, and historical context
- Fallback event system (20 pre-written events) when AI unavailable
- Level progression with unlock system
- Time-based gameplay (5 min to 3 hours per level)
- C-choice death risk system (10-60% depending on level)
- Crystal farming through gameplay
- Daily rewards system
- Game Over with rewards calculation
- Complete navigation flow

### Technical
- React Navigation v6
- Context API for state management
- Expo Linear Gradient for UI
- Axios for API calls
- AsyncStorage for persistence
- EAS Build support for APK/AAB generation
- TypeScript-ready structure

### Documentation
- README.md - Complete project overview
- SETUP.md - Detailed setup instructions
- DEVELOPMENT.md - Developer guide for adding features
- QUICKSTART.md - Fast start guide
- Inline code comments in all files

### Known Limitations
- Avaturn integration is mock (placeholder images)
- Adapty IAP is mock (needs real SDK integration)
- No assets/icons included (placeholders provided)
- AI requires internet connection (fallback works offline)

## [Planned - 1.1.0]

### To Add
- Real Avaturn SDK integration with selfie upload
- Real Adapty SDK integration for IAP
- Share to social media feature
- More historical events (expand to 15+ countries)
- Relationship system
- Career progression trees
- Housing and assets system
- Cloud save synchronization
- Achievement notifications
- Sound effects and music
- Tutorial/onboarding flow
- Settings screen
- Statistics tracking
- Leaderboards

### To Improve
- Performance optimization
- Better error handling
- More event variety (50+ fallback events)
- AI prompt refinement
- UI/UX polish
- Accessibility features
- Localization support

---

For detailed changes and commits, see GitHub repository.
