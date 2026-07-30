import React, { useState } from 'react';
import { MessageSquareQuote, Mic, MicOff, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, RefreshCw, BookmarkPlus, HeartHandshake, ShieldCheck, RotateCcw } from 'lucide-react';
import { startListening, stopListening, isSTTSupported } from '../utils/speechUtils';
import { verifyTeachBack } from '../utils/aiService';
import confetti from 'canvas-confetti';

export default function TeachBackStage({ topic, language, apiKey, onAddWeakness, onNextStage }) {
  const [studentText, setStudentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationReport, setVerificationReport] = useState(null);

  const handleTryAgain = () => {
    setStudentText('');
    setVerificationReport(null);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      startListening({
        lang: language,
        onResult: (transcript) => {
          setStudentText(transcript);
        },
        onError: (err) => {
          console.warn("Speech recognition error:", err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!studentText.trim()) return;

    setIsVerifying(true);
    stopListening();
    setIsRecording(false);

    try {
      const report = await verifyTeachBack({
        chunks: topic.chunks,
        conceptTitle: topic.title,
        studentExplanation: studentText,
        language: language,
        apiKey: apiKey
      });

      setVerificationReport(report);

      if (report.isUnderstood) {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      }

      // Automatically log any misconceptions to the Weakness Tracker!
      if (report.misconceptions && report.misconceptions.length > 0) {
        report.misconceptions.forEach(misc => {
          onAddWeakness({
            id: 'w-' + Date.now() + Math.random().toString(36).substring(2, 6),
            topicTitle: topic.title,
            misconception: misc,
            date: new Date().toLocaleDateString(),
            groundedRef: report.groundedRef || 'Source Material'
          });
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Stage Header */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-warm)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-terracotta)]">
            Stage 4: Signature Teach-Back Verification
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-0.5">
            Teach It Back in Your Own Words!
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            The ultimate test of true understanding: Explain it like you are the teacher.
          </p>
        </div>

        {verificationReport && (
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
            {verificationReport.isUnderstood ? (
              <button
                onClick={onNextStage}
                className="px-5 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-sage-hover)] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <span>Proceed to Interactive Visual</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleTryAgain}
                  className="px-4 py-2.5 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onNextStage}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-card-alt)] hover:bg-[var(--border-warm)]/50 text-[var(--text-ink)] border border-[var(--border-warm)] font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Continue Anyway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Teach-Back Input Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border-warm)] shadow-sm space-y-6">
        {/* Prompt banner */}
        <div className="bg-[var(--primary-sage-light)] rounded-xl p-4 border border-[var(--primary-sage)]/30 flex items-start gap-3">
          <MessageSquareQuote className="w-6 h-6 text-[var(--primary-sage)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[var(--primary-sage)]">
              Your Challenge: Explain "{topic?.title}"
            </h3>
            <p className="text-xs text-[var(--text-ink)] leading-relaxed">
              Don't worry about perfect grammar! Speak or type naturally in your own words. The AI verifier will compare your points against the source content to highlight what you nailed and flag any tiny gaps.
            </p>
          </div>
        </div>

        {/* Input Form & Voice Recording Mic */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <textarea
              rows={5}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder={
                isRecording
                  ? "🎙 Listening to your voice... Speak clearly!"
                  : "Type or click the microphone button below to record your voice explanation..."
              }
              className={`w-full p-4 rounded-xl border text-base leading-relaxed transition-all ${
                isRecording
                  ? 'border-[var(--secondary-terracotta)] ring-2 ring-[var(--secondary-terracotta)]/20 bg-[var(--secondary-terracotta-light)]/30'
                  : 'border-[var(--border-warm)] bg-[var(--bg-parchment)] focus:bg-[var(--bg-card)]'
              }`}
            />

            {/* Mic Floating Indicator if recording */}
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-[var(--secondary-terracotta)] text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>Recording Voice...</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Voice Input Button */}
            {isSTTSupported ? (
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-md'
                    : 'bg-[var(--bg-card-alt)] hover:bg-[var(--border-warm)]/50 text-[var(--text-ink)] border-[var(--border-warm)]'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 text-white" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-[var(--secondary-terracotta)]" />
                    <span>Voice Input (Speech-to-Text)</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-[var(--text-muted)]">
                (Type your explanation above)
              </span>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifying || !studentText.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying Understanding...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify My Explanation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Report Card */}
      {verificationReport && (
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border-warm)] shadow-lg space-y-6 animate-fadeIn">
          {/* Header Score & Rating */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-warm)] pb-5">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md ${
                verificationReport.isUnderstood ? 'bg-[var(--success-green)]' : 'bg-[var(--warning-amber)]'
              }`}>
                {verificationReport.score}%
              </div>
              <div>
                <h3 className="font-bold text-xl text-[var(--text-ink)] leading-tight">
                  {verificationReport.summaryRating}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Semantic Verification against Source Material • {verificationReport.groundedRef}
                </p>
              </div>
            </div>

            {verificationReport.isUnderstood && (
              <span className="px-3.5 py-1.5 rounded-full bg-[var(--success-light)] text-[var(--success-green)] font-bold text-xs border border-[var(--success-green)]/30">
                ✓ Concept Mastered
              </span>
            )}
          </div>

          {/* Encouraging Feedback */}
          {verificationReport.encouragement && (
            <div className="bg-[var(--accent-amber-light)] rounded-xl p-4 border border-[var(--accent-amber)]/30 flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-[var(--accent-amber)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text-ink)] font-medium italic">
                "{verificationReport.encouragement}"
              </p>
            </div>
          )}

          {/* Detailed Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What you got right */}
            <div className="bg-[var(--success-light)] rounded-xl p-5 border border-[var(--success-green)]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--success-green)]">
                <CheckCircle2 className="w-4 h-4" />
                <span>What You Got Right! (Praise)</span>
              </div>
              <ul className="space-y-2 text-sm text-[var(--text-ink)]">
                {verificationReport.correctPoints?.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--success-green)] font-bold">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Misconceptions / Gaps Flagged */}
            <div className="bg-[var(--warning-light)] rounded-xl p-5 border border-[var(--warning-amber)]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--warning-amber)]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Misconceptions / Gaps Flagged</span>
                </div>
                {verificationReport.misconceptions?.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--secondary-terracotta)] text-white">
                    Logged to Weakness Tracker
                  </span>
                )}
              </div>

              {verificationReport.misconceptions?.length > 0 ? (
                <ul className="space-y-2 text-sm text-[var(--text-ink)]">
                  {verificationReport.misconceptions.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--warning-amber)] font-bold">⚠</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--success-green)] font-semibold">
                  No misconceptions detected! You explained everything accurately grounded in the source.
                </p>
              )}
            </div>
          </div>

          {/* Action Navigation Footer */}
          <div className="pt-4 border-t border-[var(--border-warm)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-muted)]">
              {verificationReport.isUnderstood
                ? "Great progress! You can move on to the interactive simulator."
                : "You can refine your explanation to improve your score, or proceed to the next stage."}
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {verificationReport.isUnderstood ? (
                <button
                  onClick={onNextStage}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-sage-hover)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Proceed to Interactive Visual</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTryAgain}
                    className="px-5 py-2.5 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={onNextStage}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-card-alt)] hover:bg-[var(--border-warm)]/50 text-[var(--text-ink)] border border-[var(--border-warm)] font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Continue Anyway</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
