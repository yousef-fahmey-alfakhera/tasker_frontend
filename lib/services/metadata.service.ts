import { apiClient } from '@/lib/api';
import { ApiResponse, Project, TaskStatus, TaskType, Workspace } from '@/types/api';

export const metadataService = {
  /**
   * List all task types
   * GET /task-types
   */
  async getTaskTypes(): Promise<ApiResponse<TaskType[]>> {
    const response = await apiClient.get<ApiResponse<TaskType[]>>(
      '/task-types'
    );
    return response.data;
  },

  /**
   * List all workflow task statuses
   * GET /task-statuses
   */
  async getTaskStatuses(): Promise<ApiResponse<TaskStatus[]>> {
    const response = await apiClient.get<ApiResponse<TaskStatus[]>>(
      '/task-statuses'
    );
    return response.data;
  },

  /**
   * List all workspaces
   * GET /workspaces
   */
  async getWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    const response = await apiClient.get<ApiResponse<Workspace[]>>(
      '/workspaces'
    );
    return response.data;
  },

  /**
   * Create a new workspace
   * POST /workspaces
   */
  async createWorkspace(payload: {
    project_id?: number;
    name: string;
    description?: string;
  }): Promise<ApiResponse<Workspace>> {
    const response = await apiClient.post<ApiResponse<Workspace>>(
      '/workspaces',
      payload
    );
    return response.data;
  },

  /**
   * List all projects
   * GET /projects
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
    return response.data;
  },

  /**
   * Create a new project
   * POST /projects
   */
  async createProject(payload: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<ApiResponse<Project>>(
      '/projects',
      payload
    );
    return response.data;
  },
};

export default metadataService;
