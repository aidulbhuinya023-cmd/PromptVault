import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Server, Shield, Database, Cpu } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeSnippet = `version: '3.8'

services:
  promptvault:
    build: .
    container_name: promptvault-internal
    restart: always
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - ./firebase-applet-config.json:/app/firebase-applet-config.json:ro
`;

  const dockerfileSnippet = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Deployment & Self-Hosting Guide
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Architecture & Docker containerization • Powered by Apex Web Studio India
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Architecture Overview */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              <span>Full-Stack Architecture</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-slate-600 dark:text-slate-400">
              <li><strong>Frontend:</strong> React 19 + TypeScript + Vite + Tailwind CSS for ultra-fast, responsive UI with light/dark theme toggles.</li>
              <li><strong>Database & Auth:</strong> Google Cloud Firestore & Firebase Auth for real-time document synchronization and zero-trust ABAC security rules.</li>
              <li><strong>AI Engine:</strong> Server-side <code>@google/genai</code> running <strong>gemini-3.1-pro-preview</strong> with <strong>ThinkingLevel.HIGH</strong> for multi-step prompt reasoning, variable compilation, and edge-case optimization.</li>
              <li><strong>Security:</strong> Granular role-based permissions (Admin, Contributor, Member) with immutable audit activity logging.</li>
            </ul>
          </div>

          {/* Docker Compose */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                docker-compose.yml
              </h4>
              <button
                onClick={() => copyCode('compose', dockerComposeSnippet)}
                className="flex items-center gap-1 text-indigo-500 hover:underline"
              >
                {copiedKey === 'compose' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'compose' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              {dockerComposeSnippet}
            </pre>
          </div>

          {/* Dockerfile */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Dockerfile
              </h4>
              <button
                onClick={() => copyCode('dockerfile', dockerfileSnippet)}
                className="flex items-center gap-1 text-indigo-500 hover:underline"
              >
                {copiedKey === 'dockerfile' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'dockerfile' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              {dockerfileSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
