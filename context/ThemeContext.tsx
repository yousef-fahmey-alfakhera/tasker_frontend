'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import settingsService from '@/lib/services/settings.service';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isLight: boolean;
  isDark: boolean;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'tasker_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply theme to DOM
  const applyThemeToDom = useCallback((mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.classList.add('light');
      body.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark');
      body.classList.remove('light');
    }
  }, []);

  // Fetch active theme preference from backend or localStorage
  const refreshTheme = useCallback(async () => {
    // 1. Check localStorage first for instant initial render
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (cached === 'light' || cached === 'dark') {
        setThemeModeState(cached);
        applyThemeToDom(cached);
      }
    }

    // 2. If authenticated, fetch source of truth from backend
    if (isAuthenticated) {
      try {
        const res = await settingsService.getTheme();
        if (res.success && res.data) {
          const fetchedMode: ThemeMode =
            res.data.theme_mode === 'dark' ? 'dark' : 'light';
          setThemeModeState(fetchedMode);
          applyThemeToDom(fetchedMode);
          if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, fetchedMode);
          }
        }
      } catch (err) {
        // Fall back to cached or default
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, applyThemeToDom]);

  useEffect(() => {
    refreshTheme();

    // Listen for custom theme change events
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setThemeModeState(customEvent.detail);
        applyThemeToDom(customEvent.detail);
      }
    };

    window.addEventListener('tasker_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('tasker_theme_changed', handleThemeChange);
    };
  }, [refreshTheme, applyThemeToDom]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyThemeToDom(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }

    if (isAuthenticated) {
      try {
        await settingsService.setTheme(mode);
      } catch (err) {
        console.error('Failed to sync theme preference to backend:', err);
      }
    }
  };

  const toggleTheme = async () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isLight: themeMode === 'light',
        isDark: themeMode === 'dark',
        isLoading,
        setThemeMode,
        toggleTheme,
        refreshTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
