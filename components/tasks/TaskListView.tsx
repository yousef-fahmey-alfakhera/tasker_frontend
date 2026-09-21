'use client';

import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Task, TaskPriority } from '@/types/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Inbox,
  Sparkles,
  Paperclip,
} from 'lucide-react';

interface Props {
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
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
  } = useTasks();

  const filteredTasks = tasks.filter((tItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tItem.title.toLowerCase().includes(q) ||
      (tItem.description && tItem.description.toLowerCase().includes(q))
    );
  });

  const getWorkspaceName = (id: number) => {
    return workspaces.find((w) => w.id === id)?.name || `Workspace #${id}`;
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

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
        {filteredTasks.length === 0 ? (
          <div className="py-16 sm:py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 px-4">
            <Inbox className="w-10 h-10 opacity-30" />
            <p className="text-sm">{t('no_tasks')}</p>
            {canCreateTask && (
              <button
                type="button"
                onClick={onAddTask}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                {t('create_new_task')}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
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
                  {filteredTasks.map((task) => {
                    const priorityConfig =
                      PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;

                    const isResponsible =
                      task.respnsapity === 1 || task.responsibility === 1;

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
                            {statuses.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Title & Type */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                            <span className="truncate">{task.title}</span>
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
                              {task.due_date.substring(0, 10)}
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< md) */}
            <div className="md:hidden divide-y divide-slate-800/60">
              {filteredTasks.map((task) => {
                const priorityConfig =
                  PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;

                const isResponsible =
                  task.respnsapity === 1 || task.responsibility === 1;

                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={`p-3 sm:p-4 space-y-2.5 transition-colors cursor-pointer ${
                      isResponsible ? 'bg-indigo-950/20' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    {/* Top Row: Priority, Responsible, ID */}
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

                    {/* Middle: Title & Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                      <span>{getProjectName(task.project_id)}</span>
                      <span className="text-slate-600">•</span>
                      <span>{getWorkspaceName(task.workspace_id)}</span>
                      {task.due_date && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {task.due_date.substring(0, 10)}
                          </span>
                        </>
                      )}
                      {task.attachments && task.attachments.length > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 font-mono text-indigo-300">
                            <Paperclip className="w-3 h-3 text-indigo-400" />
                            {task.attachments.length}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Bottom Row: Status Selector & Actions */}
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
                        {statuses.map((s) => (
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
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
