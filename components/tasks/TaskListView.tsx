'use client';

import React from 'react';
import { useTasks } from '@/context/TaskContext';
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
  const {
    tasks,
    statuses,
    workspaces,
    projects,
    updateTask,
    deleteTask,
    searchQuery,
  } = useTasks();

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
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
            <p className="text-sm">No tasks found matching your filters</p>
            <button
              type="button"
              onClick={onAddTask}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              Create New Task
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-950/40">
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Task Title</th>
                    <th className="py-3.5 px-4 font-semibold">Priority</th>
                    <th className="py-3.5 px-4 font-semibold">Project & Workspace</th>
                    <th className="py-3.5 px-4 font-semibold">Due Date</th>
                    <th className="py-3.5 px-4 font-semibold">Lifecycle & Time</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
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
                          className="text-xs rounded-lg px-2.5 py-1 font-medium bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                            {task.title}
                          </span>
                          {isResponsible && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center gap-0.5 shrink-0">
                              <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                              Responsible
                            </span>
                          )}
                          {task.task_type && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                              {task.task_type.name}
                            </span>
                          )}
                          {task.attachments && task.attachments.length > 0 && (
                            <span
                              className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60"
                              title={`${task.attachments.length} attachment(s)`}
                            >
                              <Paperclip className="w-3 h-3 text-indigo-400" />
                              <span>{task.attachments.length}</span>
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5 max-w-sm">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${priorityConfig.bg} ${priorityConfig.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                          {task.priority}
                        </span>
                      </td>

                      {/* Project & Workspace */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium truncate max-w-[140px]">
                          {getProjectName(task.project_id)}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {getWorkspaceName(task.workspace_id)}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 text-slate-300">
                        {task.due_date ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.due_date.substring(0, 10)}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Lifecycle / Duration */}
                      <td className="py-3 px-4">
                        {task.status?.stage === 'working' ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 text-[11px] font-medium bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/40">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>In progress</span>
                          </span>
                        ) : task.status?.stage === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {task.actual_minutes !== null && task.actual_minutes !== undefined
                                ? `${task.actual_minutes}m actual`
                                : 'Completed'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden divide-y divide-slate-800/60">
            {filteredTasks.map((task) => {
              const priorityConfig =
                PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;
              const isResponsible =
                task.respnsapity === 1 || task.responsibility === 1;

              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className={`p-4 transition-colors cursor-pointer space-y-2.5 ${
                    isResponsible
                      ? 'bg-indigo-950/20'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Top Row: Priority, Type, Responsible & ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${priorityConfig.bg} ${priorityConfig.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                        {task.priority}
                      </span>
                      {task.task_type && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80">
                          {task.task_type.name}
                        </span>
                      )}
                      {isResponsible && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 border border-indigo-400/50 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                          Responsible
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      #{task.id}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Meta: Project, Workspace, Due Date */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">
                      {getProjectName(task.project_id)}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{getWorkspaceName(task.workspace_id)}</span>
                    {task.due_date && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-400" />
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
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
