'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Attachment,
  CreateTaskPayload,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  UpdateTaskPayload,
  Workspace,
} from '@/types/api';
import tasksService from '@/lib/services/tasks.service';
import attachmentsService from '@/lib/services/attachments.service';
import metadataService from '@/lib/services/metadata.service';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '@/lib/api';

interface TaskContextType {
  tasks: Task[];
  statuses: TaskStatus[];
  taskTypes: TaskType[];
  workspaces: Workspace[];
  projects: Project[];
  activeWorkspaceId: number | null;
  activeProjectId: number | null;
  activeStatusId: number | null;
  activePriority: TaskPriority | null;
  searchQuery: string;
  isLoadingTasks: boolean;
  isLoadingMeta: boolean;
  error: string | null;
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: number, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  uploadTaskAttachment: (taskId: number, file: File) => Promise<Attachment>;
  deleteTaskAttachment: (taskId: number, attachmentId: number) => Promise<void>;
  createProject: (payload: { name: string; description?: string }) => Promise<Project>;
  createWorkspace: (payload: {
    project_id?: number;
    name: string;
    description?: string;
  }) => Promise<Workspace>;
  setActiveWorkspaceId: (id: number | null) => void;
  setActiveProjectId: (id: number | null) => void;
  setActiveStatusId: (id: number | null) => void;
  setActivePriority: (priority: TaskPriority | null) => void;
  setSearchQuery: (query: string) => void;
  refreshAll: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, activeApiUrl } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [activeStatusId, setActiveStatusId] = useState<number | null>(null);
  const [activePriority, setActivePriority] = useState<TaskPriority | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metadata: statuses, taskTypes, workspaces, projects
  const fetchMetadata = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingMeta(true);
    try {
      const [statusesRes, taskTypesRes, workspacesRes, projectsRes] = await Promise.allSettled([
        metadataService.getTaskStatuses(),
        metadataService.getTaskTypes(),
        metadataService.getWorkspaces(),
        metadataService.getProjects(),
      ]);

      if (statusesRes.status === 'fulfilled' && statusesRes.value.success) {
        setStatuses(statusesRes.value.data || []);
      }
      if (taskTypesRes.status === 'fulfilled' && taskTypesRes.value.success) {
        setTaskTypes(taskTypesRes.value.data || []);
      }
      if (workspacesRes.status === 'fulfilled' && workspacesRes.value.success) {
        const fetchedWorkspaces = workspacesRes.value.data || [];
        setWorkspaces(fetchedWorkspaces);
        if (!activeWorkspaceId && fetchedWorkspaces.length > 0) {
          setActiveWorkspaceId(fetchedWorkspaces[0].id);
        }
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value.success) {
        const fetchedProjects = projectsRes.value.data || [];
        setProjects(fetchedProjects);
        if (!activeProjectId && fetchedProjects.length > 0) {
          setActiveProjectId(fetchedProjects[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    } finally {
      setIsLoadingMeta(false);
    }
  }, [isAuthenticated, activeWorkspaceId, activeProjectId]);

  // Fetch tasks with current filters
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingTasks(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (activeWorkspaceId) params.workspace_id = activeWorkspaceId;
      if (activeProjectId) params.project_id = activeProjectId;
      if (activeStatusId) params.status_id = activeStatusId;
      if (activePriority) params.priority = activePriority;

      const res = await tasksService.getTasks(params);
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [isAuthenticated, activeWorkspaceId, activeProjectId, activeStatusId, activePriority]);

  // Refetch metadata and tasks when authentication or active API URL changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchMetadata();
    } else {
      setTasks([]);
      setStatuses([]);
      setWorkspaces([]);
      setProjects([]);
      setActiveWorkspaceId(null);
      setActiveProjectId(null);
    }
  }, [isAuthenticated, activeApiUrl, fetchMetadata]);

  // Refetch tasks when workspace or filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, activeWorkspaceId, activeProjectId, activeStatusId, activePriority, fetchTasks]);

  const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    setError(null);
    try {
      const res = await tasksService.createTask(payload);
      if (res.success && res.data) {
        const newTask = res.data;
        // Re-fetch to get complete relational status/counts or append optimistically
        await fetchTasks();
        return newTask;
      }
      throw new Error(res.message || 'Failed to create task');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateTask = async (
    id: number,
    payload: UpdateTaskPayload
  ): Promise<Task> => {
    setError(null);
    try {
      const res = await tasksService.updateTask(id, payload);
      if (res.success && res.data) {
        const updated = res.data;
        // Update task locally
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
        // Refresh to ensure lifecycle fields (working_at, completed_at, actual_minutes) are in sync
        await fetchTasks();
        return updated;
      }
      throw new Error(res.message || 'Failed to update task');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    setError(null);
    try {
      const res = await tasksService.deleteTask(id);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        throw new Error(res.message || 'Failed to delete task');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const uploadTaskAttachment = async (
    taskId: number,
    file: File
  ): Promise<Attachment> => {
    setError(null);
    try {
      const res = await attachmentsService.uploadAttachment(file, 'task', taskId);
      if (res.success && res.data) {
        const newAttachment = res.data;
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === taskId) {
              const currentAttachments = t.attachments || [];
              return {
                ...t,
                attachments: [...currentAttachments, newAttachment],
              };
            }
            return t;
          })
        );
        return newAttachment;
      }
      throw new Error(res.message || 'Failed to upload attachment');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteTaskAttachment = async (
    taskId: number,
    attachmentId: number
  ): Promise<void> => {
    setError(null);
    try {
      const res = await attachmentsService.deleteAttachment(attachmentId);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === taskId) {
              const currentAttachments = t.attachments || [];
              return {
                ...t,
                attachments: currentAttachments.filter((a) => a.id !== attachmentId),
              };
            }
            return t;
          })
        );
      } else {
        throw new Error(res.message || 'Failed to delete attachment');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const createProject = async (payload: {
    name: string;
    description?: string;
  }): Promise<Project> => {
    const res = await metadataService.createProject(payload);
    if (res.success && res.data) {
      setProjects((prev) => [...prev, res.data]);
      setActiveProjectId(res.data.id);
      return res.data;
    }
    throw new Error(res.message || 'Failed to create project');
  };

  const createWorkspace = async (payload: {
    project_id?: number;
    name: string;
    description?: string;
  }): Promise<Workspace> => {
    const res = await metadataService.createWorkspace(payload);
    if (res.success && res.data) {
      setWorkspaces((prev) => [...prev, res.data]);
      setActiveWorkspaceId(res.data.id);
      return res.data;
    }
    throw new Error(res.message || 'Failed to create workspace');
  };

  const refreshAll = async () => {
    await fetchMetadata();
    await fetchTasks();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        statuses,
        taskTypes,
        workspaces,
        projects,
        activeWorkspaceId,
        activeProjectId,
        activeStatusId,
        activePriority,
        searchQuery,
        isLoadingTasks,
        isLoadingMeta,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        uploadTaskAttachment,
        deleteTaskAttachment,
        createProject,
        createWorkspace,
        setActiveWorkspaceId,
        setActiveProjectId,
        setActiveStatusId,
        setActivePriority,
        setSearchQuery,
        refreshAll,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
