import React, { useState } from 'react';
import { Key, ShieldCheck, X, Sparkles, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 max-w-md w-full border border-[var(--border-warm)] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-warm)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--primary-sage-light)] text-[var(--primary-sage)]">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[var(--text-ink)]">
              Gemini API Key Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[var(--primary-sage-light)] p-4 rounded-xl border border-[var(--primary-sage)]/30 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[var(--primary-sage)]">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Setup Grounded Generator Included</span>
          </div>
          <p className="text-[var(--text-ink)] leading-relaxed">
            ConceptCraft includes a built-in RAG generator so the app works 100% out of the box without any key!
          </p>
          <p className="text-[var(--text-muted)]">
            If you provide a Gemini API Key below, the app will use Gemini 2.5 Flash for live LLM response generation.
          </p>
        </div>

        {/* Key Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-parchment)] font-mono text-sm focus:bg-[var(--bg-card)] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  setKeyInput('');
                  onSaveApiKey('');
                }}
                className="text-xs text-red-600 hover:underline font-bold"
              >
                Clear Key
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[var(--bg-card-alt)] hover:bg-[var(--border-warm)]/50 text-xs font-bold text-[var(--text-ink)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white text-xs font-bold shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
