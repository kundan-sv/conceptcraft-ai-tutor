import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CraftPathStepper from './components/CraftPathStepper';
import IngestStage from './components/IngestStage';
import ExplainStage from './components/ExplainStage';
import QuizStage from './components/QuizStage';
import TeachBackStage from './components/TeachBackStage';
import VisualStage from './components/VisualStage';
import WeaknessTrackerDrawer from './components/WeaknessTrackerDrawer';
import ApiKeyModal from './components/ApiKeyModal';
import { SAMPLE_TOPICS, extractAndChunkText } from './utils/groundingEngine';

export default function App() {
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState({ ingest: true });
  
  // Pre-load default sample topic (Ohm's Law) so lesson is ready out of the box!
  const defaultSample = SAMPLE_TOPICS[0];
  const defaultChunks = extractAndChunkText(defaultSample.rawText, defaultSample.title);

  const [currentTopic, setCurrentTopic] = useState({
    id: defaultSample.id,
    title: defaultSample.title,
    chunks: defaultChunks,
    rawText: defaultSample.rawText,
    hasInteractiveVisual: defaultSample.hasInteractiveVisual
  });

  // Weakness tracker persistent state
  const [weaknesses, setWeaknesses] = useState(() => {
    const saved = localStorage.getItem('conceptcraft_weaknesses');
    return saved ? JSON.parse(saved) : [];
  });

  // API Key state
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('conceptcraft_gemini_key') || '';
  });

  // Modals state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isWeaknessTrackerOpen, setIsWeaknessTrackerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('conceptcraft_weaknesses', JSON.stringify(weaknesses));
  }, [weaknesses]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('conceptcraft_gemini_key', key);
  };

  const handleMaterialLoaded = (topicObj) => {
    setCurrentTopic(topicObj);
    setCompletedStages(prev => ({ ...prev, ingest: true }));
    // Auto advance to Explain Stage
    setCurrentStage(2);
  };

  const handleAddWeakness = (weaknessObj) => {
    setWeaknesses(prev => [weaknessObj, ...prev]);
  };

  const handleRemoveWeakness = (id) => {
    setWeaknesses(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-parchment)] text-[var(--text-ink)] font-sans antialiased">
      {/* Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenWeaknessTracker={() => setIsWeaknessTrackerOpen(true)}
        weaknessCount={weaknesses.length}
        hasApiKey={!!apiKey}
      />

      {/* Main Container */}
      <main className="app-container flex-1 py-6 space-y-6">
        {/* Signature Element: Craft Path Journey Bar */}
        <CraftPathStepper
          currentStage={currentStage}
          setStage={setCurrentStage}
          completedStages={completedStages}
        />

        {/* Guided Stage Views */}
        <div key={currentStage} className="fade-in-up">
          {currentStage === 1 && (
            <IngestStage
              onMaterialLoaded={handleMaterialLoaded}
              currentTopic={currentTopic}
              language={language}
            />
          )}

          {currentStage === 2 && (
            <ExplainStage
              topic={currentTopic}
              language={language}
              apiKey={apiKey}
              onNextStage={() => {
                setCompletedStages(prev => ({ ...prev, explain: true }));
                setCurrentStage(3);
              }}
            />
          )}

          {currentStage === 3 && (
            <QuizStage
              topic={currentTopic}
              language={language}
              apiKey={apiKey}
              onNextStage={() => {
                setCompletedStages(prev => ({ ...prev, test: true }));
                setCurrentStage(4);
              }}
            />
          )}

          {currentStage === 4 && (
            <TeachBackStage
              topic={currentTopic}
              language={language}
              apiKey={apiKey}
              onAddWeakness={handleAddWeakness}
              onNextStage={() => {
                setCompletedStages(prev => ({ ...prev, teachback: true, visual: true }));
                setCurrentStage(5);
              }}
            />
          )}

          {currentStage === 5 && (
            <VisualStage
              topic={currentTopic}
            />
          )}
        </div>
      </main>

      {/* Encouraging Footer */}
      <footer className="w-full bg-[var(--bg-card)] border-t border-[var(--border-warm)] py-6 mt-12 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-[var(--text-ink)]">
            <span>ConceptCraft AI</span>
            <span>•</span>
            <span className="text-[var(--primary-sage)]">Voice-First Grounded Tutor</span>
          </div>
          <p>
            Built for first-generation learners, low-literacy students & non-native English speakers.
          </p>
          <p className="font-mono text-[10px]">
            100% Grounded in Source • Web Speech API Powered
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <WeaknessTrackerDrawer
        isOpen={isWeaknessTrackerOpen}
        onClose={() => setIsWeaknessTrackerOpen(false)}
        weaknesses={weaknesses}
        onRemoveWeakness={handleRemoveWeakness}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
