'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URLS } from '@/lib/config';
import { getErrorMessage } from '@/lib/api';
import {
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function AuthScreen() {
  const { login, register, activeApiUrl, switchApiUrl } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLocal = activeApiUrl.includes('127.0.0.1') || activeApiUrl.includes('localhost');
  const isDev = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== passwordConfirmation) {
          throw new Error('Passwords do not match');
        }
        await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (isRegister) {
      setName('Demo User');
      setPasswordConfirmation(demoPass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: API Environment Indicator & Switcher (Shown in Development Only) */}
      {isDev && (
        <div className="w-full max-w-md mb-4 flex items-center justify-between text-xs px-1 sm:px-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-mono truncate max-w-[130px] sm:max-w-[200px]" title={activeApiUrl}>
              {isLocal ? 'Local Backend (8000)' : 'Production Cloud API'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => switchApiUrl(API_URLS.LOCAL)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                isLocal
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Local
            </button>
            <button
              type="button"
              onClick={() => switchApiUrl(API_URLS.REMOTE)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                !isLocal
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Remote
            </button>
          </div>
        </div>
      )}

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/tasker_logo.jpg"
              alt="Tasker Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-indigo-500/25 border border-indigo-500/30"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Tasker <span className="text-indigo-400 text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">API v1</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isRegister
              ? 'Create your workspace account to start managing tasks'
              : 'Sign in to access your projects, workspaces and tasks'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@tasker.test"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Need test credentials?</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillDemo('admin@admin.com', '123456789')}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              Admin (admin@admin.com)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user@user.com', '123456789')}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              User (user@user.com)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('jane@tasker.test', 'Password123!')}
              className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
            >
              Remote Jane
            </button>
          </div>
        </div>
      </div>

      {/* Feature Badges below card */}
      <div className="w-full max-w-md mt-6 grid grid-cols-3 gap-2 text-center text-slate-400 text-[11px]">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-2.5 flex flex-col items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sanctum Tokens</span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-2.5 flex flex-col items-center gap-1">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Time Tracking</span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-2.5 flex flex-col items-center gap-1">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Workspaces & Tasks</span>
        </div>
      </div>
    </div>
  );
}
