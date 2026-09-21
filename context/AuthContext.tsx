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
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  activeApiUrl: string;
  hasPermission: (name: string) => boolean;
  canCreateTask: boolean;
  canUpdateTask: boolean;
  canDeleteTask: boolean;
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
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeApiUrl, setActiveApiUrlState] = useState<string>('');

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await authService.getPermissions();
      if (res.success && Array.isArray(res.data)) {
        const permNames = res.data.map((p) => p.name);
        setPermissions(permNames);
        localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permNames));
        return permNames;
      }
    } catch {
      // Ignore or user might have empty permissions
    }
    return [];
  }, []);

  // Synchronize state with localStorage and fetch profile if token exists
  const initAuth = useCallback(async () => {
    try {
      setActiveApiUrlState(getApiBaseUrl());
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedPerms = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);

      if (storedPerms) {
        try {
          setPermissions(JSON.parse(storedPerms));
        } catch {
          // ignore parse error
        }
      }

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse failure
          }
        }
        // Fetch fresh profile and permissions from backend
        try {
          const [profileRes] = await Promise.allSettled([
            authService.getProfile(),
            fetchPermissions(),
          ]);
          if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
            setUser(profileRes.value.data);
            localStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(profileRes.value.data)
            );
          }
        } catch {
          // Token may be invalid/expired, will be handled by 401 interceptor
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchPermissions]);

  useEffect(() => {
    initAuth();

    // Listen for unauthorized 401 events
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setPermissions([]);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
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
      await fetchPermissions();
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
      await fetchPermissions();
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
      setPermissions([]);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
    }
  };

  const refreshProfile = async () => {
    const [profileRes] = await Promise.allSettled([
      authService.getProfile(),
      fetchPermissions(),
    ]);
    if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
      setUser(profileRes.value.data);
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(profileRes.value.data)
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

  const hasPermission = useCallback(
    (name: string): boolean => {
      // If user is admin by role or email
      if (user?.roles?.includes('admin') || user?.email === 'admin@admin.com') {
        return true;
      }
      return permissions.includes(name);
    },
    [permissions, user]
  );

  const canCreateTask = hasPermission('create_tasks');
  const canUpdateTask = hasPermission('update_tasks');
  const canDeleteTask = hasPermission('delete_tasks');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        isAuthenticated: !!token && !!user,
        isLoading,
        activeApiUrl,
        hasPermission,
        canCreateTask,
        canUpdateTask,
        canDeleteTask,
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
