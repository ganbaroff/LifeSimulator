import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import achievementService from '../services/AchievementService';

const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [unlockedAchievements, setUnlockedAchievements] = useState(achievementService.getUnlockedAchievements());
  const [lockedAchievements, setLockedAchievements] = useState(achievementService.getLockedAchievements());
  const [totalCrystals, setTotalCrystals] = useState(achievementService.getTotalCrystalsEarned());

  useEffect(() => {
    // Refresh achievements when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      setUnlockedAchievements(achievementService.getUnlockedAchievements());
      setLockedAchievements(achievementService.getLockedAchievements());
      setTotalCrystals(achievementService.getTotalCrystalsEarned());
    });

    return unsubscribe;
  }, [navigation]);

  const renderAchievement = (achievement: any, isUnlocked: boolean) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        isUnlocked ? styles.unlockedCard : styles.lockedCard,
      ]}
    >
      <LinearGradient
        colors={isUnlocked ? ['#fbbf24', '#f59e0b'] : ['#6b7280', '#4b5563']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            {!isUnlocked && (
              <View style={styles.lockOverlay}>
                <Icon name="lock" size={16} color="#ffffff" />
              </View>
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
            
            {isUnlocked && achievement.reward.crystals && (
              <View style={styles.rewardContainer}>
                <Icon name="diamond" size={16} color="#ffffff" />
                <Text style={styles.rewardText}>
                  +{achievement.reward.crystals} Crystals
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.crystalContainer}>
            <Icon name="diamond" size={20} color="#fbbf24" />
            <Text style={styles.crystalText}>{totalCrystals}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {unlockedAchievements.length + lockedAchievements.length}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(
                (unlockedAchievements.length / (unlockedAchievements.length + lockedAchievements.length)) * 100
              )}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Achievements List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Unlocked</Text>
              {unlockedAchievements.map((achievement) =>
                renderAchievement(achievement, true)
              )}
            </View>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Locked</Text>
              {lockedAchievements.map((achievement) =>
                renderAchievement(achievement, false)
              )}
            </View>
          )}

          {unlockedAchievements.length === 0 && lockedAchievements.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="emoji-events" size={64} color="#6b7280" />
              <Text style={styles.emptyText}>No achievements available yet</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  crystalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  crystalText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  unlockedCard: {
    elevation: 6,
    shadowOpacity: 0.3,
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 28,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rewardText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
  },
});

export default AchievementsScreen;
