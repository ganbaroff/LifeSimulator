// 🎨 ProgressBar Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'rounded' | 'pill';
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelFormat?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  status?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  color,
  backgroundColor,
  showLabel = false,
  labelFormat = '{value}%',
  animated = true,
  striped = false,
  indeterminate = false,
  status = 'default',
  style,
}) => {
  const { theme } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (indeterminate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(indeterminateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(indeterminateAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      indeterminateAnim.setValue(0);
      if (animated) {
        Animated.timing(animatedValue, {
          toValue: value / max,
          duration: 500,
          useNativeDriver: false,
        }).start();
      } else {
        animatedValue.setValue(value / max);
      }
    }
  }, [value, max, animated, indeterminate, animatedValue, indeterminateAnim]);

  const getProgressColor = () => {
    if (color) return color;

    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.danger;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };

  const getBackgroundColor = () => {
    return backgroundColor || theme.colors.background.secondary;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 4,
        };
      case 'lg':
        return {
          height: 12,
        };
      default:
        return {
          height: 8,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: getProgressColor(),
        };
      case 'rounded':
        return {
          borderRadius: theme.borderRadius.sm,
        };
      case 'pill':
        return {
          borderRadius: 50,
        };
      default:
        return {
          borderRadius: theme.borderRadius.sm,
        };
    }
  };

  const getProgressWidth = () => {
    if (indeterminate) {
      return indeterminateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      });
    }
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', `${(value / max) * 100}%`],
    });
  };

  const formatLabel = () => {
    return labelFormat
      .replace('{value}', Math.round(value).toString())
      .replace('{max}', max.toString())
      .replace('{percentage}', Math.round((value / max) * 100).toString());
  };

  const getStripePattern = () => {
    if (!striped) return {};

    return {
      backgroundImage: `linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      )`,
      backgroundSize: '20px 20px',
    };
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{formatLabel()}</Text>
        </View>
      )}

      {/* Progress Bar */}
      <View style={[
        styles.track,
        getSizeStyles(),
        getVariantStyles(),
        { backgroundColor: getBackgroundColor() }
      ]}>
        <Animated.View
          style={[
            styles.progress,
            getSizeStyles(),
            getVariantStyles(),
            {
              backgroundColor: getProgressColor(),
              width: getProgressWidth(),
              ...getStripePattern(),
            },
            indeterminate && styles.indeterminate,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    minWidth: 2,
  },
  indeterminate: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
});

export default ProgressBar;
