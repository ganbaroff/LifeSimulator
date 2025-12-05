// 🎨 Card Component - Design System
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();
  const getCardStyle = (): ViewStyle => {
    const baseStyle = {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    };

    const variantStyles = {
      default: {},
      elevated: theme.shadows.md,
      outlined: {
        borderWidth: 2,
        borderColor: theme.colors.border.secondary,
      },
    };

    const paddingStyles = {
      sm: { padding: theme.spacing.md },
      md: { padding: theme.spacing.lg },
      lg: { padding: theme.spacing.xl },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...style,
    };
  };

  const titleStyle: TextStyle = {
    ...theme.typography.h3,
    marginBottom: subtitle ? theme.spacing.sm : theme.spacing.md,
  };

  const subtitleStyle: TextStyle = {
    ...theme.typography.body1,
    marginBottom: theme.spacing.md,
  };

  return (
    <View style={getCardStyle()}>
      {title && (
        <Text style={titleStyle}>{title}</Text>
      )}
      {subtitle && (
        <Text style={subtitleStyle}>{subtitle}</Text>
      )}
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};

export default Card;
