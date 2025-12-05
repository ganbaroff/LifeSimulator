// Реальная система достижений
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/indexRedux';
import { characterActions } from '../store/slices/characterSlice';
import { useSoundEffects } from '../utils/soundEffects';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'age' | 'wealth' | 'health' | 'happiness' | 'events' | 'choices';
    value: number;
    operator?: '>' | '<' | '=' | '>=' | '<=';
  };
  reward: {
    title: string;
    effects: {
      health?: number;
      happiness?: number;
      wealth?: number;
      energy?: number;
    };
  };
  unlocked: boolean;
  unlockedAt?: string;
}

export const AchievementSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { playAchievement } = useSoundEffects();
  const character = useAppSelector(state => state.character.current);
  const history = useAppSelector(state => state.character.history);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [fadeAnimation] = useState(new Animated.Value(0));

  // База данных достижений
  const ALL_ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_steps',
      title: 'Первые шаги',
      description: 'Сделайте свой первый выбор в жизни',
      icon: '👶',
      requirement: { type: 'events', value: 1, operator: '>=' },
      reward: {
        title: 'Опыт новичка',
        effects: { happiness: 5, energy: 5 }
      },
      unlocked: false,
    },
    {
      id: 'teenager',
      title: 'Подросток',
      description: 'Достигните возраста 15 лет',
      icon: '🎮',
      requirement: { type: 'age', value: 15, operator: '>=' },
      reward: {
        title: 'Юношеская энергия',
        effects: { energy: 10, happiness: 10 }
      },
      unlocked: false,
    },
    {
      id: 'adult',
      title: 'Совершеннолетие',
      description: 'Достигните возраста 18 лет',
      icon: '🎓',
      requirement: { type: 'age', value: 18, operator: '>=' },
      reward: {
        title: 'Независимость',
        effects: { wealth: 500, happiness: 15 }
      },
      unlocked: false,
    },
    {
      id: 'wealthy',
      title: 'Богатство',
      description: 'Накопите 10000 денег',
      icon: '💎',
      requirement: { type: 'wealth', value: 10000, operator: '>=' },
      reward: {
        title: 'Финансовая свобода',
        effects: { happiness: 20, wealth: 1000 }
      },
      unlocked: false,
    },
    {
      id: 'healthy',
      title: 'Здоровяк',
      description: 'Достигните 100 здоровья',
      icon: '💪',
      requirement: { type: 'health', value: 100, operator: '>=' },
      reward: {
        title: 'Идеальное здоровье',
        effects: { energy: 15, happiness: 10 }
      },
      unlocked: false,
    },
    {
      id: 'happy',
      title: 'Счастье',
      description: 'Достигните 100 счастья',
      icon: '😊',
      requirement: { type: 'happiness', value: 100, operator: '>=' },
      reward: {
        title: 'Блаженство',
        effects: { health: 10, energy: 10 }
      },
      unlocked: false,
    },
    {
      id: 'experienced',
      title: 'Опытный',
      description: 'Примите 50 решений',
      icon: '📚',
      requirement: { type: 'choices', value: 50, operator: '>=' },
      reward: {
        title: 'Мудрость',
        effects: { happiness: 15, health: 15 }
      },
      unlocked: false,
    },
    {
      id: 'middle_age',
      title: 'Зрелость',
      description: 'Достигните возраста 40 лет',
      icon: '👔',
      requirement: { type: 'age', value: 40, operator: '>=' },
      reward: {
        title: 'Карьерный рост',
        effects: { wealth: 2000, happiness: 10 }
      },
      unlocked: false,
    },
    {
      id: 'elder',
      title: 'Старость',
      description: 'Достигните возраста 65 лет',
      icon: '👴',
      requirement: { type: 'age', value: 65, operator: '>=' },
      reward: {
        title: 'Пенсия',
        effects: { wealth: 3000, health: 20 }
      },
      unlocked: false,
    },
    {
      id: 'centenarian',
      title: 'Долгожитель',
      description: 'Достигните возраста 100 лет',
      icon: '🎂',
      requirement: { type: 'age', value: 100, operator: '>=' },
      reward: {
        title: 'Легенда',
        effects: { happiness: 50, wealth: 5000 }
      },
      unlocked: false,
    },
  ];

  // Проверка выполнения условий
  const checkRequirement = (achievement: Achievement): boolean => {
    if (!character) return false;

    const { requirement } = achievement;
    const { type, value, operator = '>=' } = requirement;

    let currentValue: number;

    switch (type) {
      case 'age':
        currentValue = character.age;
        break;
      case 'wealth':
        currentValue = character.stats.wealth;
        break;
      case 'health':
        currentValue = character.stats.health;
        break;
      case 'happiness':
        currentValue = character.stats.happiness;
        break;
      case 'events':
        currentValue = history?.length || 0;
        break;
      case 'choices':
        currentValue = history?.length || 0;
        break;
      default:
        return false;
    }

    switch (operator) {
      case '>': return currentValue > value;
      case '<': return currentValue < value;
      case '=': return currentValue === value;
      case '>=': return currentValue >= value;
      case '<=': return currentValue <= value;
      default: return currentValue >= value;
    }
  };

  // Проверка и разблокировка достижений
  const checkAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      if (!achievement.unlocked && checkRequirement(achievement)) {
        // Разблокируем достижение
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };

        // Применяем награду
        if (character && unlockedAchievement.reward.effects) {
          dispatch(characterActions.updateStats(unlockedAchievement.reward.effects));
        }

        // Показываем уведомление
        showAchievementNotification(unlockedAchievement);

        return unlockedAchievement;
      }
      return achievement;
    });

    setAchievements(updatedAchievements);
  };

  // Показ уведомления о достижении
  const showAchievementNotification = (achievement: Achievement) => {
    setNewAchievement(achievement);
    setShowAnimation(true);
    playAchievement();

    // Анимация появления
    Animated.sequence([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAnimation(false);
      setNewAchievement(null);
    });

    Alert.alert(
      '🎉 Достижение разблокировано!',
      `${achievement.icon} ${achievement.title}\n\n${achievement.description}\n\nНаграда: ${achievement.reward.title}`,
      [{ text: 'Отлично!', style: 'default' }]
    );
  };

  // Инициализация достижений
  useEffect(() => {
    if (character) {
      const initializedAchievements = ALL_ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: checkRequirement(achievement),
      }));
      setAchievements(initializedAchievements);
    }
  }, [character]);

  // Проверка достижений при изменении состояния
  useEffect(() => {
    if (achievements.length > 0) {
      checkAchievements();
    }
  }, [character?.age, character?.stats, history?.length]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения</Text>
        <Text style={styles.progress}>{unlockedCount}/{totalCount}</Text>
      </View>

      {/* Прогресс бар */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Уведомление о новом достижении */}
      {showAnimation && newAchievement && (
        <Animated.View style={[styles.achievementNotification, { opacity: fadeAnimation }]}>
          <Text style={styles.notificationTitle}>🎉 Новое достижение!</Text>
          <Text style={styles.notificationText}>
            {newAchievement.icon} {newAchievement.title}
          </Text>
          <Text style={styles.notificationReward}>
            Награда: {newAchievement.reward.title}
          </Text>
        </Animated.View>
      )}

      {/* Список достижений */}
      <View style={styles.achievementsList}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementItem,
              achievement.unlocked && styles.unlockedAchievement,
            ]}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.iconText}>
                {achievement.unlocked ? achievement.icon : '🔒'}
              </Text>
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.lockedText,
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              
              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Разблокировано: {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
              )}
              
              {!achievement.unlocked && (
                <Text style={styles.requirementText}>
                  Требуется: {achievement.requirement.type === 'age' && `возраст ${achievement.requirement.value}`}
                  {achievement.requirement.type === 'wealth' && `${achievement.requirement.value} денег`}
                  {achievement.requirement.type === 'health' && `${achievement.requirement.value} здоровья`}
                  {achievement.requirement.type === 'happiness' && `${achievement.requirement.value} счастья`}
                  {achievement.requirement.type === 'events' && `${achievement.requirement.value} событий`}
                  {achievement.requirement.type === 'choices' && `${achievement.requirement.value} выборов`}
                </Text>
              )}
              
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>Награда:</Text>
                <Text style={styles.rewardText}>
                  {achievement.reward.title}
                </Text>
                <View style={styles.rewardEffects}>
                  {Object.entries(achievement.reward.effects).map(([stat, value]) => (
                    <Text key={stat} style={styles.effectText}>
                      {stat === 'health' && '❤️'}
                      {stat === 'happiness' && '😊'}
                      {stat === 'wealth' && '💰'}
                      {stat === 'energy' && '⚡'}
                      {' +'}{value}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progress: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  achievementNotification: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationReward: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unlockedAchievement: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  lockedText: {
    color: '#64748b',
  },
  achievementDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    lineHeight: 16,
  },
  unlockedDate: {
    fontSize: 10,
    color: '#10b981',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 11,
    color: '#f97316',
    marginBottom: 8,
  },
  rewardInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    padding: 8,
  },
  rewardTitle: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 10,
    color: '#10b981',
    marginBottom: 4,
  },
  rewardEffects: {
    flexDirection: 'row',
    gap: 8,
  },
  effectText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
