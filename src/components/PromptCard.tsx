import React, { useState } from 'react';
import {
  Copy,
  Check,
  Heart,
  Sparkles,
  Award,
  ShieldCheck,
  Bot,
  User,
  ArrowUpRight,
  Terminal,
} from 'lucide-react';
import { PromptItem, BrandColor } from '../types';
import { COLOR_SCHEMES } from '../lib/theme';

interface PromptCardProps {
  prompt: PromptItem;
  primaryColor: BrandColor;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectPrompt: (prompt: PromptItem) => void;
  onOpenInLab: (prompt: PromptItem) => void;
  onCopyPrompt: (prompt: PromptItem) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  primaryColor,
  isFavorited,
  onToggleFavorite,
  onSelectPrompt,
  onOpenInLab,
  onCopyPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const colorScheme = COLOR_SCHEMES[primaryColor] || COLOR_SCHEMES.indigo;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    onCopyPrompt(prompt);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id);
  };

  const handleLabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenInLab(prompt);
  };

  return (
    <div
      onClick={() => onSelectPrompt(prompt)}
      className="group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-950/40"
    >
      <div>
        {/* Header Badges & Model tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${colorScheme.badgeBg}`}>
              {prompt.category}
            </span>

            {prompt.isStaffPick && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                <Award className="w-3 h-3" />
                Staff Pick
              </span>
            )}

            {prompt.isVerified && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-1 p-1.5 rounded-lg text-xs transition-colors ${
              isFavorited
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            <span className="text-xs font-medium">{prompt.favoritesCount}</span>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {prompt.description}
        </p>

        {/* Target Tools Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {prompt.targetTools?.slice(0, 3).map(tool => (
            <span
              key={tool}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Bot className="w-3 h-3 opacity-70" />
              {tool}
            </span>
          ))}
          {prompt.targetTools?.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">+{prompt.targetTools.length - 3}</span>
          )}
        </div>

        {/* Variable chips preview */}
        {prompt.variables && prompt.variables.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">
              <Terminal className="w-3 h-3" />
              <span>Inputs & Variables:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {prompt.variables.slice(0, 3).map(v => (
                <span
                  key={v}
                  className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/60"
                >
                  {`{{${v}}}`}
                </span>
              ))}
              {prompt.variables.length > 3 && (
                <span className="text-[10px] text-slate-400 font-mono py-0.5">
                  +{prompt.variables.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {prompt.authorName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="line-clamp-1 max-w-[100px] text-[11px]">{prompt.authorName}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Test in Thinking AI Lab */}
          <button
            onClick={handleLabClick}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Benchmark in Gemini 3.1 Pro Thinking Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline text-[11px]">Test</span>
          </button>

          {/* Quick Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700"
            title="Copy template to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
