// Экран создания персонажа по Agile методологии - Sprint 2 Final
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import CharacterCreationWizard from '../components/forms/CharacterCreationWizard';

const CharacterCreationScreenAgile: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <CharacterCreationWizard />
    </SafeAreaView>
  );
};

export default CharacterCreationScreenAgile;
