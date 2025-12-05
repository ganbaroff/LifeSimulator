export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (character: any, gameState: any) => boolean;
  reward: {
    crystals?: number;
    title?: string;
  };
  unlocked: boolean;
}

class AchievementService {
  private achievements: Achievement[] = [
    {
      id: 'first_day',
      title: 'First Steps',
      description: 'Complete your first day',
      icon: '👶',
      requirement: (character, gameState) => gameState.currentDay >= 1,
      reward: { crystals: 5 },
      unlocked: false,
    },
    {
      id: 'survivor',
      title: 'Survivor',
      description: 'Reach age 50',
      icon: '🎂',
      requirement: (character) => character.age >= 50,
      reward: { crystals: 20 },
      unlocked: false,
    },
    {
      id: 'wealthy',
      title: 'Wealthy',
      description: 'Accumulate $10,000',
      icon: '💰',
      requirement: (character) => character.wealth >= 10000,
      reward: { crystals: 15 },
      unlocked: false,
    },
    {
      id: 'healthy',
      title: 'Healthy Lifestyle',
      description: 'Maintain 90+ health for 10 days',
      icon: '💪',
      requirement: (character, gameState) => {
        return character.health >= 90 && gameState.currentDay >= 10;
      },
      reward: { crystals: 10 },
      unlocked: false,
    },
    {
      id: 'centenarian',
      title: 'Centenarian',
      description: 'Reach age 100',
      icon: '👴',
      requirement: (character) => character.age >= 100,
      reward: { crystals: 50 },
      unlocked: false,
    },
    {
      id: 'happy_life',
      title: 'Happy Life',
      description: 'Maintain 80+ happiness',
      icon: '😊',
      requirement: (character) => character.happiness >= 80,
      reward: { crystals: 25 },
      unlocked: false,
    },
  ];

  checkAchievements(character: any, gameState: any): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.requirement(character, gameState)) {
        achievement.unlocked = true;
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  getLockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => !a.unlocked);
  }

  getTotalCrystalsEarned(): number {
    return this.achievements
      .filter((a) => a.unlocked)
      .reduce((total, a) => total + (a.reward.crystals || 0), 0);
  }

  resetAchievements(): void {
    this.achievements.forEach((a) => (a.unlocked = false));
  }
}

export default new AchievementService();
