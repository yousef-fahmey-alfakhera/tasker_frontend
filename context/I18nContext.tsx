'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { STORAGE_KEYS } from '@/lib/config';
import { SupportedLanguage, TranslationKey, translate } from '@/lib/i18n';
import settingsService from '@/lib/services/settings.service';
import { useAuth } from './AuthContext';

interface I18nContextType {
  language: SupportedLanguage;
  isRtl: boolean;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Apply html lang and dir attributes
  const applyDirection = useCallback((lang: SupportedLanguage) => {
    if (typeof document !== 'undefined') {
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', dir);
      if (lang === 'ar') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, []);

  // Initialize language on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as SupportedLanguage | null;
      if (storedLang === 'ar' || storedLang === 'en') {
        setLanguageState(storedLang);
        applyDirection(storedLang);
      } else {
        applyDirection('en');
      }
    }
  }, [applyDirection]);

  // Sync with authenticated user settings from backend
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    async function syncBackendLanguage() {
      try {
        const res = await settingsService.getUserSettings();
        if (res.success && Array.isArray(res.data)) {
          const langSetting = res.data.find(
            (s) => s.setting_name === 'language' || s.setting?.name === 'language'
          );
          if (langSetting && (langSetting.value === 'ar' || langSetting.value === 'en')) {
            if (isMounted) {
              const backendLang = langSetting.value as SupportedLanguage;
              setLanguageState(backendLang);
              localStorage.setItem(STORAGE_KEYS.LANGUAGE, backendLang);
              applyDirection(backendLang);
            }
          }
        }
      } catch {
        // Ignore setting fetch failure
      }
    }

    syncBackendLanguage();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, applyDirection]);

  // Public method to update language
  const setLanguage = async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
    applyDirection(newLang);

    // Save to user settings if authenticated
    if (isAuthenticated) {
      try {
        // Find setting_id for 'language'
        const sysSettingsRes = await settingsService.getSettings();
        const langDef = sysSettingsRes.data?.find((s) => s.name === 'language');
        if (langDef) {
          await settingsService.saveUserSetting({
            setting_id: langDef.id,
            value: newLang,
          });
        }
      } catch (err) {
        console.error('Failed to persist user language setting to backend:', err);
      }
    }
  };

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      return translate(language, key, params);
    },
    [language]
  );

  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider
      value={{
        language,
        isRtl,
        dir,
        setLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
