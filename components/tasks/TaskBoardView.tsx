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
  Plus,
  Inbox,
  Sparkles,
  Paperclip,
  GitFork,
  Loader2,
  User,
  Building2,
} from 'lucide-react';

interface Props {
  onEditTask: (task: Task) => void;
  onAddTask: (statusId?: number, isQuickCreate?: boolean) => void;
}

const PRIORITY_BADGES: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  Low: { bg: 'bg-slate-800/80', text: 'text-slate-300', dot: 'bg-slate-400' },
  Normal: { bg: 'bg-blue-950/60', text: 'text-blue-300', dot: 'bg-blue-400' },
  High: { bg: 'bg-amber-950/60', text: 'text-amber-300', dot: 'bg-amber-400' },
  Urgent: { bg: 'bg-rose-950/60', text: 'text-rose-300', dot: 'bg-rose-400' },
};

export default function TaskBoardView({ onEditTask, onAddTask }: Props) {
  const { t } = useTranslation();
  const { canCreateTask, user } = useAuth();
  const {
    tasks,
    statuses,
    updateTask,
    searchQuery,
    statusTasksMap,
    loadMoreForStatus,
    activeStatusId,
    setActiveStatusId,
    isOtherProject,
  } = useTasks();

  // Collapsible columns state (accordion/dropdown per status)
  const [collapsedColumns, setCollapsedColumns] = React.useState<Record<number, boolean>>({});

  const toggleColumnCollapse = (statusId: number) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [statusId]: !prev[statusId],
    }));
  };

  // Filter tasks by search query if any
  const filteredTasks = tasks.filter((tItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tItem.title.toLowerCase().includes(q) ||
      (tItem.description && tItem.description.toLowerCase().includes(q))
    );
  });

  // Default fallback columns if backend returned 0 statuses
  const displayStatuses: TaskStatus[] =
    statuses.length > 0
      ? statuses
      : [
          { id: 1, name: t('to_do'), stage: 'pending', color: '#94a3b8', order: 1 },
          { id: 2, name: t('in_progress'), stage: 'working', color: '#3b82f6', order: 2 },
          { id: 3, name: t('completed'), stage: 'completed', color: '#22c55e', order: 3 },
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

  // Automatically scroll into view when activeStatusId is selected
  React.useEffect(() => {
    if (activeStatusId !== null) {
      scrollToColumn(activeStatusId);
    }
  }, [activeStatusId]);

  const handleQuickMove = async (task: Task, newStatusId: number) => {
    try {
      await updateTask(task.id, { status_id: newStatusId });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  // Infinite scroll on scroll down inside each status column
  const handleColumnScroll = (e: React.UIEvent<HTMLDivElement>, statusId: number) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Guard against firing when list doesn't have overflow or hasn't been scrolled
    if (scrollHeight > clientHeight + 30 && scrollHeight - scrollTop - clientHeight < 75) {
      loadMoreForStatus(statusId);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Status Tabs for fast 1-tap switching */}
      <div className="flex sm:hidden items-center gap-1.5 px-3 pt-3 pb-1 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800/50 bg-slate-950/40">
        <button
          type="button"
          onClick={() => setActiveStatusId(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
            activeStatusId === null
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {t('all_statuses') || 'الكل'}
        </button>
        {displayStatuses.map((status) => {
          const statusState = statusTasksMap[status.id];
          const count = statusState?.total ?? status.tasks_count ?? filteredTasks.filter((taskItem) => taskItem.status_id === status.id).length;
          const isActive = activeStatusId === status.id;
          return (
            <button
              key={status.id}
              type="button"
              onClick={() => {
                setActiveStatusId(isActive ? null : status.id);
                scrollToColumn(status.id);
              }}
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
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Status Filter Notice & Reset Banner */}
      {activeStatusId !== null && (
        <div className="mx-3 sm:mx-6 mt-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: statuses.find((s) => s.id === activeStatusId)?.color || '#6366f1' }}
            />
            <span className="text-slate-200 truncate">
              {t('filtered_by_status') || 'تم تحديد الحالة'}: <strong className="text-white font-bold">{statuses.find((s) => s.id === activeStatusId)?.name || `#${activeStatusId}`}</strong> (تم تقليص باقي الحالات)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveStatusId(null)}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shrink-0 shadow-sm"
          >
            {t('show_all_statuses') || 'عرض كل الحالات'}
          </button>
        </div>
      )}

      {/* Other Project Notice: User only sees their created tasks and creates tasks from top bar button */}
      {isOtherProject && (
        <div className="mx-3 sm:mx-6 mt-3 px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {t('viewing_own_tasks_in_other_project') ||
                'عرض مهامك المنشأة فقط في هذا القسم. لإنشاء مهمة جديدة، استخدم زر "+ مهمة جديدة" بالأعلى.'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 shrink-0">
            {filteredTasks.length} {t('tasks') || 'مهام'}
          </span>
        </div>
      )}

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-6 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-3 sm:gap-6 min-w-max items-start">
          {displayStatuses.map((status) => {
            const statusState = statusTasksMap[status.id];
            const columnTasks = statusState
              ? statusState.tasks
              : filteredTasks.filter((taskItem) => taskItem.status_id === status.id);
            const totalCount = statusState?.total ?? status.tasks_count ?? columnTasks.length;
            const hasMore = statusState?.hasMore ?? false;
            const isLoadingMore = statusState?.isLoadingMore ?? false;
            const isInitialLoading = statusState?.isLoading && columnTasks.length === 0;
            // When activeStatusId is selected, shrink all OTHER columns
            const isCollapsed = activeStatusId !== null ? status.id !== activeStatusId : !!collapsedColumns[status.id];

            if (isCollapsed) {
              return (
                <div
                  key={status.id}
                  ref={(el) => {
                    columnRefs.current[status.id] = el;
                  }}
                  className="w-16 sm:w-18 shrink-0 snap-center task-board-column bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col items-center py-4 max-h-[calc(100dvh-170px)] sm:max-h-[calc(100vh-180px)] backdrop-blur-sm cursor-pointer hover:border-indigo-500/40 transition-all select-none"
                  onClick={() => {
                    if (activeStatusId !== null) {
                      setActiveStatusId(status.id);
                    } else {
                      toggleColumnCollapse(status.id);
                    }
                  }}
                  title={`${status.name} (${totalCount}) - Click to expand`}
                >
                  <div className="flex flex-col items-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeStatusId !== null) {
                          setActiveStatusId(status.id);
                        } else {
                          toggleColumnCollapse(status.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={t('expand_status') || 'Expand'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                      style={{ backgroundColor: status.color || '#6366f1' }}
                    />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {totalCount}
                    </span>
                    <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-semibold text-slate-300 tracking-wider mt-2 truncate max-h-48">
                      {status.name}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={status.id}
                ref={(el) => {
                  columnRefs.current[status.id] = el;
                }}
                className="w-[85vw] max-w-[340px] sm:w-80 shrink-0 snap-center task-board-column bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col max-h-[calc(100dvh-170px)] sm:max-h-[calc(100vh-180px)] backdrop-blur-sm transition-all"
              >
                {/* Column Header */}
                <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeStatusId !== null) {
                          setActiveStatusId(null);
                        } else {
                          toggleColumnCollapse(status.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                      title={activeStatusId !== null ? 'إلغاء تقليص باقي الحالات (عرض الكل)' : (t('collapse_status') || 'Collapse')}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10 shrink-0"
                      style={{ backgroundColor: status.color || '#6366f1' }}
                    />
                    <h3 className="text-sm font-semibold text-white tracking-wide truncate">
                      {status.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 shrink-0">
                      #{status.id}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                      {columnTasks.length}{totalCount !== columnTasks.length ? ` / ${totalCount}` : ''}
                    </span>
                  </div>

                  {/* '+' button to create task directly under this status (disabled for other projects) */}
                  {canCreateTask && !isOtherProject && (
                    <button
                      type="button"
                      onClick={() => onAddTask(status.id, false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-1"
                      title={t('create_new_task')}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Tasks List with Scroll Down Infinite Pagination */}
                <div
                  className="p-3 overflow-y-auto flex-1 space-y-3"
                  onScroll={(e) => handleColumnScroll(e, status.id)}
                >
                  {isInitialLoading ? (
                    <div className="py-12 px-4 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                      <p className="text-xs">{t('loading_more_tasks')}</p>
                    </div>
                  ) : columnTasks.length === 0 ? (
                    <div className="py-12 px-4 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 opacity-40" />
                      <p className="text-xs">{t('no_tasks_in_column', { status: status.name })}</p>
                      {/* Only show create first task if user has create permission and not viewing other project */}
                      {canCreateTask && !isOtherProject && (
                        <button
                          type="button"
                          onClick={() => onAddTask(status.id, false)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          {t('create_first_task')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {columnTasks.map((task) => {
                        const priorityConfig =
                          PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Normal;

                        const userRespIds = (user?.user_type?.respnsapity || []).map((r) => Number(r));
                        const isResponsible =
                          task.respnsapity === 1 ||
                          task.responsibility === 1 ||
                          Boolean(task.task_type_id && userRespIds.includes(task.task_type_id));

                        const hasChildren =
                          (task.children && task.children.length > 0) ||
                          (task.subtasks_count !== undefined && task.subtasks_count > 0);
                        const childrenCount =
                          task.children?.length ?? task.subtasks_count ?? 0;

                        return (
                          <div
                            key={task.id}
                            onClick={() => onEditTask(task)}
                            className={`group rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden ${
                              hasChildren
                                ? 'border-b-[5px] border-b-indigo-500/70 shadow-md shadow-indigo-950/30'
                                : ''
                            } ${
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
                                  {t(`priority_${task.priority.toLowerCase()}` as any) || task.priority}
                                </span>
                                {task.task_type && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/80">
                                    {task.task_type.name}
                                  </span>
                                )}
                                {isResponsible && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 border border-indigo-400/50 flex items-center gap-1 shadow-sm">
                                    <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                                    {t('responsible')}
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

                            {/* Creator & Department / Project info on card */}
                            <div className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between gap-1 text-[11px] text-slate-400 pl-1">
                              <span className="flex items-center gap-1.5 truncate text-slate-300">
                                <User className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span className="truncate max-w-[110px]" title={task.creator?.name || 'System'}>
                                  {task.creator?.name || 'System'}
                                </span>
                              </span>
                              {(task.creator?.department || task.creator?.project_name || task.project?.name) && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 truncate max-w-[130px]"
                                  title={task.creator?.department || task.creator?.project_name || task.project?.name || undefined}
                                >
                                  <Building2 className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                                  <span className="truncate">
                                    {task.creator?.department || task.creator?.project_name || task.project?.name}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Lifecycle Metrics */}
                            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 pl-1">
                              <div className="flex items-center gap-2">
                                {task.status?.stage === 'working' && (
                                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                                    <Clock className="w-3 h-3 animate-pulse" />
                                    <span>{t('in_progress')}</span>
                                  </span>
                                )}
                                {task.status?.stage === 'completed' && (
                                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>
                                      {task.actual_minutes !== null && task.actual_minutes !== undefined
                                        ? `${task.actual_minutes} ${t('mins')}`
                                        : t('completed')}
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
                                      {t('move_to')}: {s.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Requirement: Children / Subtasks Header Indicator on Card */}
                            {hasChildren && (
                              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs pl-1">
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
                          </div>
                        );
                      })}

                      {/* Infinite Scroll Indicator at bottom of column */}
                      {isLoadingMore && (
                        <div className="py-2.5 flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono animate-fadeIn">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('loading_more_tasks')}</span>
                        </div>
                      )}

                      {/* Manual fallback load more button */}
                      {hasMore && !isLoadingMore && (
                        <button
                          type="button"
                          onClick={() => loadMoreForStatus(status.id)}
                          className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium rounded-xl hover:bg-indigo-950/30 border border-dashed border-indigo-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>{t('load_more')}</span>
                        </button>
                      )}

                      {!hasMore && columnTasks.length > 4 && (
                        <div className="py-1.5 text-center text-[10px] text-slate-500 font-mono">
                          {t('all_tasks_loaded', { count: totalCount })}
                        </div>
                      )}
                    </>
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
