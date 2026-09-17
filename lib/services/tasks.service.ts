import { apiClient } from '@/lib/api';
import {
  ApiResponse,
  CreateTaskPayload,
  Task,
  TaskFilterParams,
  UpdateTaskPayload,
} from '@/types/api';

export const tasksService = {
  /**
   * List tasks with optional filters (workspace, project, status, priority)
   * GET /tasks
   */
  async getTasks(params?: TaskFilterParams): Promise<ApiResponse<Task[]>> {
    const cleanParams: Record<string, string | number> = {};
    if (params?.workspace_id) cleanParams.workspace_id = params.workspace_id;
    if (params?.project_id) cleanParams.project_id = params.project_id;
    if (params?.status_id) cleanParams.status_id = params.status_id;
    if (params?.priority) cleanParams.priority = params.priority;

    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Fetch a single task by ID
   * GET /tasks/{id}
   */
  async getTask(id: number): Promise<ApiResponse<Task>> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   * POST /tasks
   */
  async createTask(payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
    return response.data;
  },

  /**
   * Update task details or transition status (triggers automatic lifecycle timestamps)
   * PUT /tasks/{id}
   */
  async updateTask(
    id: number,
    payload: UpdateTaskPayload
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.put<ApiResponse<Task>>(
      `/tasks/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Soft delete a task
   * DELETE /tasks/{id}
   */
  async deleteTask(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/tasks/${id}`);
    return response.data;
  },
};

export default tasksService;
