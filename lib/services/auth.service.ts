import { apiClient } from '@/lib/api';
import {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types/api';

export const authService = {
  /**
   * Authenticate user credentials and retrieve personal access token
   * POST /public/auth/login
   */
  async login(payload: LoginPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/public/auth/login',
      payload
    );
    return response.data;
  },

  /**
   * Register a new user account
   * POST /public/auth/register
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/public/auth/register',
      payload
    );
    return response.data;
  },

  /**
   * Invalidate authenticated session token
   * POST /auth/logout
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile
   * GET /profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/profile');
    return response.data;
  },

  /**
   * Update profile information
   * PUT /profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>('/profile', payload);
    return response.data;
  },

  /**
   * Retrieve direct and inherited permissions for authenticated user
   * GET /auth/permissions (fallback /permissions/me)
   */
  async getPermissions(): Promise<ApiResponse<import('@/types/api').Permission[]>> {
    try {
      const response = await apiClient.get<ApiResponse<import('@/types/api').Permission[]>>(
        '/auth/permissions'
      );
      return response.data;
    } catch {
      // Fallback endpoint if /auth/permissions redirects
      const fallback = await apiClient.get<ApiResponse<import('@/types/api').Permission[]>>(
        '/permissions/me'
      );
      return fallback.data;
    }
  },
};

export default authService;
