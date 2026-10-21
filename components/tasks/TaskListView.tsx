'use client';

import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Task, TaskPriority, TaskStatus } from '@/types/api';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  Trash2,
  Inbox,
  Sparkles,
  Paperclip,
  GitFork,
  Layers,
  LayoutList,
  Loader2,
  Plus,
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';

interface Props {
  onEditTask: (task: Task) => void;
  onAddTask: (statusId?: number) => void;
}

const PRIORITY_BADGES: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  Low: { bg: 'bg-slate-800', text: 'text-slate-300', dot: 'bg-slate-400' },
  Normal: { bg: 'bg-blue-950/70', text: 'text-blue-300', dot: 'bg-blue-400' },
  High: { bg: 'bg-amber-950/70', text: 'text-amber-300', dot: 'bg-amber-400' },
  Urgent: { bg: 'bg-rose-950/70', text: 'text-rose-300', dot: 'bg-rose-400' },
};

export default function TaskListView({ onEditTask, onAddTask }: Props) {
  const { t } = useTranslation();
  const { canCreateTask, canDeleteTask } = useAuth();
  const {
    tasks,
    statuses,
    workspaces,
    projects,
    updateTask,
    deleteTask,
    searchQuery,
    statusTasksMap,
    loadMoreForStatus,
    pagination,
    page,
    perPage,
    setPage,
    setPerPage,
  } = useTasks();

  const [groupMode, setGroupMode] = React.useState<'grouped' | 'flat'>('grouped');
  const [collapsedStatuses, setCollapsedStatuses] = React.useState<Record<number, boolean>>({});

  const toggleStatusCollapse = (statusId: number) => {
    setCollapsedStatuses((prev) => ({
      ...prev,
      [statusId]: !prev[statusId],
    }));
  };

  const handleStatusScroll = (e: React.UIEvent<HTMLDivElement>, statusId: number) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 60) {
      loadMoreForStatus(statusId);
    }
  };

  const displayStatuses: TaskStatus[] =
    statuses.length > 0
      ? statuses
      : [
          { id: 1, name: t('to_do'), stage: 'pending', color: '#94a3b8', order: 1 },
          { id: 2, name: t('in_progress'), stage: 'working', color: '#3b82f6', order: 2 },
          { id: 3, name: t('completed'), stage: 'completed', color: '#22c55e', order: 3 },
        ];

  const filteredTasks = tasks.filter((tItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tItem.title.toLowerCase().includes(q) ||
      (tItem.description && tItem.description.toLowerCase().includes(q))
    );
  });

  const getWorkspaceName = (id: number) => {
    return workspaces.find((w) => w.id === id)?.name || `${t('workspace')} #${id}`;
  };

  const getProjectName = (id: number) => {
    return projects.find((p) => p.id === id)?.name || `Project #${id}`;
  };

  const handleStatusChange = async (task: Task, newStatusId: number) => {
    try {
      await updateTask(task.id, { status_id: newStatusId });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const renderTaskRow = (task: Task) => {
    const priorityConfig =
      PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;
    const isResponsible =
      task.respnsapity === 1 || task.responsibility === 1;
    const hasChildren =
      (task.children && task.children.length > 0) ||
      (task.subtasks_count !== undefined && task.subtasks_count > 0);
    const childrenCount =
      task.children?.length ?? task.subtasks_count ?? 0;

    return (
      <tr
        key={task.id}
        onClick={() => onEditTask(task)}
        className={`cursor-pointer transition-colors group ${
          isResponsible
            ? 'bg-indigo-950/25 ring-1 ring-inset ring-indigo-400/50 hover:bg-indigo-950/40'
            : 'hover:bg-slate-800/30'
        }`}
      >
        {/* Status */}
        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status_id}
            onChange={(e) =>
              handleStatusChange(task, Number(e.target.value))
            }
            className="text-xs rounded-lg px-2.5 py-1 font-medium bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[150px]"
          >
            {displayStatuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </td>

        {/* Title & Type */}
        <td className="py-3 px-4 max-w-xs">
          <div className="font-medium text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2 flex-wrap">
            <span className="truncate">{task.title}</span>
            {hasChildren && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 shrink-0">
                <GitFork className="w-2.5 h-2.5 text-indigo-400 rotate-180" />
                <span>{t('has_children_badge', { count: childrenCount })}</span>
              </span>
            )}
            {isResponsible && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                {t('responsible')}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-slate-500 truncate text-[11px] mt-0.5 max-w-sm">
              {task.description}
            </p>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-mono">
              <Paperclip className="w-3 h-3 text-indigo-400" />
              <span>{task.attachments.length} attachment(s)</span>
            </div>
          )}
        </td>

        {/* Priority */}
        <td className="py-3 px-4 whitespace-nowrap">
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${priorityConfig.bg} ${priorityConfig.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
            {t(`priority_${task.priority.toLowerCase()}` as any) || task.priority}
          </span>
        </td>

        {/* Project & Workspace */}
        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
          <div className="text-slate-200">{getProjectName(task.project_id)}</div>
          <div className="text-[11px] text-slate-500">
            {getWorkspaceName(task.workspace_id)}
          </div>
        </td>

        {/* Due Date */}
        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
          {task.due_date ? (
            <span className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{task.due_date.substring(0, 10)}</span>
            </span>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </td>

        {/* Lifecycle Metrics */}
        <td className="py-3 px-4 whitespace-nowrap text-slate-400">
          {task.status?.stage === 'working' && (
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('in_progress')}</span>
            </span>
          )}
          {task.status?.stage === 'completed' && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {task.actual_minutes !== null && task.actual_minutes !== undefined
                  ? `${task.actual_minutes} ${t('mins')}`
                  : t('completed')}
              </span>
            </span>
          )}
          {task.status?.stage === 'pending' && (
            <span className="text-slate-500">{t('to_do')}</span>
          )}
        </td>

        {/* Actions */}
        <td
          className="py-3 px-4 text-right whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEditTask(task)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={t('edit_task')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {canDeleteTask && (
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title={t('delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTaskMobileCard = (task: Task) => {
    const priorityConfig =
      PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;
    const isResponsible =
      task.respnsapity === 1 || task.responsibility === 1;
    const hasChildren =
      (task.children && task.children.length > 0) ||
      (task.subtasks_count !== undefined && task.subtasks_count > 0);
    const childrenCount =
      task.children?.length ?? task.subtasks_count ?? 0;

    return (
      <div
        key={task.id}
        onClick={() => onEditTask(task)}
        className={`p-3 sm:p-4 space-y-2.5 transition-colors cursor-pointer ${
          hasChildren ? 'border-b-[4px] border-b-indigo-500/70' : ''
        } ${isResponsible ? 'bg-indigo-950/20' : 'hover:bg-slate-800/20'}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${priorityConfig.bg} ${priorityConfig.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
              {t(`priority_${task.priority.toLowerCase()}` as any) || task.priority}
            </span>
            {isResponsible && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t('responsible')}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500">#{task.id}</span>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white leading-snug">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
          <span>{getProjectName(task.project_id)}</span>
          <span className="text-slate-600">•</span>
          <span>{getWorkspaceName(task.workspace_id)}</span>
          {task.due_date && (
            <>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{task.due_date.substring(0, 10)}</span>
              </span>
            </>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 font-mono text-indigo-300">
                <Paperclip className="w-3 h-3 text-indigo-400" />
                <span>{task.attachments.length}</span>
              </span>
            </>
          )}
        </div>

        {hasChildren && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-medium text-[11px] shadow-sm">
              <GitFork className="w-3 h-3 text-indigo-400 rotate-180" />
              <span>{t('has_children_badge', { count: childrenCount })}</span>
            </div>
            {task.children && task.children.length > 0 && (
              <div
                className="flex items-center -space-x-1 rtl:space-x-reverse"
                title={`${childrenCount} subtasks`}
              >
                {task.children.slice(0, 4).map((child) => (
                  <span
                    key={child.id}
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-950"
                    style={{ backgroundColor: child.status?.color || '#818cf8' }}
                  />
                ))}
                {task.children.length > 4 && (
                  <span className="text-[10px] font-mono text-slate-400 pl-1">
                    +{task.children.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={task.status_id}
            onChange={(e) =>
              handleStatusChange(task, Number(e.target.value))
            }
            className="text-xs rounded-lg px-2.5 py-1 font-medium bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[170px]"
          >
            {displayStatuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditTask(task)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={t('edit_task')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {canDeleteTask && (
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title={t('delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
      {/* Top Controls: View Mode Switcher & Create Task */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setGroupMode('grouped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              groupMode === 'grouped'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('group_by_status')}</span>
          </button>
          <button
            type="button"
            onClick={() => setGroupMode('flat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              groupMode === 'flat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{t('flat_list')}</span>
          </button>
        </div>

        {canCreateTask && (
          <button
            type="button"
            onClick={() => onAddTask()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('create_new_task')}</span>
          </button>
        )}
      </div>

      {groupMode === 'grouped' ? (
        /* Status Dropdown Accordions with Infinite Scroll */
        <div className="space-y-4">
          {displayStatuses.map((status) => {
            const statusState = statusTasksMap[status.id];
            const statusTasks = statusState
              ? statusState.tasks
              : filteredTasks.filter((t) => t.status_id === status.id);
            const totalCount = statusState?.total ?? status.tasks_count ?? statusTasks.length;
            const hasMore = statusState?.hasMore ?? false;
            const isLoadingMore = statusState?.isLoadingMore ?? false;
            const isInitialLoading = statusState?.isLoading && statusTasks.length === 0;
            const isCollapsed = !!collapsedStatuses[status.id];

            return (
              <div
                key={status.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm transition-all"
              >
                {/* Status Dropdown Header */}
                <div
                  onClick={() => toggleStatusCollapse(status.id)}
                  className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={isCollapsed ? t('expand_status') || 'Expand' : t('collapse_status') || 'Collapse'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-white/10 shrink-0"
                      style={{ backgroundColor: status.color || '#6366f1' }}
                    />
                    <h3 className="text-sm font-semibold text-white tracking-wide truncate">
                      {status.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 shrink-0">
                      #{status.id}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                      {statusTasks.length}{totalCount !== statusTasks.length ? ` / ${totalCount}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {canCreateTask && (
                      <button
                        type="button"
                        onClick={() => onAddTask(status.id)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="hidden sm:inline">{t('new_task')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Dropdown Body with Scroll Pagination */}
                {!isCollapsed && (
                  <div
                    className="overflow-y-auto max-h-[460px]"
                    onScroll={(e) => handleStatusScroll(e, status.id)}
                  >
                    {isInitialLoading ? (
                      <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        <p className="text-xs">{t('loading_more_tasks')}</p>
                      </div>
                    ) : statusTasks.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-2">
                        <Inbox className="w-8 h-8 opacity-40" />
                        <p className="text-xs">{t('no_tasks_in_column', { status: status.name })}</p>
                        {canCreateTask && (
                          <button
                            type="button"
                            onClick={() => onAddTask(status.id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            {t('create_first_task')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800/80 text-[10px] font-mono uppercase text-slate-400 bg-slate-950/20">
                                <th className="py-2.5 px-4 font-semibold">{t('status')}</th>
                                <th className="py-2.5 px-4 font-semibold">{t('task_title')}</th>
                                <th className="py-2.5 px-4 font-semibold">{t('priority')}</th>
                                <th className="py-2.5 px-4 font-semibold">{t('project_and_workspace')}</th>
                                <th className="py-2.5 px-4 font-semibold">{t('due_date')}</th>
                                <th className="py-2.5 px-4 font-semibold">{t('lifecycle_and_time')}</th>
                                <th className="py-2.5 px-4 font-semibold text-right">{t('actions')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs">
                              {statusTasks.map((task) => renderTaskRow(task))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden divide-y divide-slate-800/60">
                          {statusTasks.map((task) => renderTaskMobileCard(task))}
                        </div>

                        {/* Infinite scroll loader / button */}
                        {isLoadingMore && (
                          <div className="py-3 flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono animate-fadeIn border-t border-slate-800/40">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('loading_more_tasks')}</span>
                          </div>
                        )}

                        {hasMore && !isLoadingMore && (
                          <div className="p-2 border-t border-slate-800/40">
                            <button
                              type="button"
                              onClick={() => loadMoreForStatus(status.id)}
                              className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium rounded-xl hover:bg-indigo-950/30 border border-dashed border-indigo-500/30 transition-all flex items-center justify-center gap-1.5"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>{t('load_more')}</span>
                            </button>
                          </div>
                        )}

                        {!hasMore && statusTasks.length > 3 && (
                          <div className="py-2 text-center text-[10px] text-slate-500 font-mono border-t border-slate-800/40">
                            {t('all_tasks_loaded', { count: totalCount })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Table View with Global Pagination */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          {filteredTasks.length === 0 ? (
            <div className="py-16 sm:py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 px-4">
              <Inbox className="w-10 h-10 opacity-30" />
              <p className="text-sm">{t('no_tasks')}</p>
              {canCreateTask && (
                <button
                  type="button"
                  onClick={() => onAddTask()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  {t('create_new_task')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-950/40">
                      <th className="py-3.5 px-4 font-semibold">{t('status')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('task_title')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('priority')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('project_and_workspace')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('due_date')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('lifecycle_and_time')}</th>
                      <th className="py-3.5 px-4 font-semibold text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredTasks.map((task) => renderTaskRow(task))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-800/60">
                {filteredTasks.map((task) => renderTaskMobileCard(task))}
              </div>

              {/* Pagination Toolbar */}
              <Pagination
                pagination={pagination}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                totalFallback={tasks.length}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
