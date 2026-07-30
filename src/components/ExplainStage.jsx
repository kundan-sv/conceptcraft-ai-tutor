import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Square, Sparkles, BookOpen, ExternalLink, ArrowRight, RefreshCw, Globe, ChevronRight } from 'lucide-react';
import { speakText, stopSpeaking, pauseSpeaking, resumeSpeaking } from '../utils/speechUtils';
import { generateLevelExplanation } from '../utils/aiService';
import ReactMarkdown from 'react-markdown';
export default function ExplainStage({ topic, language, apiKey, onNextStage }) {
  const [level, setLevel] = useState('Beginner'); // Beginner, Intermediate, Exam-Revision
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Speech controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [selectedPassage, setSelectedPassage] = useState(null);

  // Load explanation whenever level, topic, language or apiKey changes
  useEffect(() => {
    if (!topic || !topic.chunks || topic.chunks.length === 0) return;
    loadExplanation(level);
    return () => {
      stopSpeaking();
    };
  }, [level, topic, language]);

  const loadExplanation = async (targetLevel) => {
    setIsLoading(true);
    stopSpeaking();
    setIsPlaying(false);
    setIsPaused(false);

    try {
      const result = await generateLevelExplanation({
        chunks: topic.chunks,
        level: targetLevel,
        language: language,
        apiKey: apiKey
      });
      setExplanation(result);
    } catch (err) {
      console.error("Error generating explanation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = () => {
    if (!explanation || !explanation.text) return;

    if (isPaused) {
      resumeSpeaking();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      pauseSpeaking();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);

    speakText({
      text: explanation.text + " " + (explanation.analogy || ""),
      lang: language,
      rate: speechRate,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      onError: (err) => {
        console.warn("Speech error:", err);
        setIsPlaying(false);
        setIsPaused(false);
      }
    });
  };

  const handleStopVoice = () => {
    stopSpeaking();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const levelOptions = [
    {
      id: 'Beginner',
      label: 'Beginner',
      tag: 'Everyday Analogies',
      desc: 'Simple plain words, short sentences, no complex jargon.'
    },
    {
      id: 'Intermediate',
      label: 'Intermediate',
      tag: 'Standard Depth',
      desc: 'Balanced explanation with definitions and cause-and-effect.'
    },
    {
      id: 'Exam-Revision',
      label: 'Exam-Revision',
      tag: 'Concise & Formulas',
      desc: 'High-yield key terms, formulas, and bullet summaries.'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header & Topic Title */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-warm)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-terracotta)]">
            Stage 2: Voice-First Grounded Explanation
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-0.5">
            {topic?.title || "Lesson Explanation"}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Grounded in {topic?.chunks?.length || 0} source passages • Change level or listen anytime
          </p>
        </div>

        {/* Next Stage Button */}
        <button
          onClick={onNextStage}
          className="self-start md:self-auto px-5 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-sage-hover)] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <span>Take Adaptive Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Level Slider / Selector (Accessibility Prominent Control) */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-warm)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-ink)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--secondary-terracotta)]" />
            Select Explanation Level:
          </label>
          <div className="flex items-center gap-2">
            {explanation?.source && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                explanation.source === 'Gemini'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {explanation.source === 'Gemini' ? '✨ Powered by Gemini API' : '⚡ Grounded Local Engine'}
              </span>
            )}
            <span className="badge-level">
              Current: {level}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {levelOptions.map((opt) => {
            const isSelected = level === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setLevel(opt.id)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'level-card-active border-2 border-[var(--secondary-terracotta)]'
                    : 'bg-[var(--bg-card-alt)] border-[var(--border-warm)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-base text-[var(--text-ink)]">
                      {opt.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--secondary-terracotta)] border border-[var(--border-warm)]">
                      {opt.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Tactile Voice Narrator Controls (Core Accessibility Feature) */}
      <div className="bg-[var(--primary-sage-light)] rounded-2xl p-5 border border-[var(--primary-sage)]/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary-sage)] text-white flex items-center justify-center shadow-md relative">
            <Volume2 className="w-6 h-6" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--secondary-terracotta)] rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--primary-sage)] leading-tight">
              Voice Narrator (Web Speech API)
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {isPlaying 
                ? 'Reading aloud...' 
                : isPaused 
                ? 'Paused' 
                : 'Click Play to hear this lesson read aloud'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Soundwave Animation indicator when speaking */}
          {isPlaying && (
            <div className="hidden sm:flex items-center h-6 px-2">
              <span className="sound-bar sound-bar-1"></span>
              <span className="sound-bar sound-bar-2"></span>
              <span className="sound-bar sound-bar-3"></span>
              <span className="sound-bar sound-bar-4"></span>
            </div>
          )}

          {/* Speed Toggle */}
          <div className="flex items-center bg-white rounded-lg p-1 border border-[var(--border-warm)] text-xs">
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  speechRate === rate
                    ? 'bg-[var(--primary-sage)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Play / Pause Main Button */}
          <button
            onClick={handlePlayVoice}
            disabled={isLoading}
            className="px-5 py-3 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all transform active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Play Voice</span>
              </>
            )}
          </button>

          {(isPlaying || isPaused) && (
            <button
              onClick={handleStopVoice}
              className="p-3 rounded-xl bg-white hover:bg-[var(--bg-card-alt)] text-[var(--text-ink)] border border-[var(--border-warm)] shadow-sm transition-colors"
              title="Stop Narration"
            >
              <Square className="w-4 h-4 fill-current text-[var(--secondary-terracotta)]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Explanation Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border-warm)] shadow-sm space-y-6 relative">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[var(--secondary-terracotta)] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[var(--text-ink)]">
              Generating grounded explanation for "{level}" level...
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Retrieving exact source passages to prevent invention of outside facts...
            </p>
          </div>
        ) : explanation ? (
          <>
            {/* Header Badge on Explanation Card showing generation source */}
            <div className="flex items-center justify-between border-b border-[var(--border-warm)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-terracotta)]">
                  Level: {level}
                </span>
              </div>
              {explanation.source && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-xs ${
                  explanation.source === 'Gemini'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}>
                  {explanation.source === 'Gemini' ? '✨ Powered by Gemini API' : '⚡ Grounded Local Engine'}
                </span>
              )}
            </div>

            {/* Analogy Highlight Box */}
            {explanation.analogy && (
              <div className="bg-[var(--accent-amber-light)] rounded-xl p-4 border border-[var(--accent-amber)]/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--accent-amber)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--accent-amber)] mb-0.5">
                    Everyday Analogy
                  </h4>
                  <p className="text-sm text-[var(--text-ink)] font-medium italic mb-0">
                    "{explanation.analogy}"
                  </p>
                </div>
              </div>
            )}

            {/* Explanation Content & Supporting Visual Preview Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Main Grounded Text */}
              <div className="lg:col-span-8 space-y-5">
                {/* Main Text */}
                <div className="prose max-w-none text-[var(--text-ink)] text-lg leading-relaxed space-y-4">
                  <ReactMarkdown
                    components={{
                      a: ({ node, href, children }) => {
                        if (href && href.startsWith('passage:')) {
                          const pNum = parseInt(href.split(':')[1], 10);
                          const chunk = topic?.chunks?.find(c => c.passageNum === pNum) || topic?.chunks?.[pNum - 1];
                          return (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedPassage(chunk || { passageNum: pNum, content: "Source passage excerpt." });
                              }}
                              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded bg-[var(--accent-amber-light)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 font-mono text-xs font-bold hover:bg-[var(--accent-amber)] hover:text-white transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Passage #{pNum}</span>
                            </button>
                          );
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                      }
                    }}
                  >
                    {explanation.text ? explanation.text.replace(/\[Passage\s*(\d+)[^\]]*\]/gi, (match, pNum) => `[Passage #${pNum}](passage:${pNum})`) : ""}
                  </ReactMarkdown>
                </div>

                {/* Key Formulas & Definitions Section */}
                {((explanation.formulasAndDefinitions && explanation.formulasAndDefinitions.length > 0) || (explanation.keyDefinitions && explanation.keyDefinitions.length > 0)) && (
                  <div className="bg-[var(--primary-sage-light)]/60 rounded-xl p-5 border border-[var(--primary-sage)]/30 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--primary-sage)] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[var(--primary-sage)]" />
                      <span>Key Formulas & Definitions</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-[var(--text-ink)]">
                      {(explanation.formulasAndDefinitions || explanation.keyDefinitions).map((def, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-[var(--border-warm)] font-sans">
                          <span className="font-bold text-[var(--secondary-terracotta)] mt-0.5">•</span>
                          <span className="leading-relaxed">
                            {def.split(/(\[Passage\s*\d+[^\]]*\])/gi).map((part, pIdx) => {
                              const match = part.match(/\[Passage\s*(\d+)[^\]]*\]/i);
                              if (match) {
                                const pNum = parseInt(match[1], 10);
                                const chunk = topic?.chunks?.find(c => c.passageNum === pNum) || topic?.chunks?.[pNum - 1];
                                return (
                                  <button
                                    key={pIdx}
                                    onClick={() => setSelectedPassage(chunk || { passageNum: pNum, content: "Source passage excerpt." })}
                                    className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded bg-[var(--accent-amber-light)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 font-mono text-xs font-bold hover:bg-[var(--accent-amber)] hover:text-white transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Passage #{pNum}</span>
                                  </button>
                                );
                              }
                              return part;
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bullet Takeaways */}
                {explanation.bulletPoints && (
                  <div className="bg-[var(--bg-card-alt)] rounded-xl p-5 border border-[var(--border-warm)] space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--primary-sage)]">
                      Key Concept Takeaways
                    </h4>
                    <ul className="space-y-1.5 text-sm text-[var(--text-ink)]">
                      {explanation.bulletPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-sage)] mt-2 shrink-0"></span>
                          <span>
                            {pt.split(/(\[Passage\s*\d+[^\]]*\])/gi).map((part, pIdx) => {
                              const match = part.match(/\[Passage\s*(\d+)[^\]]*\]/i);
                              if (match) {
                                const pNum = parseInt(match[1], 10);
                                const chunk = topic?.chunks?.find(c => c.passageNum === pNum) || topic?.chunks?.[pNum - 1];
                                return (
                                  <button
                                    key={pIdx}
                                    onClick={() => setSelectedPassage(chunk || { passageNum: pNum, content: "Source passage excerpt." })}
                                    className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded bg-[var(--accent-amber-light)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 font-mono text-xs font-bold hover:bg-[var(--accent-amber)] hover:text-white transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Passage #{pNum}</span>
                                  </button>
                                );
                              }
                              return part;
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Side: Supporting Visual Concept Preview Panel */}
              <div className="lg:col-span-4 space-y-4">
                <ConceptVisualPreview topic={topic} />
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Passage Inspector Modal / Popover */}
      {selectedPassage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 max-w-lg w-full border border-[var(--border-warm)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-warm)] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--secondary-terracotta)]" />
                <h3 className="font-bold text-lg text-[var(--text-ink)]">
                  Grounding Source: Passage #{selectedPassage.passageNum}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPassage(null)}
                className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-[var(--bg-card-alt)] p-4 rounded-xl border border-[var(--border-warm)] text-sm font-mono text-[var(--text-ink)] leading-relaxed max-h-60 overflow-y-auto">
              {selectedPassage.content}
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Every fact generated in ConceptCraft is verified against this exact passage excerpt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Supporting Visual Concept Preview for Stage 2 (Learn & Listen)
 */
function ConceptVisualPreview({ topic }) {
  const isOhmsLaw = topic?.id === 'ohms-law' || topic?.title?.toLowerCase().includes('ohm');
  const [miniVoltage, setMiniVoltage] = useState(12);
  const resistance = 6;
  const current = (miniVoltage / resistance).toFixed(1);

  if (isOhmsLaw) {
    return (
      <div className="bg-[var(--bg-card-alt)] rounded-xl p-4 border border-[var(--border-warm)] space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-terracotta)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Visual Concept Teaser
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[var(--text-muted)] border border-[var(--border-warm)]">
            Ohm's Law
          </span>
        </div>

        {/* Mini Formula Triangle */}
        <div className="bg-white p-3 rounded-lg border border-[var(--border-warm)] text-center space-y-1">
          <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Formula Preview</div>
          <div className="font-mono text-lg font-bold text-[var(--primary-sage)]">
            V = I × R
          </div>
          <div className="flex justify-center gap-2 text-xs font-mono text-[var(--text-ink)] pt-1">
            <span className="bg-[var(--secondary-terracotta-light)] text-[var(--secondary-terracotta)] px-1.5 py-0.5 rounded font-bold">
              {miniVoltage}V
            </span>
            <span>=</span>
            <span className="bg-[var(--primary-sage-light)] text-[var(--primary-sage)] px-1.5 py-0.5 rounded font-bold">
              {current}A
            </span>
            <span>×</span>
            <span className="bg-[var(--accent-amber-light)] text-[var(--accent-amber)] px-1.5 py-0.5 rounded font-bold">
              {resistance}Ω
            </span>
          </div>
        </div>

        {/* Lightly Interactive Push Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--text-muted)] block">
            Test Electrical Push (Voltage):
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[6, 12, 24].map((v) => (
              <button
                key={v}
                onClick={() => setMiniVoltage(v)}
                className={`py-1 rounded text-xs font-bold border transition-all ${
                  miniVoltage === v
                    ? 'bg-[var(--secondary-terracotta)] text-white border-[var(--secondary-terracotta)] shadow-xs'
                    : 'bg-white text-[var(--text-ink)] border-[var(--border-warm)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {v}V
              </button>
            ))}
          </div>
        </div>

        {/* Mini Circuit Stream Teaser */}
        <div className="relative h-12 bg-slate-900 rounded-lg p-2 flex items-center justify-between overflow-hidden">
          <div className="text-[10px] font-mono font-bold text-amber-400">
            {miniVoltage}V Push
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-amber-400 rounded-full animate-ping"
                style={{ animationDuration: `${Math.max(0.3, 1.5 / current)}s`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <div className="text-[10px] font-mono font-bold text-green-400">
            {current}A Flow
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-muted)] italic leading-tight">
          💡 Full interactive circuit simulator unlocks in Stage 5: Mastery.
        </p>
      </div>
    );
  }

  // Non-Physics Visual Teaser Card
  return (
    <div className="bg-[var(--bg-card-alt)] rounded-xl p-4 border border-[var(--border-warm)] space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-sage)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Concept Map Preview
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[var(--text-muted)] border border-[var(--border-warm)]">
          {topic?.chunks?.length || 0} Passages
        </span>
      </div>

      <div className="space-y-2">
        {topic?.chunks?.slice(0, 3).map((chunk, idx) => (
          <div key={chunk.id} className="bg-white p-2.5 rounded-lg border border-[var(--border-warm)] text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[var(--primary-sage)]">
              <span className="w-4 h-4 rounded-full bg-[var(--primary-sage-light)] text-[var(--primary-sage)] text-[10px] flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span className="line-clamp-1">{chunk.title}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 pl-5">
              {chunk.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

