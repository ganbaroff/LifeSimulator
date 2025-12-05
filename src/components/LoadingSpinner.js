// LoadingSpinner.js - Анимированный индикатор загрузки
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const LoadingSpinner = ({ size = 'large', color = '#60a5fa' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default LoadingSpinner;
