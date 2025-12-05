// Экран выбора профессии - Sprint 4
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { characterActions } from '../../store/slices/characterSlice';
import { useNavigation } from '@react-navigation/native';

interface Profession {
  id: string;
  name: string;
  description: string;
  requirements: {
    minAge: number;
    maxAge: number;
    minEducation?: string;
  };
  effects: {
    wealth: number;
    happiness: number;
    energy: number;
  };
  career: {
    startSalary: number;
    maxSalary: number;
    growthRate: number;
  };
}

const PROFESSIONS: Profession[] = [
  {
    id: 'doctor',
    name: 'Врач',
    description: 'Спасать жизни и помогать людям. Требует высшего медицинского образования.',
    requirements: {
      minAge: 25,
      maxAge: 45,
      minEducation: 'university'
    },
    effects: {
      wealth: 50,
      happiness: 30,
      energy: -20
    },
    career: {
      startSalary: 80,
      maxSalary: 200,
      growthRate: 1.5
    }
  },
  {
    id: 'teacher',
    name: 'Учитель',
    description: 'Обучать новое поколение. Требует педагогического образования.',
    requirements: {
      minAge: 22,
      maxAge: 60,
      minEducation: 'university'
    },
    effects: {
      wealth: 30,
      happiness: 40,
      energy: -15
    },
    career: {
      startSalary: 40,
      maxSalary: 80,
      growthRate: 1.2
    }
  },
  {
    id: 'engineer',
    name: 'Инженер',
    description: 'Проектировать и создавать. Требует технического образования.',
    requirements: {
      minAge: 23,
      maxAge: 55,
      minEducation: 'university'
    },
    effects: {
      wealth: 60,
      happiness: 25,
      energy: -10
    },
    career: {
      startSalary: 70,
      maxSalary: 150,
      growthRate: 1.4
    }
  },
  {
    id: 'business',
    name: 'Предприниматель',
    description: 'Создавать свой бизнес. Не требует образования, но требует амбиций.',
    requirements: {
      minAge: 18,
      maxAge: 50
    },
    effects: {
      wealth: 40,
      happiness: 35,
      energy: -25
    },
    career: {
      startSalary: 30,
      maxSalary: 300,
      growthRate: 2.0
    }
  },
  {
    id: 'worker',
    name: 'Рабочий',
    description: 'Физическая работа на производстве или стройке. Не требует образования.',
    requirements: {
      minAge: 18,
      maxAge: 60
    },
    effects: {
      wealth: 20,
      happiness: 15,
      energy: -30
    },
    career: {
      startSalary: 25,
      maxSalary: 40,
      growthRate: 1.1
    }
  },
  {
    id: 'artist',
    name: 'Художник/Творец',
    description: 'Создавать искусство. Требует таланта, но не обязательно образование.',
    requirements: {
      minAge: 16,
      maxAge: 70
    },
    effects: {
      wealth: 10,
      happiness: 50,
      energy: -5
    },
    career: {
      startSalary: 15,
      maxSalary: 100,
      growthRate: 1.3
    }
  }
];

const ProfessionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const character = useSelector((state: RootState) => state.character.current);
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);

  useEffect(() => {
    if (!character) {
      navigation.navigate('Start' as never);
      return;
    }

    // Проверяем, есть ли уже профессия
    if (character.profession && character.profession !== 'none') {
      navigation.navigate('Game' as never);
      return;
    }

    // Проверяем возраст для выбора профессии
    if (character.age < 16) {
      Alert.alert('Слишком рано', 'Профессию можно выбрать с 16 лет');
      navigation.navigate('Game' as never);
      return;
    }
  }, [character, navigation]);

  const handleProfessionSelect = async (profession: Profession) => {
    if (!character) return;

    // Проверяем требования
    if (character.age < profession.requirements.minAge || character.age > profession.requirements.maxAge) {
      Alert.alert('Неподходящий возраст', `Эта профессия доступна с ${profession.requirements.minAge} до ${profession.requirements.maxAge} лет`);
      return;
    }

    setSelectedProfession(profession);
  };

  const handleConfirmProfession = async () => {
    if (!selectedProfession || !character) return;

    try {
      console.log(`💼 Выбрана профессия: ${selectedProfession.name}`);

      // Устанавливаем профессию
      await dispatch(characterActions.updateCharacter({ 
        profession: selectedProfession.id,
        jobTitle: selectedProfession.name,
        salary: selectedProfession.career.startSalary
      }));

      // Применяем эффекты профессии
      await dispatch(characterActions.updateStats(selectedProfession.effects));

      // Добавляем в историю
      const professionEvent = {
        id: `profession_${Date.now()}`,
        source: 'system' as const,
        situation: `Вы выбрали профессию: ${selectedProfession.name}`,
        A: 'Начать работать с энтузиазмом',
        B: 'Осторожно освоиться',
        C: 'Искать дополнительные возможности',
        effects: {
          A: { happiness: 10, energy: -5 },
          B: { energy: 5 },
          C: { wealth: 10, energy: -10 }
        }
      };

      // Переходим в игру
      Alert.alert('Профессия выбрана!', `Теперь вы ${selectedProfession.name}`);
      navigation.navigate('Game' as never);
    } catch (error) {
      console.error('❌ Ошибка при выборе профессии:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать профессию');
    }
  };

  const availableProfessions = PROFESSIONS.filter(profession => 
    character && 
    character.age >= profession.requirements.minAge && 
    character.age <= profession.requirements.maxAge
  );

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Выберите профессию</Text>
        <Text style={styles.subtitle}>
          {character.name}, {character.age} лет • {character.birthCity}
        </Text>
      </View>

      {/* Профессии */}
      <View style={styles.professionsContainer}>
        {availableProfessions.map((profession) => (
          <TouchableOpacity
            key={profession.id}
            style={[
              styles.professionCard,
              selectedProfession?.id === profession.id && styles.professionCardSelected
            ]}
            onPress={() => handleProfessionSelect(profession)}
            activeOpacity={0.7}
          >
            <View style={styles.professionHeader}>
              <Text style={styles.professionName}>{profession.name}</Text>
              <Text style={styles.professionSalary}>
                💰 {profession.career.startSalary}-{profession.career.maxSalary} манат
              </Text>
            </View>
            
            <Text style={styles.professionDescription}>{profession.description}</Text>
            
            <View style={styles.professionRequirements}>
              <Text style={styles.requirementText}>
                Возраст: {profession.requirements.minAge}-{profession.requirements.maxAge} лет
              </Text>
              {profession.requirements.minEducation && (
                <Text style={styles.requirementText}>
                  Образование: {profession.requirements.minEducation === 'university' ? 'Высшее' : 'Среднее'}
                </Text>
              )}
            </View>

            <View style={styles.professionEffects}>
              <Text style={styles.effectTitle}>Эффекты:</Text>
              <View style={styles.effectRow}>
                <Text style={styles.effectText}>💰 {profession.effects.wealth > 0 ? '+' : ''}{profession.effects.wealth} богатства</Text>
                <Text style={styles.effectText}>😊 {profession.effects.happiness > 0 ? '+' : ''}{profession.effects.happiness} счастья</Text>
                <Text style={styles.effectText}>⚡ {profession.effects.energy > 0 ? '+' : ''}{profession.effects.energy} энергии</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Кнопка подтверждения */}
      {selectedProfession && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmProfession}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              Стать {selectedProfession.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  professionsContainer: {
    padding: 20,
  },
  professionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  professionCardSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  professionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  professionSalary: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  professionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 20,
  },
  professionRequirements: {
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  professionEffects: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  effectTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  effectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  effectText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  confirmContainer: {
    padding: 20,
    paddingTop: 0,
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfessionScreen;
