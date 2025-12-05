// 🎨 Theme Switcher - Life Simulator Azerbaijan
// Создано: Designer (Agile Team)
// Версия: 3.0.0

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from './ThemeProvider';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';

interface ThemeSwitcherProps {
  variant?: 'toggle' | 'selector' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'toggle',
  size = 'md',
  showLabel = true,
  disabled = false,
}) => {
  const { mode, toggleTheme, theme, isDark, isLight } = useTheme();

  const renderToggleVariant = () => {
    const toggleWidth = size === 'sm' ? 60 : size === 'md' ? 80 : 100;
    const toggleHeight = size === 'sm' ? 30 : size === 'md' ? 40 : 50;
    const thumbSize = size === 'sm' ? 24 : size === 'md' ? 32 : 40;

    return (
      <View style={styles.toggleContainer}>
        {showLabel && (
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Theme
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.toggle,
            {
              backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.background.tertiary,
              width: toggleWidth,
              height: toggleHeight,
              borderColor: theme.colors.border.primary,
            } as any,
            disabled && styles.disabled,
          ]}
          onPress={toggleTheme}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: isDark ? theme.colors.primary : theme.colors.secondary,
                width: thumbSize,
                height: thumbSize,
                transform: [{ translateX: isDark ? 0 : toggleWidth - thumbSize - 4 }],
              },
            ]}
          >
            <Text style={[styles.toggleIcon, { fontSize: size === 'sm' ? 12 : 16 }]}>
              {isDark ? '🌙' : '☀️'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSelectorVariant = () => {
    return (
      <Card style={[styles.selectorContainer, { backgroundColor: theme.colors.background.card }] as any}>
        {showLabel && (
          <Text style={[styles.label, { color: theme.colors.text.secondary }] as any}>
            Select Theme
          </Text>
        )}
        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: isDark ? theme.colors.primary : theme.colors.background.tertiary,
                borderColor: isDark ? theme.colors.primary : theme.colors.border.primary,
              } as any,
            ]}
            onPress={() => toggleTheme()}
            disabled={disabled}
          >
            <Text style={[styles.themeIcon, { fontSize: 24 }]}>🌙</Text>
            <Text style={[
              styles.themeName,
              {
                color: isDark ? theme.colors.text.inverse : theme.colors.text.primary,
              } as any
            ]}>
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: isLight ? theme.colors.secondary : theme.colors.background.tertiary,
                borderColor: isLight ? theme.colors.secondary : theme.colors.border.primary,
              } as any,
            ]}
            onPress={() => toggleTheme()}
            disabled={disabled}
          >
            <Text style={[styles.themeIcon, { fontSize: 24 }]}>☀️</Text>
            <Text style={[
              styles.themeName,
              {
                color: isLight ? theme.colors.text.inverse : theme.colors.text.primary,
              } as any
            ]}>
              Light
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderCompactVariant = () => {
    return (
      <TouchableOpacity
        style={[
          styles.compactButton,
          {
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
          } as any,
          disabled && styles.disabled,
        ]}
        onPress={toggleTheme}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Avatar
          size={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'}
          fallback={isDark ? '🌙' : '☀️'}
          style={styles.compactAvatar}
        />
        {showLabel && (
          <Text style={[styles.compactLabel, { color: theme.colors.text.secondary }] as any}>
            {isDark ? 'Dark' : 'Light'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (variant === 'selector') {
    return renderSelectorVariant();
  }

  if (variant === 'compact') {
    return renderCompactVariant();
  }

  return renderToggleVariant();
};

// Animated Theme Switcher Component
export const AnimatedThemeSwitcher: React.FC<Omit<ThemeSwitcherProps, 'variant'>> = (props) => {
  const { mode, theme, isDark } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(isDark ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background.secondary, theme.colors.background.tertiary],
  });

  const thumbColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.primary, theme.colors.secondary],
  });

  return (
    <View style={styles.toggleContainer}>
      {props.showLabel && (
        <Text style={[styles.label, { color: theme.colors.text.secondary }] as any}>
          Theme
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.toggle,
          {
            backgroundColor: backgroundColor as any,
            width: 80,
            height: 40,
            borderColor: theme.colors.border.primary,
          },
          props.disabled && styles.disabled,
        ]}
        onPress={() => {
          const { toggleTheme } = useTheme();
          toggleTheme();
        }}
        disabled={props.disabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: thumbColor as any,
              width: 32,
              height: 32,
              transform: [{ translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 44],
              }) }],
            },
          ]}
        >
          <Text style={[styles.toggleIcon, { fontSize: 16 }]}>
            {isDark ? '🌙' : '☀️'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleIcon: {
    color: '#ffffff',
  },
  disabled: {
    opacity: 0.5,
  },
  selectorContainer: {
    padding: 16,
    gap: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  themeIcon: {
    lineHeight: 24,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  compactAvatar: {
    backgroundColor: 'transparent',
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeSwitcher;
