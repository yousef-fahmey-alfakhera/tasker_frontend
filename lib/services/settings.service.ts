import { apiClient } from '@/lib/api';
import {
  ApiResponse,
  Setting,
  UserSetting,
  StoreUserSettingPayload,
  ThemeResponse,
  ThemePayload,
} from '@/types/api';

export const settingsService = {
  /**
   * Retrieve all defined system settings
   * GET /settings
   */
  async getSettings(): Promise<ApiResponse<Setting[]>> {
    const response = await apiClient.get<ApiResponse<Setting[]>>('/settings');
    return response.data;
  },

  /**
   * Retrieve all user-specific settings overrides
   * GET /user-settings
   */
  async getUserSettings(): Promise<ApiResponse<UserSetting[]>> {
    const response = await apiClient.get<ApiResponse<UserSetting[]>>('/user-settings');
    return response.data;
  },

  /**
   * Save or update a user setting override
   * POST /user-settings
   */
  async saveUserSetting(
    payload: StoreUserSettingPayload
  ): Promise<ApiResponse<UserSetting>> {
    const response = await apiClient.post<ApiResponse<UserSetting>>(
      '/user-settings',
      payload
    );
    return response.data;
  },

  /**
   * Reset a user setting override back to system default
   * DELETE /user-settings/{id}
   */
  async resetUserSetting(userSettingId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/user-settings/${userSettingId}`
    );
    return response.data;
  },

  /**
   * Get authenticated user's current theme preference
   * GET /user-settings/theme
   */
  async getTheme(): Promise<ApiResponse<ThemeResponse>> {
    const response = await apiClient.get<ApiResponse<ThemeResponse>>(
      '/user-settings/theme'
    );
    return response.data;
  },

  /**
   * Set theme preference (light or dark)
   * POST /user-settings/theme
   */
  async setTheme(theme: 'light' | 'dark'): Promise<ApiResponse<ThemeResponse>> {
    const response = await apiClient.post<ApiResponse<ThemeResponse>>(
      '/user-settings/theme',
      { theme }
    );
    return response.data;
  },
};

export default settingsService;
