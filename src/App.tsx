/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Filter,
  Layers,
  Heart,
  Award,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Bot,
  Search,
  BookOpen,
} from 'lucide-react';
import { auth, testConnection } from './lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {
  PromptItem,
  UserProfile,
  CompanyBranding,
  PromptCategory,
  TargetAiTool,
} from './types';
import {
  fetchAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  recordPromptCopy,
  toggleFavoritePrompt,
  fetchUserFavoriteIds,
} from './services/promptService';
import { getUserProfile, upsertUserProfile } from './services/userService';
import { getCompanyBranding, updateCompanyBranding, DEFAULT_BRANDING } from './services/brandingService';
import { COLOR_SCHEMES } from './lib/theme';

import { Navbar } from './components/Navbar';
import { PromptCard } from './components/PromptCard';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptEditorModal } from './components/PromptEditorModal';
import { AIPromptLab } from './components/AIPromptLab';
import { BrandingModal } from './components/BrandingModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ActivityLogModal } from './components/ActivityLogModal';
import { AuthModal } from './components/AuthModal';
import { DocumentationModal } from './components/DocumentationModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('promptvault_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Organization Branding state
  const [branding, setBranding] = useState<CompanyBranding>(DEFAULT_BRANDING);

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);

  // App Navigation view
  const [activeView, setActiveView] = useState<'gallery' | 'ailab'>('gallery');

  // Prompts & Favorites state
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTool, setSelectedTool] = useState<string>('All Tools');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyStaffPicks, setOnlyStaffPicks] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'copies'>('popular');

  // Modal states
  const [selectedPromptForDetail, setSelectedPromptForDetail] = useState<PromptItem | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isActivityLogsOpen, setIsActivityLogsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Lab deep link state
  const [labPrompt, setLabPrompt] = useState<PromptItem | null>(null);
  const [labVariables, setLabVariables] = useState<Record<string, string>>({});

  // Sync theme to HTML root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('promptvault_theme', theme);
  }, [theme]);

  // Initial boot: Test Firestore connection and load data
  useEffect(() => {
    testConnection();

    // Load Branding
    getCompanyBranding().then(b => setBranding(b));

    // Listen to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        let profile = await getUserProfile(fbUser.uid);
        if (!profile) {
          profile = await upsertUserProfile({
            uid: fbUser.uid,
            email: fbUser.email || 'employee@company.internal',
            displayName: fbUser.displayName || 'Team Member',
            photoURL: fbUser.photoURL || '',
          });
        }
        setUser(profile);
        if (profile.themePreference && profile.themePreference !== 'system') {
          setTheme(profile.themePreference);
        }
        const favs = await fetchUserFavoriteIds(fbUser.uid);
        setFavoriteIds(favs);
      } else {
        // Fallback demo user for immediate instant exploration
        setUser({
          uid: 'demo_sarah_connor',
          email: 'sarah.connor@acme.internal',
          displayName: 'Sarah Connor',
          role: 'admin',
          department: 'Engineering',
          themePreference: 'dark',
          defaultAiTool: 'All Tools',
          emailNotifications: true,
        });
      }
    });

    // Load Prompts
    loadPrompts();

    return () => unsubscribe();
  }, []);

  const loadPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const data = await fetchAllPrompts();
      setPrompts(data);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFavoriteIds(new Set());
  };

  // Favorite toggle handler
  const handleToggleFavorite = async (promptId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const isCurrentlyFav = favoriteIds.has(promptId);
    const newStatus = await toggleFavoritePrompt(user.uid, promptId, isCurrentlyFav);

    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (newStatus) next.add(promptId);
      else next.delete(promptId);
      return next;
    });

    // Update in local state
    setPrompts(prev =>
      prev.map(p => {
        if (p.id === promptId) {
          return {
            ...p,
            favoritesCount: Math.max(0, p.favoritesCount + (newStatus ? 1 : -1)),
          };
        }
        return p;
      })
    );
  };

  // Open prompt in AI Lab
  const handleOpenInLab = (prompt: PromptItem, filledVars?: Record<string, string>) => {
    setLabPrompt(prompt);
    if (filledVars) {
      setLabVariables(filledVars);
    }
    setSelectedPromptForDetail(null);
    setActiveView('ailab');
  };

  // Save/Create prompt from editor or lab
  const handleSavePrompt = async (promptData: any) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, promptData);
      setPrompts(prev =>
        prev.map(p => (p.id === editingPrompt.id ? { ...p, ...promptData, updatedAt: new Date().toISOString() } : p))
      );
      setEditingPrompt(null);
    } else {
      const created = await createPrompt(promptData);
      setPrompts(prev => [created, ...prev]);
    }
    setIsEditorOpen(false);
  };

  const handleDeletePrompt = async (prompt: PromptItem) => {
    if (window.confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      await deletePrompt(prompt.id, prompt.title);
      setPrompts(prev => prev.filter(p => p.id !== prompt.id));
      setSelectedPromptForDetail(null);
    }
  };

  const handleCopyPrompt = async (prompt: PromptItem) => {
    await recordPromptCopy(prompt.id);
    setPrompts(prev =>
      prev.map(p => (p.id === prompt.id ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p))
    );
  };

  // Save branding updates
  const handleSaveBranding = async (newBranding: Partial<CompanyBranding>) => {
    if (!user || user.role !== 'admin') return;
    await updateCompanyBranding(newBranding, user.uid);
    setBranding(prev => ({ ...prev, ...newBranding }));
  };

  // Save user profile updates
  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await upsertUserProfile({
      uid: user.uid,
      email: user.email,
      ...updates,
    });
    setUser(updated);
    if (updated.themePreference && updated.themePreference !== 'system') {
      setTheme(updated.themePreference);
    }
  };

  // Categories list
  const categories: (string | PromptCategory)[] = [
    'All',
    'Engineering',
    'Product',
    'Marketing',
    'Sales',
    'Customer Support',
    'Legal',
    'Operations',
  ];

  const toolsList: TargetAiTool[] = [
    'All Tools',
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
  ];

  // Filtered and sorted prompts
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter(p => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesText = p.promptText.toLowerCase().includes(q);
          const matchesTags = p.tags?.some(t => t.toLowerCase().includes(q));
          const matchesVars = p.variables?.some(v => v.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesText && !matchesTags && !matchesVars) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Tool
        if (selectedTool !== 'All Tools' && !p.targetTools?.includes(selectedTool)) {
          return false;
        }

        // Toggles
        if (onlyFavorites && !favoriteIds.has(p.id)) {
          return false;
        }
        if (onlyStaffPicks && !p.isStaffPick) {
          return false;
        }
        if (onlyVerified && !p.isVerified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.favoritesCount || 0) - (a.favoritesCount || 0);
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'rating') return (b.ratingAverage || 0) - (a.ratingAverage || 0);
        if (sortBy === 'copies') return (b.copyCount || 0) - (a.copyCount || 0);
        return 0;
      });
  }, [prompts, searchQuery, selectedCategory, selectedTool, onlyFavorites, onlyStaffPicks, onlyVerified, sortBy, favoriteIds]);

  const colorScheme = COLOR_SCHEMES[branding.primaryColor] || COLOR_SCHEMES.indigo;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        branding={branding}
        user={user}
        theme={theme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleTheme={handleToggleTheme}
        onOpenNewPrompt={() => {
          setEditingPrompt(null);
          setIsEditorOpen(true);
        }}
        onOpenAILab={() => setActiveView('ailab')}
        onOpenBranding={() => setIsBrandingOpen(true)}
        onOpenActivityLogs={() => setIsActivityLogsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1">
        {activeView === 'ailab' ? (
          <AIPromptLab
            primaryColor={branding.primaryColor}
            initialPrompt={labPrompt}
            initialVariables={labVariables}
            onSaveToLibrary={promptData => {
              handleSavePrompt(promptData);
              setActiveView('gallery');
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Hero Welcome Announcement */}
            <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Private Organization AI Hub</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {branding.companyName}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {branding.welcomeMessage || 'Team AI Prompt Library & Benchmarks'}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    A centralized, self-hosted catalog of battle-tested prompts for ChatGPT, Claude, and Gemini. Search, test variables with 1-click substitution, or benchmark in the High Thinking AI Lab.
                  </p>
                </div>

                {/* Hub Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center">
                    <span className="text-xl font-bold text-slate-900 dark:text-white block">
                      {prompts.length}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Curated Prompts
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center">
                    <span className="text-xl font-bold text-indigo-500 block">
                      3.1 Pro
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      High Thinking Lab
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? `${colorScheme.primary} shadow-sm`
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sub-Filters: AI Tool, Toggles, and Sorting */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {/* AI Model Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <Bot className="w-4 h-4 text-slate-400 ml-1 mr-1 flex-shrink-0" />
                  {toolsList.map(tool => (
                    <button
                      key={tool}
                      onClick={() => setSelectedTool(tool)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                        selectedTool === tool
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>

                {/* Badges Filter & Sorting */}
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <button
                    onClick={() => setOnlyFavorites(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      onlyFavorites
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500' : ''}`} />
                    <span>Favorited</span>
                  </button>

                  <button
                    onClick={() => setOnlyStaffPicks(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      onlyStaffPicks
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Staff Picks</span>
                  </button>

                  <button
                    onClick={() => setOnlyVerified(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      onlyVerified
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </button>

                  {/* Sort selector */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Top Rated</option>
                    <option value="copies">Most Copied</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Prompt Cards Grid */}
            {loadingPrompts ? (
              <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center">
                <BrainCircuit className="w-8 h-8 animate-pulse text-indigo-500 mb-3" />
                <span className="text-xs font-medium">Synchronizing organization prompt repository...</span>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8">
                <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No matching prompts found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Try adjusting your search criteria, clearing filter toggles, or submit a new prompt for your team.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedTool('All Tools');
                    setOnlyFavorites(false);
                    setOnlyStaffPicks(false);
                    setOnlyVerified(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    primaryColor={branding.primaryColor}
                    isFavorited={favoriteIds.has(prompt.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectPrompt={p => setSelectedPromptForDetail(p)}
                    onOpenInLab={p => handleOpenInLab(p)}
                    onCopyPrompt={handleCopyPrompt}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {branding.companyName}
            </span>
            <span>• Private Enterprise AI Prompt Vault</span>
            <span className="hidden md:inline">•</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              Powered by <strong className="font-bold text-indigo-600 dark:text-indigo-400">Apex Web Studio India</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-indigo-500 transition-colors"
            >
              Self-Hosting & Docker Docs
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engine: <strong className="text-indigo-400">Gemini 3.1 Pro High Thinking</strong>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedPromptForDetail && (
        <PromptDetailModal
          prompt={selectedPromptForDetail}
          user={user}
          primaryColor={branding.primaryColor}
          isFavorited={favoriteIds.has(selectedPromptForDetail.id)}
          onClose={() => setSelectedPromptForDetail(null)}
          onToggleFavorite={handleToggleFavorite}
          onOpenInLab={handleOpenInLab}
          onEditPrompt={p => {
            setSelectedPromptForDetail(null);
            setEditingPrompt(p);
            setIsEditorOpen(true);
          }}
          onDeletePrompt={handleDeletePrompt}
          onRecordCopy={handleCopyPrompt}
        />
      )}

      {isEditorOpen && (
        <PromptEditorModal
          initialPrompt={editingPrompt}
          user={user}
          primaryColor={branding.primaryColor}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingPrompt(null);
          }}
          onSave={handleSavePrompt}
        />
      )}

      {isBrandingOpen && (
        <BrandingModal
          currentBranding={branding}
          onClose={() => setIsBrandingOpen(false)}
          onSave={handleSaveBranding}
        />
      )}

      {isProfileOpen && user && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {isActivityLogsOpen && (
        <ActivityLogModal onClose={() => setIsActivityLogsOpen(false)} />
      )}

      {isAuthOpen && (
        <AuthModal
          branding={branding}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={async profile => {
            const saved = await upsertUserProfile(profile);
            setUser(saved);
          }}
        />
      )}

      {isDocsOpen && (
        <DocumentationModal onClose={() => setIsDocsOpen(false)} />
      )}
    </div>
  );
}
