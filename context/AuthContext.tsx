'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types/api';
import authService from '@/lib/services/auth.service';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  STORAGE_KEYS,
} from '@/lib/config';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeApiUrl: string;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  switchApiUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeApiUrl, setActiveApiUrlState] = useState<string>('');

  // Synchronize state with localStorage and fetch profile if token exists
  const initAuth = useCallback(async () => {
    try {
      setActiveApiUrlState(getApiBaseUrl());
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse failure
          }
        }
        // Fetch fresh profile from backend
        try {
          const profileRes = await authService.getProfile();
          if (profileRes.success && profileRes.data) {
            setUser(profileRes.data);
            localStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(profileRes.data)
            );
          }
        } catch {
          // Token may be invalid/expired, will be handled by 401 interceptor
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    // Listen for unauthorized 401 events
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    };

    const handleUrlChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setActiveApiUrlState(customEvent.detail || getApiBaseUrl());
    };

    window.addEventListener('tasker_unauthorized', handleUnauthorized);
    window.addEventListener('tasker_api_url_changed', handleUrlChanged);

    return () => {
      window.removeEventListener('tasker_unauthorized', handleUnauthorized);
      window.removeEventListener('tasker_api_url_changed', handleUrlChanged);
    };
  }, [initAuth]);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    if (response.success && response.data) {
      const userData = response.data;
      const accessToken = userData.token?.access_token;
      if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        setToken(accessToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    if (response.success && response.data) {
      const userData = response.data;
      const accessToken = userData.token?.access_token;
      if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        setToken(accessToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch {
      // Proceed with local cleanup regardless of network error
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const refreshProfile = async () => {
    const profileRes = await authService.getProfile();
    if (profileRes.success && profileRes.data) {
      setUser(profileRes.data);
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(profileRes.data)
      );
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const response = await authService.updateProfile(payload);
    if (response.success && response.data) {
      setUser(response.data);
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.data)
      );
    }
  };

  const switchApiUrl = (url: string) => {
    setApiBaseUrl(url);
    setActiveApiUrlState(url);
    // Reload state or refresh profile to test connectivity
    initAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        activeApiUrl,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        switchApiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
