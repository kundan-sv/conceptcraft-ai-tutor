import React from 'react';
import { Upload, Headphones, HelpCircle, MessageSquareQuote, Award, CheckCircle2 } from 'lucide-react';

export default function CraftPathStepper({ currentStage, setStage, completedStages = {} }) {
  const stages = [
    { id: 1, key: 'ingest', title: '1. Ground Material', icon: Upload, desc: 'PDF or text notes' },
    { id: 2, key: 'explain', title: '2. Learn & Listen', icon: Headphones, desc: 'Adaptive voice lesson' },
    { id: 3, key: 'test', title: '3. Adaptive Quiz', icon: HelpCircle, desc: 'Test understanding' },
    { id: 4, key: 'teachback', title: '4. Teach-Back', icon: MessageSquareQuote, desc: 'Explain in your words' },
    { id: 5, key: 'visual', title: '5. Mastery & Visual', icon: Award, desc: 'Interactive visual' },
  ];

  return (
    <div className="w-full my-8">
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 md:p-8 border border-[var(--border-warm)] shadow-lg relative overflow-hidden fade-in-up">
        <div className="flex items-center justify-between mb-8 px-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--secondary-terracotta)] animate-pulse shadow-[0_0_8px_var(--secondary-terracotta)]"></span>
            <span className="text-sm uppercase font-extrabold tracking-widest text-[var(--text-ink)]">
              Your Learning Journey
            </span>
          </div>
          <span className="text-xs font-bold text-[var(--primary-sage)] bg-[var(--primary-sage-light)] px-3 py-1 rounded-full shadow-sm">
            Stage {currentStage} of 5
          </span>
        </div>

        {/* Stepper Path Container */}
        <div className="relative w-full flex items-start justify-between px-2 sm:px-6 z-10">
          {/* Background Track */}
          <div className="absolute top-[28px] left-[5%] right-[5%] h-2 bg-[var(--border-warm)] rounded-full z-0 shadow-inner"></div>
          
          {/* Filled Progress Track */}
          <div 
            className="absolute top-[28px] left-[5%] h-2 bg-gradient-to-r from-[var(--primary-sage)] to-[var(--secondary-terracotta)] rounded-full z-0 transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${Math.max(0, ((currentStage - 1) / (stages.length - 1)) * 90)}%` }}
          ></div>

          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = currentStage === stage.id;
            const isCompleted = completedStages[stage.key];
            const isUnlocked = stage.id === 1 || completedStages[stages[stage.id - 2]?.key] || isCompleted;

            return (
              <button
                key={stage.id}
                onClick={() => isUnlocked && setStage(stage.id)}
                disabled={!isUnlocked}
                className="relative z-10 flex flex-col items-center group focus:outline-none w-16 sm:w-24"
              >
                {/* Icon Container with Glow & Bounce */}
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  isActive
                    ? 'bg-gradient-to-br from-[var(--secondary-terracotta)] to-orange-500 text-white scale-110 ring-4 ring-orange-200 shadow-orange-500/40'
                    : isCompleted
                    ? 'bg-gradient-to-br from-[var(--primary-sage)] to-emerald-500 text-white icon-bounce shadow-emerald-500/30 ring-2 ring-emerald-100'
                    : isUnlocked
                    ? 'bg-white text-[var(--text-ink)] border-2 border-[var(--border-warm)] hover:border-[var(--primary-sage-light)] hover:scale-105'
                    : 'bg-[var(--bg-parchment)] text-[var(--text-muted)] border-2 border-[var(--border-subtle)] opacity-60 cursor-not-allowed'
                }`}>
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'animate-pulse' : ''}`} />
                  
                  {/* Marker Dot for Active Stage */}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 border-2 border-white rounded-full animate-bounce shadow-sm"></span>
                  )}

                  {/* Checkmark for Completed Stage */}
                  {isCompleted && !isActive && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm check-draw-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    </div>
                  )}
                </div>

                {/* Stage Title */}
                <span className={`mt-3 text-xs sm:text-sm font-bold text-center leading-tight transition-colors duration-200 ${
                  isActive ? 'text-[var(--secondary-terracotta)] scale-105' 
                  : isCompleted ? 'text-[var(--primary-sage)]'
                  : isUnlocked ? 'text-[var(--text-ink)]'
                  : 'text-[var(--text-muted)]'
                }`}>
                  {stage.title}
                </span>
                
                {/* Stage Desc (hidden on mobile for space) */}
                <span className="hidden sm:block text-[10px] text-[var(--text-muted)] text-center mt-0.5 px-1 leading-tight opacity-80">
                  {stage.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
