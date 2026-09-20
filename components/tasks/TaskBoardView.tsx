'use client';

import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskPriority, TaskStatus } from '@/types/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  MoreVertical,
  Plus,
  ArrowRight,
  AlertCircle,
  Inbox,
  Sparkles,
  Paperclip,
} from 'lucide-react';

interface Props {
  onEditTask: (task: Task) => void;
  onAddTask: (statusId?: number) => void;
}

const PRIORITY_BADGES: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  Low: { bg: 'bg-slate-800/80', text: 'text-slate-300', dot: 'bg-slate-400' },
  Normal: { bg: 'bg-blue-950/60', text: 'text-blue-300', dot: 'bg-blue-400' },
  High: { bg: 'bg-amber-950/60', text: 'text-amber-300', dot: 'bg-amber-400' },
  Urgent: { bg: 'bg-rose-950/60', text: 'text-rose-300', dot: 'bg-rose-400' },
};

export default function TaskBoardView({ onEditTask, onAddTask }: Props) {
  const { tasks, statuses, updateTask, deleteTask, searchQuery } = useTasks();

  // Filter tasks by search query if any
  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  // Default fallback columns if backend returned 0 statuses
  const displayStatuses: TaskStatus[] =
    statuses.length > 0
      ? statuses
      : [
          { id: 1, name: 'To Do', stage: 'pending', color: '#94a3b8', order: 1 },
          { id: 2, name: 'In Progress', stage: 'working', color: '#3b82f6', order: 2 },
          { id: 3, name: 'Done', stage: 'completed', color: '#22c55e', order: 3 },
        ];

  const columnRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const [activeTabStatusId, setActiveTabStatusId] = React.useState<number | null>(null);

  const scrollToColumn = (statusId: number) => {
    setActiveTabStatusId(statusId);
    const el = columnRefs.current[statusId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handleQuickMove = async (task: Task, newStatusId: number) => {
    try {
      await updateTask(task.id, { status_id: newStatusId });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Status Tabs for fast 1-tap switching */}
      <div className="flex sm:hidden items-center gap-1.5 px-3 pt-3 pb-1 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800/50 bg-slate-950/40">
        {displayStatuses.map((status) => {
          const count = filteredTasks.filter((t) => t.status_id === status.id).length;
          const isActive = activeTabStatusId === status.id;
          return (
            <button
              key={status.id}
              type="button"
              onClick={() => scrollToColumn(status.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: status.color || '#6366f1' }}
              />
              <span>{status.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-6 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-3 sm:gap-6 min-w-max items-start">
          {displayStatuses.map((status) => {
            const columnTasks = filteredTasks.filter((t) => t.status_id === status.id);

            return (
              <div
                key={status.id}
                ref={(el) => {
                  columnRefs.current[status.id] = el;
                }}
                className="w-[85vw] max-w-[340px] sm:w-80 shrink-0 snap-center task-board-column bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col max-h-[calc(100dvh-170px)] sm:max-h-[calc(100vh-180px)] backdrop-blur-sm"
              >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: status.color || '#6366f1' }}
                  />
                  <h3 className="text-sm font-semibold text-white tracking-wide">
                    {status.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onAddTask(status.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Add task in this column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="p-3 overflow-y-auto flex-1 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="py-12 px-4 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 opacity-40" />
                    <p className="text-xs">No tasks in {status.name}</p>
                    <button
                      type="button"
                      onClick={() => onAddTask(status.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Create first task
                    </button>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const priorityConfig =
                      PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;

                    const isResponsible =
                      task.respnsapity === 1 || task.responsibility === 1;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`group rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden ${
                          isResponsible
                            ? 'bg-slate-950 border-2 border-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.35)] ring-1 ring-indigo-300/40 hover:border-indigo-300'
                            : 'bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Status color left border accent */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 opacity-75"
                          style={{ backgroundColor: status.color || '#6366f1' }}
                        />

                        {/* Top: Priority, Type, Responsible & ID */}
                        <div className="flex items-center justify-between mb-2 pl-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${priorityConfig.bg} ${priorityConfig.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                              {task.priority}
                            </span>
                            {task.task_type && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/80">
                                {task.task_type.name}
                              </span>
                            )}
                            {isResponsible && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 border border-indigo-400/50 flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                                Responsible
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            #{task.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors pl-1 leading-snug">
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 pl-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Lifecycle Metrics */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 pl-1">
                          <div className="flex items-center gap-2">
                            {task.status?.stage === 'working' && (
                              <span className="flex items-center gap-1 text-amber-400 font-medium">
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span>In progress</span>
                              </span>
                            )}
                            {task.status?.stage === 'completed' && (
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>
                                  {task.actual_minutes !== null && task.actual_minutes !== undefined
                                    ? `${task.actual_minutes}m`
                                    : 'Done'}
                                </span>
                              </span>
                            )}
                            {task.due_date && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span>{task.due_date.substring(0, 10)}</span>
                              </span>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                              <span
                                className="flex items-center gap-1 text-slate-400 font-mono"
                                title={`${task.attachments.length} attachment(s)`}
                              >
                                <Paperclip className="w-3 h-3 text-indigo-400" />
                                <span>{task.attachments.length}</span>
                              </span>
                            )}
                          </div>

                          {/* Quick transition action */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1"
                          >
                            <select
                              value={task.status_id}
                              onChange={(e) => handleQuickMove(task, Number(e.target.value))}
                              className="text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 hover:text-white focus:outline-none"
                            >
                              {displayStatuses.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move to: {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
