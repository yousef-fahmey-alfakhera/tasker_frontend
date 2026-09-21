'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TaskProvider, useTasks } from '@/context/TaskContext';
import { I18nProvider } from '@/context/I18nContext';
import AuthScreen from '@/components/auth/AuthScreen';
import AppHeader from '@/components/layout/AppHeader';
import TaskBoardView from '@/components/tasks/TaskBoardView';
import TaskListView from '@/components/tasks/TaskListView';
import TaskDialog from '@/components/tasks/TaskDialog';
import NewProjectModal from '@/components/modals/NewProjectModal';
import NewWorkspaceModal from '@/components/modals/NewWorkspaceModal';
import { Task } from '@/types/api';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

function TaskerContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    error: taskError,
    isLoadingTasks,
    refreshAll,
  } = useTasks();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialStatusId, setInitialStatusId] = useState<number | undefined>(undefined);
  const [isQuickCreate, setIsQuickCreate] = useState<boolean>(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Loading Splash
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <img
          src="/tasker_logo.jpg"
          alt="Tasker Logo"
          className="w-14 h-14 rounded-2xl object-cover border border-indigo-500/30 shadow-lg shadow-indigo-500/20 animate-pulse"
        />
        <div className="flex items-center gap-2 text-xs font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Initializing Tasker workspace...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleOpenNewTask = (statusId?: number, isQuick: boolean = false) => {
    setTaskToEdit(null);
    setInitialStatusId(statusId);
    setIsQuickCreate(isQuick);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsQuickCreate(false);
    setIsTaskDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <AppHeader
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenNewTask={(isQuick) => handleOpenNewTask(undefined, isQuick ?? true)}
        onOpenNewProject={() => setIsProjectModalOpen(true)}
        onOpenNewWorkspace={() => setIsWorkspaceModalOpen(true)}
      />

      {/* Global Error Notice if any */}
      {taskError && (
        <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{taskError}</span>
          </div>
          <button
            type="button"
            onClick={() => refreshAll()}
            className="flex items-center gap-1 text-[11px] text-red-300 hover:text-white px-2 py-0.5 rounded bg-red-900/30 hover:bg-red-900/50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading banner for background task fetches */}
      {isLoadingTasks && (
        <div className="h-0.5 w-full bg-slate-900 overflow-hidden">
          <div className="h-full bg-indigo-500 animate-pulse w-1/3" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'board' ? (
          <TaskBoardView
            onEditTask={handleEditTask}
            onAddTask={(statusId, isQuick) => handleOpenNewTask(statusId, isQuick ?? false)}
          />
        ) : (
          <TaskListView
            onEditTask={handleEditTask}
            onAddTask={() => handleOpenNewTask(undefined, false)}
          />
        )}
      </main>

      {/* Modals */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        taskToEdit={taskToEdit}
        initialStatusId={initialStatusId}
        isQuickCreate={isQuickCreate}
      />

      <NewProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <NewWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <TaskProvider>
            <TaskerContent />
          </TaskProvider>
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
