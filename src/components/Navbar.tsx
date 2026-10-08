import React from 'react';
import {
  Sparkles,
  Plus,
  Moon,
  Sun,
  Shield,
  Palette,
  History,
  BookOpen,
  LogOut,
  LogIn,
  BrainCircuit,
  Search,
} from 'lucide-react';
import { CompanyBranding, UserProfile } from '../types';
import { COLOR_SCHEMES } from '../lib/theme';

interface NavbarProps {
  branding: CompanyBranding;
  user: UserProfile | null;
  theme: 'dark' | 'light';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleTheme: () => void;
  onOpenNewPrompt: () => void;
  onOpenAILab: () => void;
  onOpenBranding: () => void;
  onOpenActivityLogs: () => void;
  onOpenDocs: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  activeView: 'gallery' | 'ailab';
  setActiveView: (view: 'gallery' | 'ailab') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  branding,
  user,
  theme,
  searchQuery,
  onSearchChange,
  onToggleTheme,
  onOpenNewPrompt,
  onOpenAILab,
  onOpenBranding,
  onOpenActivityLogs,
  onOpenDocs,
  onOpenProfile,
  onOpenAuth,
  onSignOut,
  activeView,
  setActiveView,
}) => {
  const colorScheme = COLOR_SCHEMES[branding.primaryColor] || COLOR_SCHEMES.indigo;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('gallery')}>
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="w-9 h-9 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${colorScheme.gradient} flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/10`}
              >
                <BrainCircuit className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  {branding.companyName}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Private Hub
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Powered by Apex Web Studio India
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block line-clamp-1 max-w-[280px]">
                {branding.tagline}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search prompts by keyword, tag, or variable..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => setActiveView('gallery')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeView === 'gallery'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Prompts
              </button>
              <button
                onClick={() => setActiveView('ailab')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeView === 'ailab'
                    ? `${colorScheme.primary} shadow-sm font-semibold`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Lab</span>
                <span className="hidden lg:inline text-[9px] uppercase px-1 py-0.2 rounded bg-white/20 font-bold">
                  High Thinking
                </span>
              </button>
            </div>

            {/* Create Prompt button */}
            <button
              onClick={onOpenNewPrompt}
              className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${colorScheme.primary}`}
            >
              <Plus className="w-4 h-4" />
              <span>New Prompt</span>
            </button>

            {/* Admin / Utility Menu Items */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              {user?.role === 'admin' && (
                <button
                  onClick={onOpenBranding}
                  title="Branding & Organization Settings"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onOpenActivityLogs}
                title="Activity Audit Log"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <History className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDocs}
                title="Deployment & Self-Hosting Docs"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>

            {/* User Account / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 leading-none">
                      {user.displayName}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 leading-none">
                      {user.role}
                    </span>
                  </div>
                </button>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 pt-1 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
