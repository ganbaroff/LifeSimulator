// src/components/StatsDisplay.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CharacterSkills, CharacterRelationships } from '../types/game';

interface StatsDisplayProps {
  stats: {
    health: number;
    happiness: number;
    wealth: number;
    energy: number;
  };
  skills?: CharacterSkills;
  relationships?: CharacterRelationships;
  profession?: string | null;
  educationLevel?: string | null;
  currentDisease?: string | null;
  previousStats?: {
    health: number;
    happiness: number;
    wealth: number;
    energy: number;
  };
  previousSkills?: CharacterSkills;
  previousRelationships?: CharacterRelationships;
  showChanges?: boolean;
}

interface SkillItemProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  previousValue?: number;
  showChange?: boolean;
}

const SkillItem: React.FC<SkillItemProps> = ({ 
  label, 
  value, 
  maxValue, 
  color, 
  previousValue, 
  showChange 
}) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const change = previousValue !== undefined ? value - previousValue : 0;
  
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueContainer}>
          <Text style={styles.statValue}>{value}</Text>
          {showChange && previousValue !== undefined && (
            <Text style={[
              styles.statChange, 
              { color: change > 0 ? '#4CAF50' : change < 0 ? '#FF5252' : '#FFFFFF' }
            ]}>
              {change > 0 ? '+' : ''}{change}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: color,
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              }
            ]}
          />
        </View>
        <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

interface RelationshipItemProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  previousValue?: number;
  showChange?: boolean;
}

const RelationshipItem: React.FC<RelationshipItemProps> = ({ 
  label, 
  value, 
  maxValue, 
  color, 
  previousValue, 
  showChange 
}) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const change = previousValue !== undefined ? value - previousValue : 0;
  
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueContainer}>
          <Text style={styles.statValue}>{value}</Text>
          {showChange && previousValue !== undefined && (
            <Text style={[
              styles.statChange, 
              { color: change > 0 ? '#4CAF50' : change < 0 ? '#FF5252' : '#FFFFFF' }
            ]}>
              {change > 0 ? '+' : ''}{change}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: color,
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              }
            ]}
          />
        </View>
        <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  maxValue, 
  color, 
  previousValue, 
  showChange 
}) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const change = previousValue !== undefined ? value - previousValue : 0;
  
  // Анимация progress bar
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);
  
  const getChangeColor = () => {
    if (change > 0) return '#4CAF50'; // Зеленый для улучшения
    if (change < 0) return '#F44336'; // Красный для ухудшения
    return 'transparent';
  };

  const getChangeText = () => {
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return '';
  };

  return (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {showChange && previousValue !== undefined && change !== 0 && (
          <Text style={[styles.statChange, { color: getChangeColor() }]}>
            {getChangeText()}
          </Text>
        )}
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: color
              }
            ]} 
          />
        </View>
        <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  stats, 
  skills,
  relationships,
  profession,
  educationLevel,
  currentDisease,
  previousStats, 
  previousSkills,
  previousRelationships,
  showChanges = false 
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Характеристики</Text>
      
      {/* Основные статы */}
      <StatItem
        label="Здоровье"
        value={stats.health}
        maxValue={200}
        color="#FF6B6B"
        previousValue={previousStats?.health}
        showChange={showChanges}
      />
      
      <StatItem
        label="Счастье"
        value={stats.happiness}
        maxValue={150}
        color="#4ECDC4"
        previousValue={previousStats?.happiness}
        showChange={showChanges}
      />
      
      <StatItem
        label="Энергия"
        value={stats.energy}
        maxValue={150}
        color="#45B7D1"
        previousValue={previousStats?.energy}
        showChange={showChanges}
      />
      
      <StatItem
        label="Богатство"
        value={stats.wealth}
        maxValue={10000}
        color="#96CEB4"
        previousValue={previousStats?.wealth}
        showChange={showChanges}
      />

      {/* Профессия и образование */}
      {(profession || educationLevel) && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Статус</Text>
          {profession && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Профессия:</Text>
              <Text style={styles.infoValue}>{profession}</Text>
            </View>
          )}
          {educationLevel && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Образование:</Text>
              <Text style={styles.infoValue}>{educationLevel}</Text>
            </View>
          )}
        </View>
      )}

      {/* Болезнь */}
      {currentDisease && (
        <View style={styles.diseaseContainer}>
          <Text style={styles.diseaseTitle}>⚠️ Болезнь</Text>
          <Text style={styles.diseaseName}>{currentDisease}</Text>
        </View>
      )}

      {/* Навыки */}
      {skills && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🧠 Навыки</Text>
          <SkillItem
            label="Интеллект"
            value={skills.intelligence}
            maxValue={200}
            color="#9B59B6"
            previousValue={previousSkills?.intelligence}
            showChange={showChanges}
          />
          <SkillItem
            label="Креативность"
            value={skills.creativity}
            maxValue={200}
            color="#E74C3C"
            previousValue={previousSkills?.creativity}
            showChange={showChanges}
          />
          <SkillItem
            label="Социальность"
            value={skills.social}
            maxValue={200}
            color="#3498DB"
            previousValue={previousSkills?.social}
            showChange={showChanges}
          />
          <SkillItem
            label="Физическая"
            value={skills.physical}
            maxValue={200}
            color="#27AE60"
            previousValue={previousSkills?.physical}
            showChange={showChanges}
          />
          <SkillItem
            label="Бизнес"
            value={skills.business}
            maxValue={200}
            color="#F39C12"
            previousValue={previousSkills?.business}
            showChange={showChanges}
          />
          <SkillItem
            label="Технические"
            value={skills.technical}
            maxValue={200}
            color="#34495E"
            previousValue={previousSkills?.technical}
            showChange={showChanges}
          />
        </View>
      )}

      {/* Отношения */}
      {relationships && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>👥 Отношения</Text>
          <RelationshipItem
            label="Семья"
            value={relationships.family}
            maxValue={100}
            color="#E91E63"
            previousValue={previousRelationships?.family}
            showChange={showChanges}
          />
          <RelationshipItem
            label="Друзья"
            value={relationships.friends}
            maxValue={100}
            color="#2196F3"
            previousValue={previousRelationships?.friends}
            showChange={showChanges}
          />
          <RelationshipItem
            label="Романтика"
            value={relationships.romantic}
            maxValue={100}
            color="#FF9800"
            previousValue={previousRelationships?.romantic}
            showChange={showChanges}
          />
          <RelationshipItem
            label="Коллеги"
            value={relationships.colleagues}
            maxValue={100}
            color="#4CAF50"
            previousValue={previousRelationships?.colleagues}
            showChange={showChanges}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  statContainer: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statChange: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#FFFFFF',
    minWidth: 35,
    textAlign: 'right',
  },
  sectionContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  infoValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  diseaseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  diseaseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 12,
    color: '#FF3B30',
  },
});

export default StatsDisplay;
