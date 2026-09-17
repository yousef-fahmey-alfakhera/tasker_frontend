'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskPriority } from '@/types/api';
import {
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Layers,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  initialStatusId?: number;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Normal', 'High', 'Urgent'];

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  Normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  High: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Urgent: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

export default function TaskDialog({
  isOpen,
  onClose,
  taskToEdit,
  initialStatusId,
}: Props) {
  const {
    statuses,
    workspaces,
    projects,
    activeWorkspaceId,
    activeProjectId,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const isEditing = !!taskToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number>(1);
  const [priority, setPriority] = useState<TaskPriority>('Normal');
  const [workspaceId, setWorkspaceId] = useState<number>(1);
  const [projectId, setProjectId] = useState<number>(1);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatusId(taskToEdit.status_id);
      setPriority(taskToEdit.priority || 'Normal');
      setWorkspaceId(taskToEdit.workspace_id);
      setProjectId(taskToEdit.project_id);
      setStartDate(taskToEdit.start_date ? taskToEdit.start_date.substring(0, 10) : '');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.substring(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatusId(initialStatusId || statuses[0]?.id || 1);
      setPriority('Normal');
      setWorkspaceId(activeWorkspaceId || workspaces[0]?.id || 1);
      setProjectId(activeProjectId || projects[0]?.id || 1);
      setStartDate('');
      setDueDate('');
    }
    setConfirmDelete(false);
    setError(null);
  }, [taskToEdit, isOpen, initialStatusId, activeWorkspaceId, activeProjectId, statuses, workspaces, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditing && taskToEdit) {
        await updateTask(taskToEdit.id, {
          title,
          description,
          status_id: statusId,
          priority,
          workspace_id: workspaceId,
          project_id: projectId,
          start_date: startDate ? `${startDate} 09:00:00` : undefined,
          due_date: dueDate ? `${dueDate} 18:00:00` : undefined,
        });
      } else {
        await createTask({
          title,
          description,
          status_id: statusId,
          priority,
          workspace_id: workspaceId,
          project_id: projectId,
          start_date: startDate ? `${startDate} 09:00:00` : undefined,
          due_date: dueDate ? `${dueDate} 18:00:00` : undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToEdit) return;
    setLoading(true);
    try {
      await deleteTask(taskToEdit.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `Task #${taskToEdit?.id}` : 'Add a task to your workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs shrink-0">
            {error}
          </div>
        )}

        {/* Lifecycle Metrics for existing task */}
        {isEditing && taskToEdit && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 grid grid-cols-3 gap-2 shrink-0">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Status Stage</span>
              <span className="font-medium text-slate-200 capitalize">
                {taskToEdit.status?.stage || 'pending'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Working Since</span>
              <span className="font-medium text-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {taskToEdit.working_at
                  ? new Date(taskToEdit.working_at).toLocaleDateString()
                  : 'Not started'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Actual Duration</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {taskToEdit.actual_minutes !== null && taskToEdit.actual_minutes !== undefined
                  ? `${taskToEdit.actual_minutes} mins`
                  : 'In progress'}
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user authentication flow"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, requirements, or acceptance criteria..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Grid: Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.stage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Project & Workspace */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {projects.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Workspace
              </label>
              <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {isEditing ? (
              <div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shadow-rose-600/20"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
