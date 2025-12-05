import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { startActivity, Activity } from '../store/slices/activitiesSlice';
import { updatePlayerStats } from '../store/slices/gameSlice';

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const { availableActivities, currentActivity } = useAppSelector(
    (state) => state.activities
  );
  const { player } = useAppSelector((state) => state.game);

  const handleStartActivity = (activityId: string) => {
    const activity = availableActivities.find((a) => a.id === activityId);
    if (!activity) return;

    // Check if player has enough energy
    if (player.energy < activity.energyCost) {
      alert('Not enough energy!');
      return;
    }

    // Check requirements
    if (activity.requirements) {
      if (activity.requirements.minAge && player.age < activity.requirements.minAge) {
        alert(`You need to be at least ${activity.requirements.minAge} years old!`);
        return;
      }
      if (activity.requirements.minMoney && player.money < activity.requirements.minMoney) {
        alert(`You need at least $${activity.requirements.minMoney}!`);
        return;
      }
    }

    // Update player stats
    dispatch(
      updatePlayerStats({
        energy: Math.max(0, player.energy - activity.energyCost),
        happiness: Math.min(100, player.happiness + (activity.effects?.happiness || 0)),
        health: Math.min(100, player.health + (activity.effects?.health || 0)),
        money: player.money + (activity.effects?.money || 0),
      })
    );

    // Start the activity
    dispatch(startActivity(activityId));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Activities</Text>
      <Text style={styles.subtitle}>Choose what to do today</Text>

      {currentActivity ? (
        <View style={styles.currentActivity}>
          <Text style={styles.currentActivityText}>
            Currently: {availableActivities.find(a => a.id === currentActivity)?.name}
          </Text>
        </View>
      ) : null}

      <View style={styles.activitiesContainer}>
        {availableActivities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              !activity.unlocked && styles.lockedActivity,
              currentActivity === activity.id && styles.activeActivity,
            ]}
            onPress={() => handleStartActivity(activity.id)}
            disabled={!activity.unlocked || !!currentActivity}
          >
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            
            <View style={styles.activityStats}>
              {activity.energyCost > 0 && (
                <Text style={styles.statText}>Energy: -{activity.energyCost}</Text>
              )}
              {activity.energyCost < 0 && (
                <Text style={styles.positiveStatText}>
                  Energy: +{Math.abs(activity.energyCost)}
                </Text>
              )}
              {activity.effects?.money !== undefined && (
                <Text style={activity.effects.money >= 0 ? styles.positiveStatText : styles.statText}>
                  {activity.effects.money >= 0 ? '+' : ''}{activity.effects.money}$
                </Text>
              )}
              {activity.effects?.health !== undefined && (
                <Text style={activity.effects.health >= 0 ? styles.positiveStatText : styles.statText}>
                  Health: {activity.effects.health >= 0 ? '+' : ''}{activity.effects.health}
                </Text>
              )}
              {activity.effects?.happiness !== undefined && (
                <Text style={activity.effects.happiness >= 0 ? styles.positiveStatText : styles.statText}>
                  Happiness: {activity.effects.happiness >= 0 ? '+' : ''}{activity.effects.happiness}
                </Text>
              )}
            </View>
            
            {!activity.unlocked && (
              <Text style={styles.lockedText}>Locked</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  currentActivity: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#2196f3',
  },
  currentActivityText: {
    fontSize: 16,
    color: '#0d47a1',
    fontWeight: '500',
  },
  activitiesContainer: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedActivity: {
    opacity: 0.6,
  },
  activeActivity: {
    borderColor: '#4caf50',
    borderWidth: 2,
  },
  activityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  activityStats: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statText: {
    color: '#e53935',
    marginBottom: 3,
  },
  positiveStatText: {
    color: '#2e7d32',
    marginBottom: 3,
  },
  lockedText: {
    marginTop: 10,
    color: '#f57c00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActivitiesScreen;
