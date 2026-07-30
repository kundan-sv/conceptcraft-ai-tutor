import React from 'react';
import { BookOpen, Globe, Key, AlertTriangle, Sparkles } from 'lucide-react';

export default function Header({ 
  language, 
  setLanguage, 
  onOpenApiKeyModal, 
  onOpenWeaknessTracker, 
  weaknessCount,
  hasApiKey 
}) {
  return (
    <header className="w-full bg-[var(--bg-card)] border-b border-[var(--border-warm)] shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-sage)] text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-ink)] tracking-tight leading-none">
                ConceptCraft
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-sage-light)] text-[var(--primary-sage)] border border-[var(--primary-sage)]/20">
                Grounded AI Tutor
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">
              Accessible, voice-first learning for every student
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <div className="flex items-center bg-[var(--bg-card-alt)] rounded-lg p-1 border border-[var(--border-warm)]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-[var(--bg-card)] text-[var(--text-ink)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'hi'
                  ? 'bg-[var(--bg-card)] text-[var(--text-ink)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>

          {/* Weakness Tracker Button */}
          <button
            onClick={onOpenWeaknessTracker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card-alt)] text-[var(--text-ink)] hover:bg-[var(--border-warm)]/40 border border-[var(--border-warm)] transition-colors relative"
            title="View logged weak points and misconceptions"
          >
            <AlertTriangle className="w-4 h-4 text-[var(--secondary-terracotta)]" />
            <span className="hidden sm:inline">Weakness Tracker</span>
            {weaknessCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[var(--secondary-terracotta)] text-white text-[10px] font-bold rounded-full">
                {weaknessCount}
              </span>
            )}
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasApiKey 
                ? 'bg-[var(--primary-sage-light)] text-[var(--primary-sage)] border-[var(--primary-sage)]/30'
                : 'bg-[var(--bg-card-alt)] text-[var(--text-muted)] border-[var(--border-warm)] hover:text-[var(--text-ink)]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{hasApiKey ? 'Gemini Active' : 'API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
