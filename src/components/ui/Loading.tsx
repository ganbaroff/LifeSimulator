// 🔄 Loading Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface LoadingProps {
  size?: 'small' | 'large' | 'extra-large';
  color?: string;
  message?: string;
  overlay?: boolean;
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  message,
  overlay = false,
  fullscreen = false,
}) => {
  const { theme } = useTheme();
  const defaultColor = color || theme.colors.primary;

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 20, height: 20 };
      case 'large':
        return { width: 40, height: 40 };
      case 'extra-large':
        return { width: 60, height: 60 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const getContainerStyle = () => {
    if (fullscreen) {
      return [
        styles.fullscreenContainer,
        { backgroundColor: theme.colors.background.primary }
      ];
    }
    if (overlay) {
      return styles.overlayContainer;
    }
    return [
      styles.container,
      { padding: theme.spacing.md }
    ];
  };

  return (
    <View style={getContainerStyle()}>
      <ActivityIndicator
        size={size === 'extra-large' ? 'large' : size}
        color={defaultColor}
        style={getSizeStyle()}
      />
      {message && (
        <Text style={[
          styles.message,
          {
            ...theme.typography.body1,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.md,
          }
        ]}>{message}</Text>
      )}
    </View>
  );
};

// Spinner component (alternative loading indicator)
export const Spinner: React.FC<{
  size?: number;
  color?: string;
  thickness?: number;
}> = ({
  size = 24,
  color,
  thickness = 2
}) => {
    const { theme } = useTheme();
    const defaultColor = color || theme.colors.primary;

    return (
      <View style={[styles.spinner, { width: size, height: size }]}>
        <ActivityIndicator
          size="small"
          color={defaultColor}
          style={{ transform: [{ scale: size / 20 }] }}
        />
      </View>
    );
  };

// Pulse loading component
export const PulseLoading: React.FC<{
  size?: number;
  color?: string;
  count?: number;
}> = ({
  size = 8,
  color,
  count = 3
}) => {
    const { theme } = useTheme();
    const defaultColor = color || theme.colors.primary;

    return (
      <View style={[
        styles.pulseContainer,
        { gap: theme.spacing.xs }
      ]}>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pulseDot,
              {
                width: size,
                height: size,
                backgroundColor: defaultColor,
                opacity: 0.3 + (index * 0.2),
              },
            ]}
          />
        ))}
      </View>
    );
  };

// Skeleton loading component
export const Skeleton: React.FC<{
  width?: number | string;
  height?: number;
  variant?: 'rectangular' | 'circular';
  style?: any;
}> = ({
  width = '100%',
  height = 20,
  variant = 'rectangular',
  style
}) => {
    const { theme } = useTheme();

    const skeletonStyle = [
      styles.skeleton,
      {
        width,
        height,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: variant === 'circular' ? height / 2 : theme.borderRadius.sm,
      },
      style,
    ];

    return <View style={skeletonStyle} />;
  };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    textAlign: 'center',
  },

  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pulseDot: {
    borderRadius: 9999,
  },

  skeleton: {
    backgroundColor: '#f0f0f0',
  },
});

export default Loading;
