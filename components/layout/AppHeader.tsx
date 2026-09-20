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
  Settings,
  Sun,
  Moon,
  User as UserIcon,
  Filter,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import SettingsModal from '@/components/modals/SettingsModal';
import { useTheme } from '@/context/ThemeContext';

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
  const { themeMode, toggleTheme, isLight } = useTheme();
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isLocal = activeApiUrl.includes('127.0.0.1') || activeApiUrl.includes('localhost');
  const isDev = process.env.NODE_ENV === 'development';

  const priorities: (TaskPriority | 'All')[] = ['All', 'Urgent', 'High', 'Normal', 'Low'];

  const currentProjectName =
    projects.find((p) => p.id === activeProjectId)?.name || 'All Projects';
  const currentWorkspaceName =
    workspaces.find((w) => w.id === activeWorkspaceId)?.name || 'All Workspaces';

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md transition-colors">
      {/* Primary Top Bar */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Desktop Project/Workspace selectors */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/tasker_logo.jpg"
              alt="Tasker Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-md shadow-indigo-600/20 border border-indigo-500/30 shrink-0"
            />
            <div>
              <div className="font-bold text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                Tasker
              </div>
              <div className="text-[10px] text-slate-400 font-mono -mt-0.5 truncate max-w-[110px] sm:max-w-[160px] lg:hidden">
                {currentProjectName}
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden xl:block" />

          {/* Desktop Project dropdown */}
          <div className="hidden xl:flex items-center gap-2">
            <span className="text-xs text-slate-400">Project:</span>
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors max-w-[150px] truncate"
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

          {/* Desktop Workspace dropdown */}
          <div className="hidden xl:flex items-center gap-2">
            <span className="text-xs text-slate-400">Workspace:</span>
            <select
              value={activeWorkspaceId || ''}
              onChange={(e) => setActiveWorkspaceId(e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors max-w-[150px] truncate"
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

        {/* Center: Desktop Search and filter */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md mx-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={activePriority || 'All'}
            onChange={(e) =>
              setActivePriority(e.target.value === 'All' ? null : (e.target.value as TaskPriority))
            }
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Priorities' : `${p}`}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions, View Mode, Quick Buttons & Menus */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`p-1.5 sm:p-2 rounded-xl border border-slate-800 transition-colors lg:hidden ${mobileSearchOpen || searchQuery
              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
              : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            title="Toggle search"
            aria-label="Toggle search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* View toggle (Board vs List) */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => onToggleViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'board'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Board</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">List</span>
            </button>
          </div>

          {/* API Switcher Pill (desktop) - shown in development only */}
          {isDev && (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setShowApiMenu(!showApiMenu)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-mono flex items-center gap-1.5 text-slate-300 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${isLocal ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                    }`}
                />
                <span className="hidden lg:inline">
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
                    className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${isLocal
                      ? 'bg-indigo-950/60 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <div>
                      <div>Local</div>
                    </div>
                    {isLocal && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchApiUrl(API_URLS.REMOTE);
                      setShowApiMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${!isLocal
                      ? 'bg-indigo-950/60 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <div>
                      <div>Production</div>
                    </div>
                    {!isLocal && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme Quick Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle color theme"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* New Task Button */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* User Profile Menu (Desktop) */}
          <div className="relative hidden md:block">
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
                    toggleTheme();
                  }}
                  className="w-full text-left p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-between mt-1"
                >
                  <div className="flex items-center gap-2">
                    {isLight ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>Theme: {isLight ? 'Light' : 'Dark'}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">Switch</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 mt-0.5"
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Settings</span>
                </button>
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

          {/* Mobile Drawer Toggle (Hamburger / Close) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors xl:hidden flex items-center justify-center shrink-0"
            title="Navigation Menu"
            aria-label="Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search & Priority Strip */}
      {mobileSearchOpen && (
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/80 lg:hidden flex flex-col sm:flex-row gap-2 animate-fadeIn">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>
          <select
            value={activePriority || 'All'}
            onChange={(e) =>
              setActivePriority(e.target.value === 'All' ? null : (e.target.value as TaskPriority))
            }
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mobile Navigation Drawer / Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="px-4 py-4 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-xl xl:hidden space-y-4 animate-fadeIn shadow-2xl">
          {/* Project & Workspace Selectors for Mobile/Tablet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mobile Project Selector */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                <span className="font-medium">Project</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNewProject();
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={activeProjectId || ''}
                onChange={(e) =>
                  setActiveProjectId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Workspace Selector */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                <span className="font-medium">Workspace</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNewWorkspace();
                  }}
                  className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={activeWorkspaceId || ''}
                onChange={(e) =>
                  setActiveWorkspaceId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Workspaces</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* API Backend Environment Selector for Mobile - shown in development only */}
          {isDev && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-2 font-medium flex items-center justify-between">
                <span>Backend Environment</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {isLocal ? 'Local:8000' : 'Production'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchApiUrl(API_URLS.LOCAL)}
                  className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${isLocal
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Local API</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchApiUrl(API_URLS.REMOTE)}
                  className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${!isLocal
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Production</span>
                </button>
              </div>
            </div>
          )}

          {/* User Profile Card & Actions for Mobile */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-xs text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}

