export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success?: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Token {
  type: string;
  access_token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  token?: Token;
}

export type TaskStage = 'pending' | 'working' | 'completed';

export interface TaskType {
  id: number;
  name: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  stage: TaskStage;
  color: string;
  order: number;
  tasks_count?: number;
}

export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface Attachment {
  id: number;
  attachable_type: string;
  attachable_id: number;
  file: string;
  path: string;
  file_path: string;
  type: string;
  size: number;
  created_by?: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  position?: number;
  parent_task_id?: number | null;
  created_by?: number;
  fixed_by?: number | null;
  project_id: number;
  workspace_id: number;
  status_id: number;
  status?: TaskStatus;
  task_type_id?: number;
  task_type?: TaskType;
  respnsapity?: number;
  responsibility?: number;
  attachments?: Attachment[];
  start_date?: string | null;
  due_date?: string | null;
  working_at?: string | null;
  completed_at?: string | null;
  actual_minutes?: number | null;
  subtasks_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceUser {
  id: number;
  name: string;
  email: string;
  role: 'viewer' | 'admin' | 'it' | 'creator' | 'editor';
}

export interface Workspace {
  id: number;
  project_id?: number;
  name: string;
  description?: string | null;
  created_by?: number;
  users?: WorkspaceUser[];
  tasks_count?: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  created_by?: number;
  workspaces_count?: number;
  tasks_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Request Payloads
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface CreateTaskPayload {
  project_id: number;
  workspace_id: number;
  status_id: number;
  task_type_id?: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  position?: number;
  start_date?: string;
  due_date?: string;
  attachments?: File[];
}

export interface UpdateTaskPayload {
  project_id?: number;
  workspace_id?: number;
  status_id?: number;
  task_type_id?: number;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  position?: number;
  fixed_by?: number;
  start_date?: string;
  due_date?: string;
}

export interface TaskFilterParams {
  workspace_id?: number;
  project_id?: number;
  status_id?: number;
  priority?: TaskPriority;
  search?: string;
}

// Settings & User Settings Types
export type SettingType = 'string' | 'bool' | 'num';

export interface Setting {
  id: number;
  name: string;
  type: SettingType;
  default: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSetting {
  id: number;
  user_id: number;
  setting_id: number;
  setting_name: string;
  type: SettingType;
  value: string;
  casted_value?: string | number | boolean;
  setting?: Setting;
  created_at?: string;
  updated_at?: string;
}

export interface StoreUserSettingPayload {
  setting_id: number;
  value: string;
}

export interface ThemeResponse {
  theme_mode: string;
  is_light: boolean;
  is_dark: boolean;
}

export interface ThemePayload {
  theme: 'light' | 'dark';
}

