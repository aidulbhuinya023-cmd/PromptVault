import React, { useState, useEffect } from 'react';
import { X, Sparkles, Terminal, Bot, Sliders, Check, AlertCircle } from 'lucide-react';
import { PromptItem, PromptCategory, UserProfile, BrandColor } from '../types';
import { extractVariables } from '../services/promptService';
import { COLOR_SCHEMES } from '../lib/theme';

interface PromptEditorModalProps {
  initialPrompt?: PromptItem | null;
  user: UserProfile | null;
  primaryColor: BrandColor;
  onClose: () => void;
  onSave: (promptData: any) => Promise<void>;
}

const CATEGORIES: PromptCategory[] = [
  'Engineering',
  'Product',
  'Marketing',
  'Sales',
  'Customer Support',
  'Legal',
  'Operations',
  'HR',
  'Design',
  'General',
];

const AVAILABLE_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DeepSeek'];

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  initialPrompt,
  user,
  primaryColor,
  onClose,
  onSave,
}) => {
  const colorScheme = COLOR_SCHEMES[primaryColor] || COLOR_SCHEMES.indigo;

  const [title, setTitle] = useState(initialPrompt?.title || '');
  const [description, setDescription] = useState(initialPrompt?.description || '');
  const [promptText, setPromptText] = useState(initialPrompt?.promptText || '');
  const [category, setCategory] = useState<PromptCategory>(initialPrompt?.category || 'Engineering');
  const [targetTools, setTargetTools] = useState<string[]>(initialPrompt?.targetTools || ['ChatGPT', 'Claude']);
  const [tagsString, setTagsString] = useState(initialPrompt?.tags?.join(', ') || '');
  const [systemInstruction, setSystemInstruction] = useState(initialPrompt?.systemInstruction || '');
  const [temperature, setTemperature] = useState<number>(initialPrompt?.temperature ?? 0.7);
  const [exampleOutput, setExampleOutput] = useState(initialPrompt?.exampleOutput || '');
  const [tips, setTips] = useState(initialPrompt?.tips || '');
  const [isStaffPick, setIsStaffPick] = useState(initialPrompt?.isStaffPick || false);
  const [isVerified, setIsVerified] = useState(initialPrompt?.isVerified || false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic variable extraction
  const detectedVariables = extractVariables(promptText);

  const toggleTool = (tool: string) => {
    if (targetTools.includes(tool)) {
      if (targetTools.length > 1) {
        setTargetTools(targetTools.filter(t => t !== tool));
      }
    } else {
      setTargetTools([...targetTools, tool]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!promptText.trim()) {
      setError('Prompt text body is required');
      return;
    }

    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        promptText: promptText.trim(),
        category,
        targetTools,
        tags,
        systemInstruction: systemInstruction.trim(),
        temperature,
        exampleOutput: exampleOutput.trim(),
        tips: tips.trim(),
        authorId: user?.uid || 'guest_user',
        authorName: user?.displayName || 'Team Member',
        authorEmail: user?.email || '',
        authorPhotoURL: user?.photoURL || '',
        isStaffPick: user?.role === 'admin' ? isStaffPick : false,
        isVerified: user?.role === 'admin' ? isVerified : false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialPrompt ? 'Edit Team Prompt' : 'Submit Team Prompt'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Share high-impact, tested prompt templates with your organization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Prompt Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Software Engineer: PR Architecture & Security Review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category & AI Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PromptCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target AI Models *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TOOLS.map(tool => {
                  const selected = targetTools.includes(tool);
                  return (
                    <button
                      type="button"
                      key={tool}
                      onClick={() => toggleTool(tool)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                        selected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Short Description / Summary
            </label>
            <textarea
              rows={2}
              placeholder="Explain when to use this prompt and what outcome it delivers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Prompt Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Prompt Template Body *
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Use <code className="text-indigo-500 font-mono font-bold">{'{{variable_name}}'}</code> for replaceable inputs
              </span>
            </div>
            <textarea
              rows={9}
              required
              placeholder="Paste or write your prompt template here. Example:&#10;You are a Principal Architect. Review the following code diff for {{service_name}} with SLA {{latency_sla}}:&#10;```&#10;{{code_diff}}&#10;```"
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            {/* Variable detection pill */}
            {detectedVariables.length > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detected Variables ({detectedVariables.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {detectedVariables.map(v => (
                    <span
                      key={v}
                      className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Instruction & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                System Prompt / Custom Instruction (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Act as a Staff Security Engineer. Be concise and prioritize OWASP compliance."
                value={systemInstruction}
                onChange={e => setSystemInstruction(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Temperature
                </label>
                <span className="text-xs font-mono font-semibold text-indigo-500">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.0 (Precise)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Security, Architecture, TypeScript, CodeReview"
              value={tagsString}
              onChange={e => setTagsString(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Example Output & Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Example Output (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Paste an excerpt of good output produced by this prompt..."
                value={exampleOutput}
                onChange={e => setExampleOutput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Best Practices & Usage Tips (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Give your teammates tips on getting the best results..."
                value={tips}
                onChange={e => setTips(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Admin Badges Checkboxes */}
          {user?.role === 'admin' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isStaffPick}
                  onChange={e => setIsStaffPick(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Curate as <strong>Staff Pick</strong></span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={e => setIsVerified(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mark as <strong>Verified Organization Standard</strong></span>
              </label>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${colorScheme.primary} disabled:opacity-50`}
            >
              {saving ? 'Saving...' : initialPrompt ? 'Update Prompt' : 'Publish to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
