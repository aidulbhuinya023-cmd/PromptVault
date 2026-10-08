import React, { useState } from 'react';
import { X, Palette, Check, AlertCircle, Building, Image, Globe, Shield } from 'lucide-react';
import { CompanyBranding, BrandColor } from '../types';
import { COLOR_SCHEMES } from '../lib/theme';

interface BrandingModalProps {
  currentBranding: CompanyBranding;
  onClose: () => void;
  onSave: (branding: Partial<CompanyBranding>) => Promise<void>;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({
  currentBranding,
  onClose,
  onSave,
}) => {
  const [companyName, setCompanyName] = useState(currentBranding.companyName);
  const [logoUrl, setLogoUrl] = useState(currentBranding.logoUrl || '');
  const [tagline, setTagline] = useState(currentBranding.tagline);
  const [allowedDomain, setAllowedDomain] = useState(currentBranding.allowedDomain || '');
  const [primaryColor, setPrimaryColor] = useState<BrandColor>(currentBranding.primaryColor);
  const [welcomeMessage, setWelcomeMessage] = useState(currentBranding.welcomeMessage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableColors: BrandColor[] = ['indigo', 'emerald', 'violet', 'sky', 'amber', 'rose'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        companyName: companyName.trim(),
        logoUrl: logoUrl.trim(),
        tagline: tagline.trim(),
        allowedDomain: allowedDomain.trim(),
        primaryColor,
        welcomeMessage: welcomeMessage.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Company Branding & Customization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize the prompt hub logo, color scheme, and organization domain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Organization Name *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Acme Corp AI"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Hub Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="Private enterprise prompt repository and benchmarking center"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Company Logo Image URL
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://company.internal/logo.svg"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Color Palette Theme */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Primary Brand Color Palette
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {availableColors.map(color => {
                const config = COLOR_SCHEMES[color];
                const isSelected = primaryColor === color;
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-slate-900 dark:border-white ring-2 ring-indigo-500/30 bg-slate-50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-gradient-to-tr ${config.gradient} shadow-sm flex items-center justify-center text-white`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className="capitalize text-slate-800 dark:text-slate-200">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allowed Domain */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Authorized Corporate Domain (SSO Enforcement)
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={allowedDomain}
                onChange={e => setAllowedDomain(e.target.value)}
                placeholder="e.g. acme.com or acme.corp"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Leave blank to permit all invited team accounts, or specify your corporate domain.
            </p>
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Welcome Banner Announcement
            </label>
            <textarea
              rows={2}
              value={welcomeMessage}
              onChange={e => setWelcomeMessage(e.target.value)}
              placeholder="Welcome to our prompt repository..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Applying...' : 'Save Branding Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
