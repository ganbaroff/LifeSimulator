// 👤 Avatar Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  variant?: 'circle' | 'rounded' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  showStatus?: boolean;
  fallback?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: any;
  testID?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  variant = 'circle',
  status,
  showStatus = false,
  fallback,
  backgroundColor,
  textColor,
  borderColor,
  borderWidth = 0,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          width: 24,
          height: 24,
          fontSize: theme.typography.caption.fontSize,
          borderRadius: variant === 'circle' ? 12 : variant === 'rounded' ? 4 : 0,
        };
      case 'sm':
        return {
          width: 32,
          height: 32,
          fontSize: theme.typography.caption.fontSize,
          borderRadius: variant === 'circle' ? 16 : variant === 'rounded' ? 6 : 0,
        };
      case 'md':
        return {
          width: 48,
          height: 48,
          fontSize: theme.typography.body1.fontSize,
          borderRadius: variant === 'circle' ? 24 : variant === 'rounded' ? 8 : 0,
        };
      case 'lg':
        return {
          width: 64,
          height: 64,
          fontSize: theme.typography.h5.fontSize,
          borderRadius: variant === 'circle' ? 32 : variant === 'rounded' ? 12 : 0,
        };
      case 'xl':
        return {
          width: 96,
          height: 96,
          fontSize: theme.typography.h3.fontSize,
          borderRadius: variant === 'circle' ? 48 : variant === 'rounded' ? 16 : 0,
        };
      case 'xxl':
        return {
          width: 128,
          height: 128,
          fontSize: theme.typography.h2.fontSize,
          borderRadius: variant === 'circle' ? 64 : variant === 'rounded' ? 20 : 0,
        };
      default:
        return {
          width: 48,
          height: 48,
          fontSize: theme.typography.body1.fontSize,
          borderRadius: variant === 'circle' ? 24 : variant === 'rounded' ? 8 : 0,
        };
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'xs':
        return 8;
      case 'sm':
        return 10;
      case 'md':
        return 12;
      case 'lg':
        return 16;
      case 'xl':
        return 20;
      case 'xxl':
        return 24;
      default:
        return 12;
    }
  };

  const getStatusColor = () => {
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

  const getInitials = (name?: string): string => {
    if (!name) return fallback || '?';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name?: string): string => {
    if (backgroundColor) return backgroundColor;

    if (!name) return theme.colors.background.secondary;

    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.danger,
      theme.colors.info,
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const sizeStyles = getSizeStyles();
  const statusSize = getStatusSize();
  const statusColor = getStatusColor();
  const avatarColor = getAvatarColor(name);
  const initials = getInitials(name);

  const avatarStyle = [
    styles.avatar,
    sizeStyles,
    {
      backgroundColor: avatarColor,
      borderColor: borderColor || theme.colors.border.primary,
      borderWidth,
    },
    style,
  ];

  const textStyle = [
    styles.avatarText,
    {
      fontSize: sizeStyles.fontSize,
      color: textColor || '#ffffff',
    },
  ];

  const statusStyle = [
    styles.statusIndicator,
    {
      width: statusSize,
      height: statusSize,
      borderRadius: statusSize / 2,
      backgroundColor: statusColor,
      borderWidth: 2,
      borderColor: theme.colors.background.primary, // Border to create ring effect
    },
    variant === 'circle' && {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
    },
  ] as any;

  return (
    <View style={styles.container} testID={testID}>
      <View style={avatarStyle}>
        {source ? (
          <Image
            source={source}
            style={[styles.avatarImage, sizeStyles]}
            resizeMode="cover"
          />
        ) : (
          <Text style={textStyle}>{initials}</Text>
        )}
      </View>

      {showStatus && status && (
        <View style={statusStyle} />
      )}
    </View>
  );
};

// Avatar Group - for showing multiple avatars
export interface AvatarGroupProps {
  avatars: Array<{
    source?: { uri: string } | number;
    name?: string;
    key?: string;
  }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  max?: number;
  spacing?: number;
  style?: any;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 5,
  spacing = -8,
  style,
}) => {
  const { theme } = useTheme();
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const getSizeStyle = () => {
    switch (size) {
      case 'xs': return { width: 24, height: 24, borderRadius: 12 };
      case 'sm': return { width: 32, height: 32, borderRadius: 16 };
      case 'md': return { width: 40, height: 40, borderRadius: 20 };
      case 'lg': return { width: 64, height: 64, borderRadius: 32 };
      case 'xl': return { width: 96, height: 96, borderRadius: 48 };
      default: return { width: 40, height: 40, borderRadius: 20 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'xs': return 10;
      case 'sm': return 12;
      case 'md': return 14;
      case 'lg': return 16;
      case 'xl': return 20;
      default: return 14;
    }
  };

  return (
    <View style={[styles.avatarGroup, style]}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.key || index}
          source={avatar.source}
          name={avatar.name}
          size={size}
          style={{
            marginLeft: index === 0 ? 0 : spacing,
            zIndex: visibleAvatars.length - index,
          }}
        />
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            styles.moreAvatars,
            {
              marginLeft: spacing,
              zIndex: 0,
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.background.primary,
              borderWidth: 2,
            },
            getSizeStyle(),
          ] as any}
        >
          <Text
            style={[
              styles.moreAvatarsText,
              {
                color: theme.colors.text.primary,
                fontSize: getTextSize(),
                fontWeight: '600',
              } as any,
            ]}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  avatarText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  statusIndicator: {
    position: 'absolute',
  },

  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  moreAvatars: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  moreAvatarsText: {
    fontWeight: '600',
  },
});

export default Avatar;
