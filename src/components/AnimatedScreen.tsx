// Компонент для анимированных экранов
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface AnimatedScreenProps {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideIn' | 'scaleIn';
  duration?: number;
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
  children,
  animationType = 'fadeIn',
  duration = 500
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    switch (animationType) {
      case 'fadeIn':
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }).start();
        break;
      case 'slideIn':
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'scaleIn':
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ]).start();
        break;
    }
  }, [animationType, duration, fadeAnim, slideAnim, scaleAnim]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fadeIn':
        return { opacity: fadeAnim };
      case 'slideIn':
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        };
      case 'scaleIn':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
