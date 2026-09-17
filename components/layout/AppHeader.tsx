'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { API_URLS } from '@/lib/config';
import { TaskPriority } from '@/types/api';
import {
  Briefcase,
  ChevronDown,
  FolderPlus,
  Kanban,
  Layers,
  List,
  LogOut,
  Plus,
  Search,
  Server,
  User as UserIcon,
  Filter,
} from 'lucide-react';

interface Props {
  viewMode: 'board' | 'list';
  onToggleViewMode: (mode: 'board' | 'list') => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenNewWorkspace: () => void;
}

export default function AppHeader({
  viewMode,
  onToggleViewMode,
  onOpenNewTask,
  onOpenNewProject,
  onOpenNewWorkspace,
}: Props) {
  const { user, logout, activeApiUrl, switchApiUrl } = useAuth();
  const {
    workspaces,
    projects,
    activeWorkspaceId,
    setActiveWorkspaceId,
    activeProjectId,
    setActiveProjectId,
    activePriority,
    setActivePriority,
    searchQuery,
    setSearchQuery,
  } = useTasks();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showApiMenu, setShowApiMenu] = useState(false);

  const isLocal = activeApiUrl.includes('127.0.0.1') || activeApiUrl.includes('localhost');

  const priorities: (TaskPriority | 'All')[] = ['All', 'Urgent', 'High', 'Normal', 'Low'];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Workspace/Project selection */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                Tasker
              </div>
              <div className="text-[10px] text-slate-400 font-mono -mt-0.5">ClickUp-like System</div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Project dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden lg:inline">Project:</span>
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onOpenNewProject}
              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Create new project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Workspace dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden lg:inline">Workspace:</span>
            <select
              value={activeWorkspaceId || ''}
              onChange={(e) => setActiveWorkspaceId(e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">All Workspaces</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onOpenNewWorkspace}
              className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Create new workspace"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Search and filters */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or details..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Priority filter */}
          <select
            value={activePriority || 'All'}
            onChange={(e) =>
              setActivePriority(e.target.value === 'All' ? null : (e.target.value as TaskPriority))
            }
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors hidden sm:block"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions, View Mode, Environment, User Profile */}
        <div className="flex items-center gap-3">
          {/* View toggle (Board vs List) */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => onToggleViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* API Backend Environment Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowApiMenu(!showApiMenu)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-mono flex items-center gap-1.5 text-slate-300 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLocal ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                }`}
              />
              <span className="hidden md:inline">
                {isLocal ? '127.0.0.1:8000' : 'almuder.com'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showApiMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                <div className="p-2 border-b border-slate-800 text-slate-400 font-medium">
                  Active API Endpoint
                </div>
                <button
                  type="button"
                  onClick={() => {
                    switchApiUrl(API_URLS.LOCAL);
                    setShowApiMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${
                    isLocal ? 'bg-indigo-950/60 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div>Local API</div>
                    <div className="text-[10px] text-slate-400 font-mono">http://127.0.0.1:8000/api</div>
                  </div>
                  {isLocal && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchApiUrl(API_URLS.REMOTE);
                    setShowApiMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${
                    !isLocal ? 'bg-indigo-950/60 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div>Production API</div>
                    <div className="text-[10px] text-slate-400 font-mono">https://tasker-api.almuder.com/api</div>
                  </div>
                  {!isLocal && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </button>
              </div>
            )}
          </div>

          {/* New Task Button */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                <div className="p-2 border-b border-slate-800">
                  <div className="font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left p-2 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
