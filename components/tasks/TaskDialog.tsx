'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Attachment, Task, TaskPriority } from '@/types/api';
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  Lock,
  Paperclip,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  initialStatusId?: number;
  isQuickCreate?: boolean;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Normal', 'High', 'Urgent'];

function formatFileSize(bytes?: number): string {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDownloadUrl(filePath: string, activeApiUrl?: string): string {
  if (!filePath) return '#';
  try {
    const url = new URL(filePath);
    if (url.hostname === 'localhost' && !url.port && activeApiUrl) {
      const parsedApi = new URL(activeApiUrl);
      return `${parsedApi.origin}${url.pathname}`;
    }
  } catch {
    if (filePath.startsWith('/') && activeApiUrl) {
      try {
        const parsedApi = new URL(activeApiUrl);
        return `${parsedApi.origin}${filePath}`;
      } catch {}
    }
  }
  return filePath;
}

export default function TaskDialog({
  isOpen,
  onClose,
  taskToEdit,
  initialStatusId,
  isQuickCreate = false,
}: Props) {
  const { t } = useTranslation();
  const { activeApiUrl, canUpdateTask, canDeleteTask, hasPermission } = useAuth();
  const {
    statuses,
    taskTypes,
    workspaces,
    projects,
    activeWorkspaceId,
    activeProjectId,
    createTask,
    updateTask,
    deleteTask,
    uploadTaskAttachment,
    deleteTaskAttachment,
  } = useTasks();

  const isEditing = !!taskToEdit;
  // If editing and user has no update permission, enter read-only mode
  const isReadOnly = isEditing && !canUpdateTask;
  const canDelete = canDeleteTask || hasPermission('delete_tasks');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number>(1);
  const [taskTypeId, setTaskTypeId] = useState<number>(1);
  const [priority, setPriority] = useState<TaskPriority>('Normal');
  const [workspaceId, setWorkspaceId] = useState<number>(1);
  const [projectId, setProjectId] = useState<number>(1);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Attachments state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatusId(taskToEdit.status_id);
      setTaskTypeId(taskToEdit.task_type_id || taskToEdit.task_type?.id || taskTypes[0]?.id || 1);
      setPriority(taskToEdit.priority || 'Normal');
      setWorkspaceId(taskToEdit.workspace_id);
      setProjectId(taskToEdit.project_id);
      setStartDate(taskToEdit.start_date ? taskToEdit.start_date.substring(0, 10) : '');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.substring(0, 10) : '');
      setExistingAttachments(taskToEdit.attachments || []);
      setPendingFiles([]);
    } else {
      setTitle('');
      setDescription('');
      // In quick create mode, status is strictly the first status in the list.
      // In column create mode, status defaults to the clicked column's status (or first status fallback).
      const defaultStatus = isQuickCreate
        ? statuses[0]?.id || 1
        : initialStatusId || statuses[0]?.id || 1;

      setStatusId(defaultStatus);
      setTaskTypeId(taskTypes[0]?.id || 1);
      setPriority('Normal');
      // When creating, project and workspace default to the selected project and workspace on screen
      setWorkspaceId(activeWorkspaceId || workspaces[0]?.id || 1);
      setProjectId(activeProjectId || projects[0]?.id || 1);
      setStartDate('');
      setDueDate('');
      setExistingAttachments([]);
      setPendingFiles([]);
    }
    setConfirmDelete(false);
    setError(null);
  }, [
    taskToEdit,
    isOpen,
    initialStatusId,
    isQuickCreate,
    activeWorkspaceId,
    activeProjectId,
    statuses,
    taskTypes,
    workspaces,
    projects,
  ]);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = Array.from(e.target.files);
    e.target.value = '';

    if (!isEditing) {
      // Create mode: store in pendingFiles
      setPendingFiles((prev) => [...prev, ...selected]);
    } else if (taskToEdit) {
      // Edit mode: upload immediately to separate attachment endpoint
      setIsUploadingAttachment(true);
      setError(null);
      try {
        for (const file of selected) {
          const newAtt = await uploadTaskAttachment(taskToEdit.id, file);
          setExistingAttachments((prev) => [...prev, newAtt]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to upload attachment');
      } finally {
        setIsUploadingAttachment(false);
      }
    }
  };

  const handleRemovePendingFile = (index: number) => {
    if (isReadOnly) return;
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDeleteExistingAttachment = async (attachmentId: number) => {
    if (isReadOnly || !taskToEdit) return;
    setDeletingAttachmentId(attachmentId);
    setError(null);
    try {
      await deleteTaskAttachment(taskToEdit.id, attachmentId);
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete attachment');
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditing && taskToEdit) {
        await updateTask(taskToEdit.id, {
          title,
          description,
          status_id: statusId,
          task_type_id: taskTypeId,
          priority,
          workspace_id: workspaceId,
          project_id: projectId,
          start_date: startDate ? `${startDate} 09:00:00` : undefined,
          due_date: dueDate ? `${dueDate} 18:00:00` : undefined,
        });
      } else {
        // In quick create mode, guarantee status is first status and project/workspace match screen selection
        const finalStatusId = isQuickCreate ? statuses[0]?.id || 1 : statusId;
        const finalProjectId = isQuickCreate ? activeProjectId || projects[0]?.id || 1 : projectId;
        const finalWorkspaceId = isQuickCreate ? activeWorkspaceId || workspaces[0]?.id || 1 : workspaceId;

        await createTask({
          title,
          description,
          status_id: finalStatusId,
          task_type_id: taskTypeId,
          priority,
          workspace_id: finalWorkspaceId,
          project_id: finalProjectId,
          start_date: !isQuickCreate && startDate ? `${startDate} 09:00:00` : undefined,
          due_date: !isQuickCreate && dueDate ? `${dueDate} 18:00:00` : undefined,
          attachments: pendingFiles.length > 0 ? pendingFiles : undefined,
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
    if (!taskToEdit || !canDelete) return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/tasker_logo.jpg"
              alt="Tasker Logo"
              className="w-8 h-8 rounded-lg object-cover border border-indigo-500/30 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">
                  {isEditing ? t('edit_task') : t('new_task')}
                </h3>
                {isReadOnly && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {t('read_only')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isEditing ? t('task_number', { id: taskToEdit?.id || '' }) : t('add_task_to_workspace')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Notice if no update permission */}
        {isReadOnly && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 shrink-0">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('no_edit_permission')}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs shrink-0">
            {error}
          </div>
        )}

        {/* Lifecycle Metrics for existing task */}
        {isEditing && taskToEdit && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">{t('status_stage')}</span>
              <span className="font-medium text-slate-200 capitalize">
                {taskToEdit.status?.stage || 'pending'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">{t('working_since')}</span>
              <span className="font-medium text-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {taskToEdit.working_at
                  ? new Date(taskToEdit.working_at).toLocaleDateString()
                  : t('not_started')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">{t('actual_duration')}</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {taskToEdit.actual_minutes !== null && taskToEdit.actual_minutes !== undefined
                  ? `${taskToEdit.actual_minutes} ${t('mins')}`
                  : t('in_progress')}
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('task_title_label')}
            </label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('task_title_placeholder')}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('description_label')}
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('description_placeholder')}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('task_type_label')}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {taskTypes.length > 0 ? t('types_available', { count: taskTypes.length }) : t('default_type')}
              </span>
            </label>
            <select
              value={taskTypeId}
              disabled={isReadOnly}
              onChange={(e) => setTaskTypeId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {taskTypes.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.name} ({tt.type})
                </option>
              ))}
            </select>
          </div>

          {/* If quick create, hide status, project, workspace, start_date, due_date */}
          {isQuickCreate ? (
            /* In quick create mode, only priority is optional; others are hidden */
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('priority')}
              </label>
              <select
                value={priority}
                disabled={isReadOnly}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t(`priority_${p.toLowerCase()}` as any) || p}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Normal / Full Create or Edit Mode: All fields are shown and editable */
            <>
              {/* Grid: Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    value={statusId}
                    disabled={isReadOnly}
                    onChange={(e) => setStatusId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                    {t('priority')}
                  </label>
                  <select
                    value={priority}
                    disabled={isReadOnly}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {t(`priority_${p.toLowerCase()}` as any) || p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Project & Workspace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('project')}
                  </label>
                  <select
                    value={projectId}
                    disabled={isReadOnly}
                    onChange={(e) => setProjectId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                    {t('workspace')}
                  </label>
                  <select
                    value={workspaceId}
                    disabled={isReadOnly}
                    onChange={(e) => setWorkspaceId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{t('start_date')}</span>
                  </label>
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{t('due_date')}</span>
                  </label>
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </>
          )}

          {/* Attachments Section */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('attachments_label')}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({isEditing ? existingAttachments.length : pendingFiles.length})
                </span>
              </label>

              {/* Add Files trigger (hidden if read-only) */}
              {!isReadOnly && (
                <label
                  htmlFor="task-attachments-input"
                  className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all shadow-sm"
                >
                  {isUploadingAttachment ? (
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  <span>{isUploadingAttachment ? t('uploading') : t('add_files')}</span>
                  <input
                    id="task-attachments-input"
                    type="file"
                    multiple
                    disabled={isUploadingAttachment}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>

            {/* In Create Mode: Pending Files */}
            {!isEditing && (
              <div className="space-y-1.5">
                {pendingFiles.length === 0 ? (
                  <label
                    htmlFor="task-attachments-input"
                    className="cursor-pointer border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 bg-slate-950/40 hover:bg-slate-950/80 transition-colors"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-500" />
                    <p className="text-xs text-slate-400">{t('click_to_browse_or_attach')}</p>
                    <p className="text-[10px] text-slate-500">{t('attachments_saved_note')}</p>
                  </label>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {pendingFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="truncate text-slate-200">{file.name}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingFile(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* In Show / Edit Mode: Existing Attachments */}
            {isEditing && (
              <div className="space-y-1.5">
                {existingAttachments.length === 0 && !isUploadingAttachment ? (
                  !isReadOnly ? (
                    <label
                      htmlFor="task-attachments-input"
                      className="cursor-pointer border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 bg-slate-950/40 hover:bg-slate-950/80 transition-colors"
                    >
                      <UploadCloud className="w-5 h-5 text-slate-500" />
                      <p className="text-xs text-slate-400">{t('no_attachments_yet')}</p>
                      <p className="text-[10px] text-slate-500">{t('click_to_upload_files')}</p>
                    </label>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      {t('no_attachments_yet')}
                    </div>
                  )
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {existingAttachments.map((att) => {
                      const isImage =
                        att.type?.startsWith('image/') ||
                        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.file || att.path || '');
                      const downloadUrl = getDownloadUrl(att.file_path, activeApiUrl);

                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isImage ? (
                              <img
                                src={downloadUrl}
                                alt={att.file}
                                className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0 bg-slate-900"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate block text-slate-200 hover:text-indigo-400 font-medium transition-colors"
                                title={att.file}
                              >
                                {att.file || (att.path ? att.path.split('/').pop() : `Attachment #${att.id}`)}
                              </a>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span>{formatFileSize(att.size)}</span>
                                {att.created_at && (
                                  <span>• {new Date(att.created_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('download_view')}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            {/* Requirement 6: Hide delete button from attachments (commented out for easy restoration) */}
                            {/*
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingAttachment(att.id)}
                              disabled={deletingAttachmentId === att.id}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors disabled:opacity-50"
                              title={t('delete_attachment')}
                            >
                              {deletingAttachmentId === att.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                            */}
                          </div>
                        </div>
                      );
                    })}
                    {isUploadingAttachment && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-indigo-500/30 text-xs text-indigo-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>{t('uploading_attachment_notice')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {isEditing && canDelete ? (
              <div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete')}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shadow-rose-600/20"
                    >
                      {t('confirm_delete')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {t('cancel')}
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
                {t('cancel')}
              </button>
              {/* Save changes / Create task button */}
              <button
                type="submit"
                disabled={loading || !title.trim() || isReadOnly}
                className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 ${
                  isReadOnly
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 disabled:opacity-50'
                }`}
              >
                {loading
                  ? t('saving')
                  : isEditing
                  ? t('save_changes')
                  : t('new_task')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
