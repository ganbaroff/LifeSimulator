// 🎨 Input Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 3.0.0 - Updated Theme Structure

import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  floatingLabel?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: ViewStyle;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  status = 'default',
  animated = true,
  floatingLabel = false,
  clearable = false,
  onClear,
  containerStyle,
  testID,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedLabelY = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (animated && floatingLabel && label) {
      Animated.timing(animatedLabelY, {
        toValue: (isFocused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animated, floatingLabel, label, animatedLabelY]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.push(styles.inputSm);
        break;
      case 'lg':
        baseStyle.push(styles.inputLg);
        break;
      default:
        baseStyle.push(styles.inputMd);
    }

    // Variant styles
    switch (variant) {
      case 'outlined':
        baseStyle.push(styles.inputOutlined);
        break;
      case 'filled':
        baseStyle.push(styles.inputFilled);
        break;
      default:
        baseStyle.push(styles.inputDefault);
    }

    // Status styles
    if (error || status === 'error') {
      baseStyle.push(styles.inputError);
    } else if (status === 'success') {
      baseStyle.push(styles.inputSuccess);
    } else if (status === 'warning') {
      baseStyle.push(styles.inputWarning);
    } else if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }

    return baseStyle;
  };

  const getLabelStyle = () => {
    if (!floatingLabel) {
      return [styles.label, { 
        fontSize: theme.typography.body1.fontSize, 
        color: theme.colors.text.primary, 
        marginBottom: theme.spacing.xs,
        fontWeight: '600' as const,
      }];
    }

    const labelStyle = [styles.floatingLabel, { 
      fontSize: theme.typography.body1.fontSize, 
      backgroundColor: theme.colors.background.card, 
      paddingHorizontal: 4,
      fontWeight: '500' as const,
    }];

    if (animated) {
      labelStyle.push({
        transform: [
          {
            translateY: animatedLabelY.interpolate({
              inputRange: [0, 1],
              outputRange: [12, -8],
            }),
          },
          {
            scale: animatedLabelY.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.85],
            }),
          },
        ],
      } as any);
    } else {
      labelStyle.push({
        transform: [
          { translateY: (isFocused || value) ? -8 : 12 },
          { scale: (isFocused || value) ? 0.85 : 1 },
        ],
      } as any);
    }

    return labelStyle;
  };

  const getInputBorderColor = () => {
    if (error || status === 'error') return theme.colors.danger;
    if (status === 'success') return theme.colors.success;
    if (status === 'warning') return theme.colors.warning;
    return theme.colors.primary;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Animated.Text
          style={[
            getLabelStyle(),
            {
              color: getInputBorderColor(),
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}

      {/* Input Container */}
      <View style={styles.inputContainer}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={[styles.leftIcon, { left: theme.spacing.md }]}>
            {leftIcon}
          </View>
        )}

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={[
            getInputStyle(),
            {
              fontSize: theme.typography.body1.fontSize,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.background.card,
              borderColor: getInputBorderColor(),
              color: theme.colors.text.primary,
              ...(leftIcon && { paddingLeft: 48 }),
              ...(rightIcon || clearable || textInputProps.secureTextEntry ? { paddingRight: 48 } : {}),
            } as any
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={textInputProps.secureTextEntry && !showPassword}
          placeholderTextColor={theme.colors.text.tertiary}
          selectionColor={getInputBorderColor()}
          testID={testID}
          {...textInputProps}
        />

        {/* Right Icons */}
        <View style={[styles.rightIcon, { right: theme.spacing.md }]}>
          {/* Clear Button */}
          {clearable && value && (
            <TouchableOpacity
              style={[styles.iconButton, { padding: theme.spacing.xs }]}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearIcon, { color: theme.colors.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          )}

          {/* Password Toggle */}
          {textInputProps.secureTextEntry && (
            <TouchableOpacity
              style={[styles.iconButton, { padding: theme.spacing.xs }]}
              onPress={togglePassword}
              activeOpacity={0.7}
            >
              <Text style={styles.passwordIcon}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Custom Right Icon */}
          {rightIcon && !clearable && !textInputProps.secureTextEntry && (
            <View style={styles.customIcon}>
              {rightIcon}
            </View>
          )}
        </View>
      </View>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          { 
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
            color: error ? theme.colors.danger : theme.colors.text.secondary,
            fontWeight: '400' as const,
          } as any
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '500',
    marginBottom: 4,
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 1,
    paddingHorizontal: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
  },
  inputSm: {
    fontSize: 14,
    borderWidth: 1,
  },
  inputMd: {
    fontSize: 16,
    borderWidth: 1,
  },
  inputLg: {
    fontSize: 18,
    borderWidth: 1,
  },
  inputDefault: {
    borderWidth: 1,
  },
  inputOutlined: {
    borderWidth: 1,
  },
  inputFilled: {
    borderWidth: 1,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderWidth: 2,
  },
  inputSuccess: {
    borderWidth: 2,
  },
  inputWarning: {
    borderWidth: 2,
  },
  leftIcon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {},
  clearIcon: {
    fontSize: 16,
  },
  passwordIcon: {
    fontSize: 16,
  },
  customIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {},
});

export default Input;
