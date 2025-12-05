// 🏷️ Badge/Chip Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
  outline?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  rounded = true,
  outline = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.primary,
          borderColor: theme.colors.primary,
          textColor: outline ? theme.colors.primary : '#ffffff',
        };
      case 'secondary':
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.background.card,
          borderColor: theme.colors.border.primary,
          textColor: theme.colors.text.secondary,
        };
      case 'success':
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.success,
          borderColor: theme.colors.success,
          textColor: outline ? theme.colors.success : '#ffffff',
        };
      case 'warning':
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.warning,
          borderColor: theme.colors.warning,
          textColor: outline ? theme.colors.warning : '#ffffff',
        };
      case 'error':
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.danger,
          borderColor: theme.colors.danger,
          textColor: outline ? theme.colors.danger : '#ffffff',
        };
      case 'info':
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.info,
          borderColor: theme.colors.info,
          textColor: outline ? theme.colors.info : '#ffffff',
        };
      case 'default':
      default:
        return {
          backgroundColor: outline ? 'transparent' : theme.colors.background.secondary,
          borderColor: theme.colors.border.primary,
          textColor: theme.colors.text.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: rounded ? theme.borderRadius.full : theme.borderRadius.sm,
        };
      case 'medium':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: rounded ? theme.borderRadius.full : theme.borderRadius.md,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: rounded ? theme.borderRadius.full : theme.borderRadius.lg,
        };
      default:
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: rounded ? theme.borderRadius.full : theme.borderRadius.md,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.caption;
      case 'large':
        return theme.typography.h5;
      case 'medium':
      default:
        return theme.typography.body1;
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();

  const badgeStyle = [
    styles.badge,
    {
      backgroundColor: disabled ? theme.colors.text.disabled : colors.backgroundColor,
      borderColor: disabled ? theme.colors.text.disabled : colors.borderColor,
      borderWidth: outline ? 1 : 0,
    },
    sizeStyles,
    disabled && styles.disabled,
    style,
  ];

  const badgeTextStyle = [
    textSize,
    {
      color: disabled ? theme.colors.text.disabled : colors.textColor,
      fontWeight: '600',
      textAlign: 'center',
    },
    textStyle,
  ];

  const BadgeComponent = (
    <View style={badgeStyle} testID={testID}>
      <Text style={badgeTextStyle}>{children}</Text>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} style={badgeStyle} testID={testID}>
        <Text style={badgeTextStyle}>{children}</Text>
      </TouchableOpacity>
    );
  }

  return BadgeComponent;
};

// Status Badge - specialized badge for status indicators
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  showText?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showText = true,
  text,
  size = 'medium',
  style,
}) => {
  const { theme } = useTheme();
  const getStatusColors = () => {
    switch (status) {
      case 'online':
        return theme.colors.success;
      case 'offline':
        return theme.colors.text.secondary;
      case 'away':
        return theme.colors.warning;
      case 'busy':
        return theme.colors.danger;
      case 'invisible':
        return theme.colors.text.disabled;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = () => {
    if (text) return text;
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'invisible':
        return 'Invisible';
      default:
        return 'Unknown';
    }
  };

  const getDotSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 12;
      case 'medium':
      default:
        return 10;
    }
  };

  const dotSize = getDotSize();
  const color = getStatusColors();

  return (
    <View style={[styles.statusBadge, style]}>
      <View
        style={[
          styles.statusDot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
          },
        ]}
      />
      {showText && (
        <Text style={[styles.statusText, { color }]}>
          {getStatusText()}
        </Text>
      )}
    </View>
  );
};

// Count Badge - for notifications and counts
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'error';
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  variant = 'error',
  size = 'small',
  style,
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count === 0) return null;

  return (
    <Badge
      variant={variant}
      size={size}
      style={[styles.countBadge, style]}
    >
      {displayCount}
    </Badge>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    minWidth: 20,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statusDot: {
    borderRadius: 9999,
  },
  
  statusText: {
    fontWeight: '500',
    fontSize: 12,
  },
  
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    minHeight: 20,
  },
});

export default Badge;
