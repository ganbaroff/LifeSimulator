// 🎨 Modal Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 3.0.0 - Updated Theme Structure

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom' | 'top';
  animationType?: 'fade' | 'slide' | 'scale';
  showCloseButton?: boolean;
  backdropClosable?: boolean;
  scrollable?: boolean;
  testID?: string;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  animationType = 'fade',
  showCloseButton = true,
  backdropClosable = true,
  scrollable = false,
  testID,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      switch (animationType) {
        case 'fade':
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          break;
        case 'slide':
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start();
          break;
        case 'scale':
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start();
          break;
      }
    } else {
      // Hide animation
      switch (animationType) {
        case 'fade':
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          break;
        case 'slide':
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start();
          break;
        case 'scale':
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
          ]).start();
          break;
      }
    }
  }, [visible, animationType, fadeAnim, slideAnim, scaleAnim]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: SCREEN_WIDTH * 0.8 };
      case 'md':
        return { width: SCREEN_WIDTH * 0.9 };
      case 'lg':
        return { width: SCREEN_WIDTH * 0.95 };
      case 'full':
        return { width: SCREEN_WIDTH * 0.98 };
      default:
        return { width: SCREEN_WIDTH * 0.9 };
    }
  };

  const getPositionStyles = () => {
    const baseStyle = getSizeStyles();
    
    switch (position) {
      case 'bottom':
        return {
          ...baseStyle,
          position: 'absolute',
          bottom: 0,
          maxHeight: SCREEN_HEIGHT * 0.8,
        };
      case 'top':
        return {
          ...baseStyle,
          position: 'absolute',
          top: 50,
          maxHeight: SCREEN_HEIGHT * 0.6,
        };
      case 'center':
      default:
        return {
          ...baseStyle,
          maxHeight: SCREEN_HEIGHT * 0.8,
        };
    }
  };

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'slide':
        return {
          transform: [
            { translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [position === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT, 0],
            }) }
          ],
        };
      case 'scale':
        return {
          transform: [{ scale: scaleAnim }],
        };
      default:
        return {};
    }
  };

  if (!visible) return null;

  const Content = scrollable ? ScrollView : View;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={backdropClosable ? onClose : undefined}
        />
      </Animated.View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          style={[
            styles.modal,
            getPositionStyles(),
            getAnimationStyle(),
            { 
              opacity: fadeAnim,
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
            } as any
          ]}
          testID={testID}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={[
              styles.header,
              {
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                borderBottomColor: theme.colors.border.primary,
              } as any
            ]}>
              {title && (
                <Text style={[
                  styles.title,
                  {
                    ...theme.typography.h3,
                    color: theme.colors.text.primary,
                  } as any
                ]}>{title}</Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: theme.colors.background.secondary,
                    } as any
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.closeButtonText,
                    {
                      ...theme.typography.body1,
                      color: theme.colors.text.secondary,
                    } as any
                  ]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Content */}
          <Content 
            style={[
              styles.content,
              { padding: theme.spacing.lg } as any
            ]}
            showsVerticalScrollIndicator={scrollable}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </Content>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {},
});

export default Modal;
