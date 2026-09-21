/**
 * Centralized API configuration for Tasker
 * Single source of truth for the backend API Base URL.
 */

export const API_URLS = {
  REMOTE: 'https://tasker-api.almuder.com/api',
  LOCAL: 'http://127.0.0.1:8000/api',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'tasker_access_token',
  USER: 'tasker_user',
  API_URL: 'tasker_api_base_url',
  PERMISSIONS: 'tasker_permissions',
  LANGUAGE: 'tasker_language',
} as const;

/**
 * Gets the current active API base URL.
 * Checks localStorage override, environment variable, or sensible default.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.API_URL);
    if (savedUrl) {
      return savedUrl.replace(/\/+$/, '');
    }
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // Default to remote in production or local in development
  if (process.env.NODE_ENV === 'development') {
    return API_URLS.LOCAL;
  }

  return API_URLS.REMOTE;
}

/**
 * Allows the user or developer to switch the API base URL at runtime.
 */
export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = url.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEYS.API_URL, cleanUrl);
    window.dispatchEvent(new CustomEvent('tasker_api_url_changed', { detail: cleanUrl }));
  }
}

/**
 * Clears any runtime override and returns to default.
 */
export function resetApiBaseUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.API_URL);
    window.dispatchEvent(new CustomEvent('tasker_api_url_changed', { detail: getApiBaseUrl() }));
  }
}
