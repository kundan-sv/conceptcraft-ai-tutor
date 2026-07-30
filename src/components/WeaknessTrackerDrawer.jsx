import React from 'react';
import { AlertTriangle, X, CheckCircle, BookOpen, Trash2, ArrowRight } from 'lucide-react';

export default function WeaknessTrackerDrawer({ isOpen, onClose, weaknesses, onRemoveWeakness }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-[var(--bg-card)] w-full max-w-md h-full shadow-2xl border-l border-[var(--border-warm)] p-6 overflow-y-auto flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-warm)] pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[var(--secondary-terracotta-light)] text-[var(--secondary-terracotta)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--text-ink)] leading-none">
                  Weakness Tracker
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Logged misconceptions across sessions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-card-alt)] text-[var(--text-muted)] hover:text-[var(--text-ink)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Weakness List */}
          {weaknesses.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--primary-sage-light)] text-[var(--primary-sage)] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[var(--text-ink)]">
                No weaknesses logged!
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                Any misconceptions flagged during Teach-Back verification will automatically show up here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weaknesses.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--bg-card-alt)] p-4 rounded-xl border border-[var(--border-warm)] space-y-2 text-xs relative group"
                >
                  <div className="flex items-center justify-between font-bold text-[var(--secondary-terracotta)]">
                    <span>{item.topicTitle}</span>
                    <span className="text-[10px] text-[var(--text-light)]">{item.date}</span>
                  </div>

                  <p className="text-[var(--text-ink)] font-medium leading-relaxed">
                    "{item.misconception}"
                  </p>

                  <div className="pt-1 flex items-center justify-between border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
                    <span className="font-mono">Ref: {item.groundedRef}</span>
                    <button
                      onClick={() => onRemoveWeakness(item.id)}
                      className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--border-warm)] text-center">
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Reviewing your weak points leads to 3x higher retention!
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[var(--primary-sage)] text-white text-xs font-bold"
          >
            Close & Continue Lesson
          </button>
        </div>
      </div>
    </div>
  );
}
