// Экран статистики - Sprint 3 Task 4
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { Character, CharacterStats, CharacterSkills, CharacterRelationships } from '../../types/game';
import StatsDisplay from './StatsDisplay';

interface StatsScreenProps {}

const StatsScreen: React.FC<StatsScreenProps> = () => {
  const character = useSelector((state: RootState) => state.character.current);
  const game = useSelector((state: RootState) => state.game);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Персонаж не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Статистика персонажа</Text>
        <Text style={styles.subtitle}>{character.name}</Text>
      </View>

      {/* Основные характеристики */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Основные характеристики</Text>
        <StatsDisplay
          stats={character.stats}
          showChanges={false}
          compact={false}
        />
      </View>

      {/* Навыки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Навыки</Text>
        <View style={styles.skillsGrid}>
          <SkillItem
            name="Интеллект"
            value={character.skills.intelligence}
            icon="🧠"
            color="#3b82f6"
          />
          <SkillItem
            name="Креативность"
            value={character.skills.creativity}
            icon="🎨"
            color="#10b981"
          />
          <SkillItem
            name="Социальность"
            value={character.skills.social}
            icon="👥"
            color="#f59e0b"
          />
          <SkillItem
            name="Физика"
            value={character.skills.physical}
            icon="💪"
            color="#ef4444"
          />
          <SkillItem
            name="Бизнес"
            value={character.skills.business}
            icon="💼"
            color="#8b5cf6"
          />
          <SkillItem
            name="Технологии"
            value={character.skills.technical}
            icon="💻"
            color="#06b6d4"
          />
        </View>
      </View>

      {/* Отношения */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Отношения</Text>
        <View style={styles.relationshipsGrid}>
          <RelationshipItem
            name="Семья"
            value={character.relationships.family}
            icon="👨‍👩‍👧‍👦"
            color="#ef4444"
          />
          <RelationshipItem
            name="Друзья"
            value={character.relationships.friends}
            icon="👫"
            color="#10b981"
          />
          <RelationshipItem
            name="Романтика"
            value={character.relationships.romantic}
            icon="💕"
            color="#f59e0b"
          />
          <RelationshipItem
            name="Коллеги"
            value={character.relationships.colleagues}
            icon="🏢"
            color="#3b82f6"
          />
        </View>
      </View>

      {/* Информация о персонаже */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация о персонаже</Text>
        <View style={styles.infoGrid}>
          <InfoItem
            label="Возраст"
            value={`${character.age} лет`}
            icon="🎂"
          />
          <InfoItem
            label="Город рождения"
            value={character.birthCity || 'Баку'}
            icon="🏙️"
          />
          <InfoItem
            label="Год рождения"
            value={character.birthYear}
            icon="📅"
          />
          <InfoItem
            label="Профессия"
            value={character.profession || 'Нет'}
            icon="💼"
          />
          <InfoItem
            label="Образование"
            value={character.educationLevel || 'Нет'}
            icon="🎓"
          />
          <InfoItem
            label="Текущий год"
            value={game.currentYear || character.birthYear + character.age}
            icon="📆"
          />
        </View>
      </View>

      {/* Статистика игры */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Статистика игры</Text>
        <View style={styles.gameStatsGrid}>
          <GameStatItem
            label="События"
            value={game.eventCount}
            icon="📝"
          />
          <GameStatItem
            label="Дней в игре"
            value={game.currentDay}
            icon="📅"
          />
          <GameStatItem
            label="Текущий год"
            value={game.currentYear || character.birthYear + character.age}
            icon="📆"
          />
          <GameStatItem
            label="Записей в истории"
            value={character.history?.length || 0}
            icon="📚"
          />
        </View>
      </View>

      {/* Здоровье */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Состояние здоровья</Text>
        <View style={styles.healthContainer}>
          <Text style={styles.healthStatus}>
            {character.currentDisease ? `Болезнь: ${character.currentDisease}` : 'Здоров'}
          </Text>
          <Text style={styles.healthDescription}>
            {character.currentDisease 
              ? 'Нуждается в лечении'
              : 'Персонаж в хорошем состоянии'
            }
          </Text>
        </View>
      </View>

      {/* Достижения (заглушка) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Достижения</Text>
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsText}>
            Система достижений будет добавлена в Sprint 5
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Компонент для отображения навыка
interface SkillItemProps {
  name: string;
  value: number;
  icon: string;
  color: string;
}

const SkillItem: React.FC<SkillItemProps> = ({ name, value, icon, color }) => {
  const percentage = (value / 100) * 100;

  return (
    <View style={styles.skillItem}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillIcon}>{icon}</Text>
        <Text style={styles.skillName}>{name}</Text>
      </View>
      <View style={styles.skillBar}>
        <View style={[styles.skillFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.skillValue}>{value}/100</Text>
    </View>
  );
};

// Компонент для отображения отношений
interface RelationshipItemProps {
  name: string;
  value: number;
  icon: string;
  color: string;
}

const RelationshipItem: React.FC<RelationshipItemProps> = ({ name, value, icon, color }) => {
  const percentage = (value / 100) * 100;

  return (
    <View style={styles.relationshipItem}>
      <View style={styles.relationshipHeader}>
        <Text style={styles.relationshipIcon}>{icon}</Text>
        <Text style={styles.relationshipName}>{name}</Text>
      </View>
      <View style={styles.relationshipBar}>
        <View style={[styles.relationshipFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.relationshipValue}>{value}/100</Text>
    </View>
  );
};

// Компонент для отображения информации
interface InfoItemProps {
  label: string;
  value: string | number;
  icon: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

// Компонент для отображения игровой статистики
interface GameStatItemProps {
  label: string;
  value: number;
  icon: string;
}

const GameStatItem: React.FC<GameStatItemProps> = ({ label, value, icon }) => {
  return (
    <View style={styles.gameStatItem}>
      <Text style={styles.gameStatIcon}>{icon}</Text>
      <Text style={styles.gameStatValue}>{value}</Text>
      <Text style={styles.gameStatLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  skillsGrid: {
    gap: 12,
  },
  skillItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  skillBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 4,
  },
  skillFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  relationshipsGrid: {
    gap: 12,
  },
  relationshipItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relationshipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  relationshipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  relationshipBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 4,
  },
  relationshipFill: {
    height: '100%',
    borderRadius: 3,
  },
  relationshipValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  gameStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gameStatItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  gameStatIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  gameStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  gameStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  healthContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  healthDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  achievementsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default StatsScreen;
