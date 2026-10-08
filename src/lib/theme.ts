import { BrandColor } from '../types';

export interface ColorSchemeConfig {
  name: string;
  primary: string;
  primaryHover: string;
  badgeBg: string;
  badgeText: string;
  borderFocus: string;
  gradient: string;
  glow: string;
}

export const COLOR_SCHEMES: Record<BrandColor, ColorSchemeConfig> = {
  indigo: {
    name: 'Tech Indigo',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
    primaryHover: 'hover:bg-indigo-700',
    badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    badgeText: 'text-indigo-400',
    borderFocus: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    gradient: 'from-indigo-600 to-blue-600',
    glow: 'shadow-indigo-500/20',
  },
  emerald: {
    name: 'Forest Emerald',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500',
    primaryHover: 'hover:bg-emerald-700',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    gradient: 'from-emerald-600 to-teal-600',
    glow: 'shadow-emerald-500/20',
  },
  violet: {
    name: 'Quantum Violet',
    primary: 'bg-violet-600 text-white hover:bg-violet-500',
    primaryHover: 'hover:bg-violet-700',
    badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    badgeText: 'text-violet-400',
    borderFocus: 'focus:border-violet-500 focus:ring-violet-500/20',
    gradient: 'from-violet-600 to-purple-600',
    glow: 'shadow-violet-500/20',
  },
  sky: {
    name: 'Deep Sky',
    primary: 'bg-sky-600 text-white hover:bg-sky-500',
    primaryHover: 'hover:bg-sky-700',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    badgeText: 'text-sky-400',
    borderFocus: 'focus:border-sky-500 focus:ring-sky-500/20',
    gradient: 'from-sky-600 to-cyan-600',
    glow: 'shadow-sky-500/20',
  },
  amber: {
    name: 'Solar Amber',
    primary: 'bg-amber-600 text-white hover:bg-amber-500',
    primaryHover: 'hover:bg-amber-700',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    badgeText: 'text-amber-400',
    borderFocus: 'focus:border-amber-500 focus:ring-amber-500/20',
    gradient: 'from-amber-600 to-orange-600',
    glow: 'shadow-amber-500/20',
  },
  rose: {
    name: 'Crimson Rose',
    primary: 'bg-rose-600 text-white hover:bg-rose-500',
    primaryHover: 'hover:bg-rose-700',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    badgeText: 'text-rose-400',
    borderFocus: 'focus:border-rose-500 focus:ring-rose-500/20',
    gradient: 'from-rose-600 to-pink-600',
    glow: 'shadow-rose-500/20',
  },
};
