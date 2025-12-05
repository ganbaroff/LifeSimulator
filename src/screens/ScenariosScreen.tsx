import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScenarioCard from '../components/ScenarioCard';
import { useScenario, defaultScenarios } from '../context/ScenarioContext';

type RootStackParamList = {
  Game: undefined;
  Scenarios: undefined;
  Main: undefined;
};

type ScenariosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scenarios'>;

const ScenariosScreen: React.FC = () => {
  const navigation = useNavigation<ScenariosScreenNavigationProp>();
  const { selectScenario } = useScenario();

  const handleScenarioSelect = (scenario: typeof defaultScenarios[number]) => {
    console.log('Selected scenario:', scenario.id);
    selectScenario(scenario);
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Выберите сценарий</Text>
        <Text style={styles.subtitle}>Какую жизнь вы хотите прожить?</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {defaultScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            title={scenario.title}
            description={scenario.description}
            difficulty={scenario.difficulty}
            onPress={() => handleScenarioSelect(scenario)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#121212',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
});

export default ScenariosScreen;
