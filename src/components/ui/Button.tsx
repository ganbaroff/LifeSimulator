// 🎨 Button Component - Design System
// Создано: Designer (Agile Team)
// Версия: 3.0.0 - Updated Theme Structure

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      danger: {
        backgroundColor: theme.colors.danger,
        borderWidth: 0,
      },
    };

    const sizeStyles = {
      sm: { 
        paddingVertical: theme.spacing.sm, 
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
      },
      md: { 
        paddingVertical: theme.spacing.md, 
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
      },
      lg: { 
        paddingVertical: theme.spacing.lg, 
        paddingHorizontal: theme.spacing.xxl,
        borderRadius: theme.borderRadius.lg,
      },
    };
    
    return {
      ...baseStyles[variant],
      ...sizeStyles[size],
      opacity: disabled ? 0.5 : 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...(disabled && { backgroundColor: theme.colors.background.tertiary }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = {
      ...theme.typography.body1,
      fontWeight: '600' as const,
      color: variant === 'secondary' ? theme.colors.primary : theme.colors.text.inverse,
    };
    
    const sizeTextStyles = {
      sm: { fontSize: theme.typography.caption.fontSize },
      md: { fontSize: theme.typography.body1.fontSize },
      lg: { fontSize: theme.typography.h5.fontSize },
    };
    
    return { ...baseTextStyle, ...sizeTextStyles[size], ...textStyle };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {loading ? 'Загрузка...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
