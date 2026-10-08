import React, { useEffect, useState } from 'react';
import { X, History, PlusCircle, Edit, Trash2, Heart, Sparkles, UserCheck, Palette, RefreshCw } from 'lucide-react';
import { ActivityLog } from '../types';
import { fetchRecentActivities } from '../services/activityService';

interface ActivityLogModalProps {
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const records = await fetchRecentActivities(30);
      setLogs(records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create_prompt':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded"><PlusCircle className="w-3 h-3" /> Created</span>;
      case 'update_prompt':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded"><Edit className="w-3 h-3" /> Updated</span>;
      case 'delete_prompt':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded"><Trash2 className="w-3 h-3" /> Deleted</span>;
      case 'favorite_prompt':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded"><Heart className="w-3 h-3" /> Favorited</span>;
      case 'test_prompt':
      case 'optimize_prompt':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded"><Sparkles className="w-3 h-3" /> AI Benchmark</span>;
      case 'update_branding':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded"><Palette className="w-3 h-3" /> Branding</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Action</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Organization Activity & Audit Trail
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent log of team prompt additions, benchmarks, and updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              title="Refresh Logs"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Loading company audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No activity records recorded yet. As your team creates, edits, and benchmarks prompts, logs will stream here.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {log.userName}
                      </span>
                      {log.targetTitle && (
                        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          "{log.targetTitle}"
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {log.details}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
