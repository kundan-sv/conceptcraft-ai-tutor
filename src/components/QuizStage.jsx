import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Flame, ArrowRight, BookOpen, RefreshCw, Sparkles, Award } from 'lucide-react';
import { generateAdaptiveQuiz } from '../utils/aiService';
import confetti from 'canvas-confetti';

export default function QuizStage({ topic, language, apiKey, onNextStage }) {
  const [difficulty, setDifficulty] = useState(1);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (!topic || !topic.chunks) return;
    loadQuiz(difficulty);
  }, [topic, language]);

  const loadQuiz = async (diff) => {
    setIsLoading(true);
    setQuizCompleted(false);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);

    try {
      const qList = await generateAdaptiveQuiz({
        chunks: topic.chunks,
        difficulty: diff,
        language: language,
        apiKey: apiKey
      });
      setQuestions(qList);
    } catch (err) {
      console.error("Quiz load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const currentQ = questions[currentIdx];
    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Trigger celebratory confetti if streak >= 2
      if (newStreak >= 2) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }

      // Adaptive difficulty bump after streak
      if (newStreak >= 2 && difficulty < 3) {
        setDifficulty(prev => prev + 1);
      }
    } else {
      setStreak(0);
      // Adaptive difficulty step down after mistake if > 1
      if (difficulty > 1) {
        setDifficulty(prev => prev - 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="w-full space-y-6">
      {/* Quiz Stage Header */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-warm)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-amber)]">
            Stage 3: Grounded Adaptive Quiz
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-0.5">
            Test Your Understanding
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Strictly generated from source content • Adapts difficulty dynamically
          </p>
        </div>

        {/* Adaptive Controls Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-amber-light)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 text-xs font-bold">
            <Flame className="w-4 h-4 fill-current text-[var(--accent-amber)]" />
            <span>Streak: {streak}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[var(--primary-sage-light)] text-[var(--primary-sage)] border border-[var(--primary-sage)]/30 text-xs font-bold">
            Adaptive Level {difficulty}
          </div>
        </div>
      </div>

      {/* Main Quiz Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border-warm)] shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[var(--accent-amber)] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[var(--text-ink)]">
              Building grounded quiz questions from source material...
            </p>
          </div>
        ) : quizCompleted ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[var(--success-light)] text-[var(--success-green)] flex items-center justify-center mx-auto shadow-md">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-ink)] mb-1">
                Quiz Completed! Score: {score} / {questions.length}
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {score === questions.length
                  ? "Flawless score! You have a strong grasp of the material."
                  : "Great effort! You're ready for the Teach-Back verification stage."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => loadQuiz(difficulty)}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-card-alt)] hover:bg-[var(--border-warm)]/40 text-[var(--text-ink)] border border-[var(--border-warm)] text-sm font-bold transition-colors"
              >
                Retake Quiz
              </button>
              <button
                onClick={onNextStage}
                className="px-6 py-3 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-base flex items-center gap-2 shadow-md transition-all"
              >
                <span>Proceed to Teach-Back Verification</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : currentQ ? (
          <div className="space-y-6">
            {/* Question Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="badge-grounded">
                <BookOpen className="w-3 h-3" /> Grounded in Passage #{currentQ.sourcePassageNum || 1}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-xl font-bold text-[var(--text-ink)] leading-snug">
              {currentQ.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;

                let btnStyle = "bg-[var(--bg-card-alt)] border-[var(--border-warm)] hover:bg-[var(--bg-card-hover)] text-[var(--text-ink)]";

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-[var(--success-light)] border-[var(--success-green)] text-[var(--success-green)] font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-red-50 border-red-300 text-red-700";
                  } else {
                    btnStyle = "bg-[var(--bg-card-alt)] opacity-50 border-[var(--border-subtle)] text-[var(--text-muted)]";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between text-base ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-warm)] flex items-center justify-center font-bold text-xs shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{optionText}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--success-green)] shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Grounded Explanation Box */}
            {isAnswered && (
              <div className="bg-[var(--bg-card-alt)] rounded-xl p-5 border border-[var(--border-warm)] space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary-sage)]">
                  <Sparkles className="w-4 h-4" />
                  <span>Source Proof Explanation</span>
                </div>
                <p className="text-sm text-[var(--text-ink)] leading-relaxed">
                  {currentQ.explanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
