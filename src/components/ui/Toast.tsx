// 🔔 Toast Component - Enhanced UI
// Создано: Designer (Agile Team)
// Версия: 4.0.0 - Updated Theme Structure

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    text: string;
    onPress: () => void;
  };
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 4000,
  persistent = false,
  action,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss if not persistent
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          background: theme.colors.success,
          text: '#ffffff',
          border: theme.colors.success,
        };
      case 'error':
        return {
          background: theme.colors.danger,
          text: '#ffffff',
          border: theme.colors.danger,
        };
      case 'warning':
        return {
          background: theme.colors.warning,
          text: '#ffffff',
          border: theme.colors.warning,
        };
      case 'info':
      default:
        return {
          background: theme.colors.info,
          text: '#ffffff',
          border: theme.colors.info,
        };
    }
  };

  const colors = getToastColors();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <View style={styles.toastHeader}>
          <Text style={[styles.toastTitle, { color: colors.text }]}>
            {title}
          </Text>
          {!persistent && (
            <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {message && (
          <Text style={[styles.toastMessage, { color: colors.text }]}>
            {message}
          </Text>
        )}

        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            style={styles.actionButton}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Toast container for managing multiple toasts
export const ToastContainer: React.FC<{
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => toast.id && onDismiss(toast.id)}
        />
      ))}
    </View>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 6000 });
  };

  const showWarning = (title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  };

  return {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },

  toastContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  toastContent: {
    padding: 16,
  },

  toastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  closeButton: {
    padding: 4,
    marginLeft: 8,
  },

  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  toastMessage: {
    fontSize: 14,
    marginBottom: 8,
  },

  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Toast;
