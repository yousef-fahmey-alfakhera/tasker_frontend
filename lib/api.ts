import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl, STORAGE_KEYS } from './config';
import { ApiErrorResponse } from '@/types/api';

/**
 * Centralized Axios instance for Tasker API.
 * Uses a dynamic baseURL so switching between Local & Remote takes effect immediately.
 */
export const apiClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor: dynamically set baseURL and inject Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
      config.headers['Accept-Language'] = lang;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s and standardize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
        window.dispatchEvent(new CustomEvent('tasker_unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Utility helper to extract a user-friendly error message from an API error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errData = error.response?.data as ApiErrorResponse | undefined;
    if (errData) {
      if (errData.errors) {
        // Collect first error from each field
        const messages = Object.values(errData.errors).flat();
        if (messages.length > 0) {
          return messages[0];
        }
      }
      if (errData.message) {
        return errData.message;
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

export default apiClient;
