'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import settingsService from '@/lib/services/settings.service';
import { Setting, UserSetting } from '@/types/api';
import { getErrorMessage } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Bell,
  Languages,
  Sliders,
  Sparkles,
  Save,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface MergedSetting {
  definition: Setting;
  userSetting?: UserSetting;
  currentValue: string;
  isCustomized: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isResetting: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const { themeMode, setThemeMode } = useTheme();
  const { activeApiUrl } = useAuth();
  const isLocal = activeApiUrl.includes('127.0.0.1') || activeApiUrl.includes('localhost');
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MergedSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadAllSettings = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      // 1. Fetch system settings definition and user settings overrides in parallel
      const [systemRes, userRes] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getUserSettings(),
      ]);

      const systemSettings = systemRes.data || [];
      const userSettings = userRes.data || [];

      // 2. Merge: use user override if exists, otherwise fallback to system default
      const merged: MergedSetting[] = systemSettings.map((def) => {
        const override = userSettings.find(
          (u) => u.setting_id === def.id || u.setting_name === def.name
        );
        const value = override ? override.value : def.default;
        return {
          definition: def,
          userSetting: override,
          currentValue: value,
          isCustomized: !!override,
          isDirty: false,
          isSaving: false,
          isResetting: false,
        };
      });

      setItems(merged);

      // Also ensure ThemeContext matches active theme setting
      const themeSetting = merged.find((i) => i.definition.name === 'theme_mode');
      if (themeSetting && (themeSetting.currentValue === 'light' || themeSetting.currentValue === 'dark')) {
        setThemeMode(themeSetting.currentValue);
      }
    } catch (err) {
      setGlobalError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setThemeMode]);

  useEffect(() => {
    if (isOpen) {
      loadAllSettings();
    }
  }, [isOpen, loadAllSettings]);

  if (!isOpen || !mounted) return null;

  const handleValueChange = (settingId: number, newValue: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.definition.id === settingId) {
          const originalVal = item.userSetting
            ? item.userSetting.value
            : item.definition.default;

          // If changing theme_mode, apply theme immediately for real-time responsiveness
          if (item.definition.name === 'theme_mode') {
            if (newValue === 'light' || newValue === 'dark') {
              setThemeMode(newValue);
            }
          }

          return {
            ...item,
            currentValue: newValue,
            isDirty: newValue !== originalVal,
            successMessage: null,
            errorMessage: null,
          };
        }
        return item;
      })
    );
  };

  const handleSaveSetting = async (item: MergedSetting) => {
    const settingId = item.definition.id;
    setItems((prev) =>
      prev.map((i) =>
        i.definition.id === settingId
          ? { ...i, isSaving: true, errorMessage: null, successMessage: null }
          : i
      )
    );

    try {
      const res = await settingsService.saveUserSetting({
        setting_id: settingId,
        value: item.currentValue,
      });

      if (res.success && res.data) {
        setItems((prev) =>
          prev.map((i) =>
            i.definition.id === settingId
              ? {
                  ...i,
                  userSetting: res.data,
                  isCustomized: true,
                  isDirty: false,
                  isSaving: false,
                  successMessage: 'Saved!',
                }
              : i
          )
        );

        if (item.definition.name === 'theme_mode') {
          if (item.currentValue === 'light' || item.currentValue === 'dark') {
            setThemeMode(item.currentValue);
          }
        }

        setTimeout(() => {
          setItems((prev) =>
            prev.map((i) =>
              i.definition.id === settingId ? { ...i, successMessage: null } : i
            )
          );
        }, 2500);
      }
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.definition.id === settingId
            ? {
                ...i,
                isSaving: false,
                errorMessage: getErrorMessage(err),
              }
            : i
        )
      );
    }
  };

  const handleResetSetting = async (item: MergedSetting) => {
    if (!item.userSetting) return;

    const settingId = item.definition.id;
    const userSettingId = item.userSetting.id;

    setItems((prev) =>
      prev.map((i) =>
        i.definition.id === settingId
          ? { ...i, isResetting: true, errorMessage: null, successMessage: null }
          : i
      )
    );

    try {
      await settingsService.resetUserSetting(userSettingId);

      setItems((prev) =>
        prev.map((i) =>
          i.definition.id === settingId
            ? {
                ...i,
                userSetting: undefined,
                currentValue: i.definition.default,
                isCustomized: false,
                isDirty: false,
                isResetting: false,
                successMessage: 'Reset to default!',
              }
            : i
        )
      );

      if (item.definition.name === 'theme_mode') {
        const defaultMode = item.definition.default === 'dark' ? 'dark' : 'light';
        setThemeMode(defaultMode);
      }

      setTimeout(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.definition.id === settingId ? { ...i, successMessage: null } : i
          )
        );
      }, 2500);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.definition.id === settingId
            ? {
                ...i,
                isResetting: false,
                errorMessage: getErrorMessage(err),
              }
            : i
        )
      );
    }
  };

  // Helper for setting icons
  const getSettingIcon = (name: string) => {
    switch (name) {
      case 'theme_mode':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'light_mode':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'notifications_enabled':
        return <Bell className="w-4 h-4 text-emerald-400" />;
      case 'language':
        return <Languages className="w-4 h-4 text-purple-400" />;
      default:
        return <Sliders className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatSettingLabel = (name: string) => {
    return name
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Application Settings
                </h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">
                  User Preferences
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your personalized preferences or keep system defaults
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Notice */}
        {globalError && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              type="button"
              onClick={loadAllSettings}
              className="text-[11px] font-medium text-rose-300 hover:text-white underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Settings List */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-mono">Fetching settings definitions & overrides...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm">No settings found on this backend.</p>
            </div>
          ) : (
            items.map((item) => {
              const def = item.definition;
              const isBool =
                def.type === 'bool' ||
                def.name === 'light_mode' ||
                def.name === 'notifications_enabled';
              const isTheme = def.name === 'theme_mode';
              const isLanguage = def.name === 'language';
              const isNum = def.type === 'num';

              return (
                <div
                  key={def.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isCustomized
                      ? 'bg-slate-950/70 border-indigo-500/30 shadow-sm shadow-indigo-950/30'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Top info row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {getSettingIcon(def.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-white">
                            {formatSettingLabel(def.name)}
                          </h4>
                          {/* Value Origin Badge */}
                          {item.isCustomized ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                              Customized
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                              Default ({def.default})
                            </span>
                          )}
                        </div>
                        {def.description && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {def.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reset Button (only shown if user has an override) */}
                    {item.isCustomized && (
                      <button
                        type="button"
                        onClick={() => handleResetSetting(item)}
                        disabled={item.isResetting || item.isSaving}
                        className="text-[11px] text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 shrink-0 border border-transparent hover:border-rose-800/30 disabled:opacity-50"
                        title="Revert to system default value"
                      >
                        {item.isResetting ? (
                          <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Input / Control Row */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                    {/* Control based on type */}
                    <div className="flex-1 min-w-[200px]">
                      {isTheme ? (
                        /* Theme Mode Selector */
                        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleValueChange(def.id, 'light')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              item.currentValue === 'light'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            <span>Light Mode</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValueChange(def.id, 'dark')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              item.currentValue === 'dark'
                                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Dark Mode</span>
                          </button>
                        </div>
                      ) : isLanguage ? (
                        /* Language Selector */
                        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleValueChange(def.id, 'en')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              item.currentValue === 'en'
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            English (en)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValueChange(def.id, 'ar')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              item.currentValue === 'ar'
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            العربية (ar)
                          </button>
                        </div>
                      ) : isBool ? (
                        /* Boolean Switch */
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleValueChange(
                                def.id,
                                item.currentValue === 'true' ? 'false' : 'true'
                              )
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.currentValue === 'true'
                                ? 'bg-indigo-600'
                                : 'bg-slate-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                item.currentValue === 'true'
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-xs text-slate-300 font-medium">
                            {item.currentValue === 'true' ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : isNum ? (
                        /* Number Input */
                        <div className="flex items-center gap-2 max-w-xs">
                          <input
                            type="number"
                            value={item.currentValue}
                            onChange={(e) =>
                              handleValueChange(def.id, e.target.value)
                            }
                            className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                            min="1"
                            max="1000"
                          />
                          <span className="text-[11px] text-slate-400">
                            items per page
                          </span>
                        </div>
                      ) : (
                        /* Generic String Input */
                        <input
                          type="text"
                          value={item.currentValue}
                          onChange={(e) =>
                            handleValueChange(def.id, e.target.value)
                          }
                          className="w-full max-w-sm px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      )}
                    </div>

                    {/* Feedback & Save Action */}
                    <div className="flex items-center gap-2">
                      {item.successMessage && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fadeIn">
                          <Check className="w-3.5 h-3.5" />
                          {item.successMessage}
                        </span>
                      )}
                      {item.errorMessage && (
                        <span className="text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {item.errorMessage}
                        </span>
                      )}
                      {item.isDirty && (
                        <button
                          type="button"
                          onClick={() => handleSaveSetting(item)}
                          disabled={item.isSaving}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {item.isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-none">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isLocal ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
            <span className="truncate">{isLocal ? 'Local Backend (8000)' : 'Production Cloud API'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
