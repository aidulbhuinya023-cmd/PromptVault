import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Heart,
  Bot,
  User,
  Sliders,
  FileText,
  Lightbulb,
  Edit3,
  Trash2,
  Calendar,
  Share2,
  Terminal,
} from 'lucide-react';
import { PromptItem, UserProfile, BrandColor } from '../types';
import { COLOR_SCHEMES } from '../lib/theme';

interface PromptDetailModalProps {
  prompt: PromptItem;
  user: UserProfile | null;
  primaryColor: BrandColor;
  isFavorited: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenInLab: (prompt: PromptItem, filledVars?: Record<string, string>) => void;
  onEditPrompt: (prompt: PromptItem) => void;
  onDeletePrompt: (prompt: PromptItem) => void;
  onRecordCopy: (prompt: PromptItem) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  user,
  primaryColor,
  isFavorited,
  onClose,
  onToggleFavorite,
  onOpenInLab,
  onEditPrompt,
  onDeletePrompt,
  onRecordCopy,
}) => {
  const colorScheme = COLOR_SCHEMES[primaryColor] || COLOR_SCHEMES.indigo;
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'template' | 'example' | 'tips'>('template');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedFilled, setCopiedFilled] = useState(false);

  const isAuthorOrAdmin = user && (user.uid === prompt.authorId || user.role === 'admin');

  // Compute live compiled prompt with filled variables
  const compiledPrompt = useMemo(() => {
    let result = prompt.promptText;
    prompt.variables.forEach(v => {
      const val = variableValues[v] || `{{${v}}}`;
      const regex = new RegExp(`{{\\s*${v}\\s*}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [prompt.promptText, prompt.variables, variableValues]);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedTemplate(true);
    onRecordCopy(prompt);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleCopyFilled = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopiedFilled(true);
    onRecordCopy(prompt);
    setTimeout(() => setCopiedFilled(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${colorScheme.badgeBg}`}>
                {prompt.category}
              </span>
              {prompt.targetTools?.map(tool => (
                <span
                  key={tool}
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {tool}
                </span>
              ))}
              {prompt.isStaffPick && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Staff Pick
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {prompt.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {prompt.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(prompt.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorited
                  ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
                  : 'text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorited ? 'Favorited' : 'Favorite'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>

            {isAuthorOrAdmin && (
              <>
                <button
                  onClick={() => onEditPrompt(prompt)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Prompt"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeletePrompt(prompt)}
                  className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete Prompt"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Tabs & Main Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Author</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{prompt.authorName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Temperature</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {prompt.temperature !== undefined ? prompt.temperature : 0.7}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Times Copied</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{prompt.copyCount || 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Team Rating</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ★ {prompt.ratingAverage ? prompt.ratingAverage.toFixed(1) : '5.0'} ({prompt.ratingCount || 1})
              </span>
            </div>
          </div>

          {/* Interactive Variable Fill-in Section */}
          {prompt.variables && prompt.variables.length > 0 && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Quick Fill Variables ({prompt.variables.length})
                  </h4>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Fill placeholders to generate your personalized prompt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {prompt.variables.map(v => (
                  <div key={v}>
                    <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {`{{${v}}}`}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${v}...`}
                      value={variableValues[v] || ''}
                      onChange={e =>
                        setVariableValues(prev => ({
                          ...prev,
                          [v]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <button
                  onClick={() => setVariableValues({})}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Clear Inputs
                </button>
                <button
                  onClick={handleCopyFilled}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                >
                  {copiedFilled ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Filled!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Filled Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* System Instruction (if configured) */}
          {prompt.systemInstruction && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Recommended System Instruction
              </span>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {prompt.systemInstruction}
              </p>
            </div>
          )}

          {/* Prompt Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('template')}
              className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'template'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Prompt Body
            </button>
            {prompt.exampleOutput && (
              <button
                onClick={() => setActiveTab('example')}
                className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === 'example'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sample Output
              </button>
            )}
            {prompt.tips && (
              <button
                onClick={() => setActiveTab('tips')}
                className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === 'tips'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Best Practices & Tips
              </button>
            )}
          </div>

          {/* Tab 1: Prompt Template */}
          {activeTab === 'template' && (
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap pr-24">{compiledPrompt}</pre>
            </div>
          )}

          {/* Tab 2: Example Output */}
          {activeTab === 'example' && prompt.exampleOutput && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {prompt.exampleOutput}
            </div>
          )}

          {/* Tab 3: Best Practices & Tips */}
          {activeTab === 'tips' && prompt.tips && (
            <div className="rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-500/5 p-4 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>{prompt.tips}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Tags:</span>
            {prompt.tags?.map(t => (
              <span
                key={t}
                className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenInLab(prompt, variableValues)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-md shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch in High Thinking AI Lab</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
