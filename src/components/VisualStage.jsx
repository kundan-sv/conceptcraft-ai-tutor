import React, { useState } from 'react';
import { Zap, Activity, Sliders, CheckCircle2, Award, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VisualStage({ topic }) {
  // Ohm's Law Interactive Controls State
  const [voltage, setVoltage] = useState(12); // Volts
  const [resistance, setResistance] = useState(6); // Ohms

  const current = (voltage / resistance).toFixed(2); // Amperes I = V/R

  const handleCelebrateMastery = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  const isOhmsLaw = topic?.id === 'ohms-law' || topic?.title.toLowerCase().includes('ohm');

  return (
    <div className="w-full space-y-6">
      {/* Stage Header */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-warm)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-sage)]">
            Stage 5: Visual Concept Simulator & Mastery
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-0.5">
            {isOhmsLaw ? "Interactive Ohm's Law Circuit Simulator" : `Visual Overview: ${topic?.title}`}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isOhmsLaw 
              ? "Adjust Voltage and Resistance sliders to watch live Current and electron flow change in real-time."
              : "Visual breakdown of core concept relationships grounded in source material."}
          </p>
        </div>

        {/* Celebrate Mastery Button */}
        <button
          onClick={handleCelebrateMastery}
          className="px-5 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-sage-hover)] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <Award className="w-5 h-5 text-amber-300" />
          <span>Claim Lesson Mastery!</span>
        </button>
      </div>

      {isOhmsLaw ? (
        /* Interactive Ohm's Law Simulator Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders & Formula Controls (Left) */}
          <div className="lg:col-span-5 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-warm)] shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-ink)] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[var(--secondary-terracotta)]" />
              <span>Interactive Controls</span>
            </h3>

            {/* Voltage Slider */}
            <div className="space-y-2 bg-[var(--bg-card-alt)] p-4 rounded-xl border border-[var(--border-warm)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-terracotta)]">
                  Voltage (V): Push / Pressure
                </label>
                <span className="font-mono text-base font-bold text-[var(--secondary-terracotta)]">
                  {voltage} V
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="custom-slider"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>1V (Battery)</span>
                <span>24V (High Push)</span>
              </div>
            </div>

            {/* Resistance Slider */}
            <div className="space-y-2 bg-[var(--bg-card-alt)] p-4 rounded-xl border border-[var(--border-warm)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--accent-amber)]">
                  Resistance (R): Squeeze / Friction
                </label>
                <span className="font-mono text-base font-bold text-[var(--accent-amber)]">
                  {resistance} Ω
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={resistance}
                onChange={(e) => setResistance(Number(e.target.value))}
                className="custom-slider"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>1Ω (Copper Wire)</span>
                <span>50Ω (High Squeeze)</span>
              </div>
            </div>

            {/* Formula Triangle Visualization */}
            <div className="bg-[var(--primary-sage-light)] p-4 rounded-xl border border-[var(--primary-sage)]/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-sage)]">
                Ohm's Law Formula Triangle
              </span>
              <div className="text-xl font-bold font-mono text-[var(--primary-sage)]">
                I = V / R
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {voltage}V ÷ {resistance}Ω = <span className="font-bold text-[var(--text-ink)]">{current} Amperes</span>
              </p>
            </div>
          </div>

          {/* Circuit Visualizer Diagram (Right) */}
          <div className="lg:col-span-7 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-warm)] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-ink)] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--accent-amber)]" />
                <span>Live Circuit & Electron Stream</span>
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--accent-amber-light)] rounded-full text-xs font-bold text-[var(--accent-amber)] border border-[var(--accent-amber)]/30">
                <Activity className="w-3.5 h-3.5" />
                <span>Current: {current} Amps</span>
              </div>
            </div>

            {/* Animated Circuit Wire Diagram */}
            <div className="relative w-full h-56 bg-slate-900 rounded-xl border-2 border-[var(--border-warm)] p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Animated Electron Dots */}
              <div className="absolute inset-x-8 top-6 h-1 flex justify-around">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b] animate-ping"
                    style={{
                      animationDuration: `${Math.max(0.2, 2 / parseFloat(current))}s`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>

              {/* Circuit Battery & Resistor */}
              <div className="flex justify-between items-center text-white px-6">
                {/* Battery */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-16 bg-gradient-to-b from-amber-500 to-amber-700 rounded-md border border-amber-300 flex flex-col items-center justify-center font-mono font-bold text-xs shadow-lg">
                    <span>{voltage}V</span>
                    <span className="text-[9px] text-amber-200">DC PUSH</span>
                  </div>
                </div>

                {/* Live Digital Ammeter Meter */}
                <div className="flex flex-col items-center bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-md">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">AMMETER</span>
                  <span className="font-mono text-2xl font-bold text-green-400 tracking-wider">
                    {current} A
                  </span>
                </div>

                {/* Resistor Squeeze */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-8 bg-amber-900 border-2 border-amber-500 rounded flex items-center justify-center font-mono text-xs font-bold text-amber-200 shadow-md">
                    {resistance} Ω
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase">RESISTOR</span>
                </div>
              </div>

              {/* Return Wire */}
              <div className="w-full h-1 bg-amber-500/40 rounded"></div>
            </div>

            {/* Dynamic Intuition Summary */}
            <div className="bg-[var(--bg-card-alt)] p-4 rounded-xl border border-[var(--border-warm)] text-xs text-[var(--text-ink)] space-y-1">
              <span className="font-bold text-[var(--primary-sage)] uppercase tracking-wider block">
                Physical Intuition:
              </span>
              <p className="leading-relaxed">
                With <span className="font-bold">{voltage} Volts</span> of pushing pressure against <span className="font-bold">{resistance} Ohms</span> of friction, exactly <span className="font-bold text-[var(--secondary-terracotta)]">{current} Amperes</span> of current can pass per second.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Static / Visual Overview Card for non-physics topics */
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border-warm)] shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-[var(--text-ink)]">
            Concept Map & Core Flow: {topic?.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topic?.chunks?.map((chunk, idx) => (
              <div key={chunk.id} className="bg-[var(--bg-card-alt)] p-5 rounded-xl border border-[var(--border-warm)] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-sage)] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-sm text-[var(--text-ink)]">
                    {chunk.title}
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] line-clamp-4 leading-relaxed font-sans">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
