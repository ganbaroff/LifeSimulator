// 🎨 Theme Provider - Life Simulator Azerbaijan
// Создано: Designer (Agile Team)
// Версия: 3.0.0

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, ThemeContextType, createTheme } from '../../styles/DesignSystem';

const THEME_STORAGE_KEY = '@lifesimulator_theme';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'dark',
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);
  const [theme, setTheme] = useState<Theme>(createTheme(defaultTheme));
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme && (storedTheme === 'dark' || storedTheme === 'light')) {
          setMode(storedTheme);
          setTheme(createTheme(storedTheme));
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme to storage when it changes
  useEffect(() => {
    if (!isLoading) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
          console.error('Failed to save theme to storage:', error);
        }
      };

      saveTheme();
    }
  }, [mode, isLoading]);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    setTheme(createTheme(newMode));
  };

  const toggleTheme = () => {
    setThemeMode(mode === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    mode,
    setTheme: setThemeMode,
    toggleTheme,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };

  // Show loading state while theme is loading
  if (isLoading) {
    return null; // Or show a loading spinner
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Higher-order component for theme-aware components
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { theme } = useTheme();
    return <Component {...(props as P)} theme={theme} ref={ref} />;
  });
};

// Theme hook for specific theme values
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

export default ThemeProvider;
