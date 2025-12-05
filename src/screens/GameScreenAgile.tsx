// Главный игровой экран по Agile методологии - Sprint 3 Final Integration
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import GameScreenAgile from '../components/game/GameScreenAgile';

const GameScreenAgileMain: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <GameScreenAgile />
    </SafeAreaView>
  );
};

export default GameScreenAgileMain;
