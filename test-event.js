// Простой тест для проверки getFallbackEvent
const { getFallbackEvent } = require('./src/services/AIEngine');

const testCharacter = {
  id: 'test-1',
  name: 'Test Character',
  age: 25,
  stats: { health: 100, happiness: 100, wealth: 1000, energy: 100 },
  skills: { intelligence: 50, creativity: 50, social: 50, physical: 50, business: 30, technical: 30 },
  relationships: { family: 70, friends: 60, romantic: 0, colleagues: 40 },
  country: 'USA',
  birthYear: 1998,
  profession: null,
  educationLevel: null,
  currentDisease: null,
  isAlive: true,
  deathCause: null,
  avatarUrl: null,
  history: [],
};

const gameState = { currentLevel: 'demo', settings: { aiEnabled: false } };

try {
  const event = getFallbackEvent(testCharacter, gameState);
  console.log('✅ Event loaded successfully:');
  console.log('- ID:', event.id);
  console.log('- Situation:', event.situation?.substring(0, 50) + '...');
  console.log('- Choice A:', event.A?.substring(0, 30) + '...');
  console.log('- Choice B:', event.B?.substring(0, 30) + '...');
  console.log('- Choice C:', event.C?.substring(0, 30) + '...');
  console.log('- Effects A:', event.effects?.A);
  console.log('- Effects B:', event.effects?.B);
  console.log('- Effects C:', event.effects?.C);
} catch (error) {
  console.error('❌ Error loading event:', error.message);
}
