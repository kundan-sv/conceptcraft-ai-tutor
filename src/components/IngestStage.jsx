import React, { useState } from 'react';
import { Upload, FileText, Zap, Sun, CloudRain, ShieldCheck, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { extractAndChunkText, SAMPLE_TOPICS } from '../utils/groundingEngine';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Bundle worker locally via Vite — no CDN dependency or version-mismatch risk
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function IngestStage({ onMaterialLoaded, currentTopic, language }) {
  const [inputText, setInputText] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [chunksPreview, setChunksPreview] = useState(currentTopic?.chunks || []);

  const [pendingMaterial, setPendingMaterial] = useState(null);

  const handleSelectSample = (sample) => {
    setIsLoading(true);
    setLoadingStep('Ingesting sample topic & extracting grounded passages...');
    setTimeout(() => {
      const chunks = extractAndChunkText(sample.rawText, sample.title);
      setChunksPreview(chunks);
      setTopicTitle(sample.title);
      setInputText(sample.rawText);
      setIsLoading(false);
      setPendingMaterial(null);
      onMaterialLoaded({
        id: sample.id,
        title: sample.title,
        chunks: chunks,
        rawText: sample.rawText,
        hasInteractiveVisual: sample.hasInteractiveVisual
      });
    }, 400);
  };

  const handleConfirmAndProceed = () => {
    const material = pendingMaterial || {
      id: 'custom-' + Date.now(),
      title: topicTitle.trim() || 'Custom Learning Material',
      chunks: chunksPreview,
      rawText: inputText,
      hasInteractiveVisual: false
    };
    onMaterialLoaded(material);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsLoading(true);
    setLoadingStep('Extracting semantic passages and indexing for RAG grounding...');
    setTimeout(() => {
      const title = topicTitle.trim() || 'Custom Learning Material';
      const chunks = extractAndChunkText(inputText, title);
      setChunksPreview(chunks);
      setIsLoading(false);
      const material = {
        id: 'custom-' + Date.now(),
        title: title,
        chunks: chunks,
        rawText: inputText,
        hasInteractiveVisual: false
      };
      setPendingMaterial(material);
      onMaterialLoaded(material);
    }, 400);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingStep(`Reading file: ${file.name}...`);

    try {
      if (file.type === 'application/pdf') {
        setLoadingStep('Extracting text from PDF pages...');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let pageText = '';
          let lastY = null;
          for (const item of textContent.items) {
            if (!item.str) continue;
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
              pageText += '\n\n';
            } else if (item.hasEOL) {
              pageText += '\n';
            } else if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
              pageText += ' ';
            }
            pageText += item.str;
            lastY = item.transform[5];
          }

          fullText += `[Passage ${i}: Page ${i}]\n${pageText.trim()}\n\n`;
        }
        const title = file.name.replace('.pdf', '');
        setTopicTitle(title);
        setInputText(fullText);
        const chunks = extractAndChunkText(fullText, title);
        setChunksPreview(chunks);

        // Store pending material for review step before advancing!
        setPendingMaterial({
          id: 'pdf-' + Date.now(),
          title: title,
          chunks: chunks,
          rawText: fullText,
          hasInteractiveVisual: false
        });
      } else {
        // Plain text file (.txt, .md)
        const text = await file.text();
        const title = file.name.replace(/\.[^/.]+$/, '');
        setTopicTitle(title);
        setInputText(text);
        const chunks = extractAndChunkText(text, title);
        setChunksPreview(chunks);

        // Store pending material for review step before advancing!
        setPendingMaterial({
          id: 'txt-' + Date.now(),
          title: title,
          chunks: chunks,
          rawText: text,
          hasInteractiveVisual: false
        });
      }
    } catch (err) {
      console.error('PDF parse error:', err);
      alert('Could not parse file. Try pasting the text directly into the text box below.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Introduction Card */}
      <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--primary-sage-light)] rounded-3xl p-8 border-2 border-[var(--primary-sage)] shadow-md fade-in-up">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-sage)] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[var(--primary-sage)]/30">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--text-ink)] mb-2">
              What do you want to master today?
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
              ConceptCraft uses <strong className="text-[var(--text-ink)]">grounded RAG AI</strong>. We never invent facts. 
              Upload your own study material below (PDF or Text), and we will extract exact passages to teach you from. 
              Or, try a Quick Start sample!
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Sample Topics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
            ⚡ Quick Start — Choose a Pre-Loaded Topic
          </h3>
          <span className="text-xs text-[var(--text-light)]">1-Click Instant Demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_TOPICS.map((topic) => {
            const Icon = topic.icon === 'Zap' ? Zap : topic.icon === 'Sun' ? Sun : CloudRain;
            const isSelected = currentTopic?.id === topic.id;

            return (
              <button
                key={topic.id}
                onClick={() => handleSelectSample(topic)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[var(--bg-card)] border-[var(--secondary-terracotta)] ring-2 ring-[var(--secondary-terracotta)]/20 shadow-md'
                    : 'bg-[var(--bg-card)] border-[var(--border-warm)] hover:border-[var(--secondary-terracotta)]/50 hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-[var(--primary-sage-light)] text-[var(--primary-sage)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-card-alt)] text-[var(--text-muted)]">
                      {topic.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-[var(--text-ink)] mb-1 leading-snug">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {topic.summary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--secondary-terracotta)]">
                  <span>Start Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Upload Section (Hero Treatment) */}
      <div className="md:col-span-12">
        <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-[var(--secondary-terracotta)] shadow-xl relative overflow-hidden group transition-all hover:shadow-2xl fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--secondary-terracotta)]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary-terracotta-light)] text-[var(--secondary-terracotta)] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl text-[var(--text-ink)]">Upload Your Material</h3>
          </div>

          {/* File Dropzone */}
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-warm)] rounded-xl bg-[var(--bg-card-alt)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors text-center mb-6">
            <Upload className="w-8 h-8 text-[var(--secondary-terracotta)] mb-2 animate-bounce" />
            <span className="text-sm font-bold text-[var(--text-ink)]">
              Click to upload PDF, .txt, or .md file
            </span>
            <span className="text-xs text-[var(--text-muted)] mt-1">
              App extracts & chunks text automatically
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Manual Text Form */}
          <form onSubmit={handleTextSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                Topic Title (Optional)
              </label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Newton's Laws of Motion"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-parchment)] text-sm focus:bg-[var(--bg-card)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                Paste Notes / Text Content
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste raw textbook content or notes here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-parchment)] text-sm focus:bg-[var(--bg-card)] transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-[var(--secondary-terracotta)] hover:bg-[var(--secondary-terracotta-hover)] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {loadingStep}
                </span>
              ) : (
                <>
                  <span>Extract Passages & Build Lesson</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Grounded Chunks Preview & Confirmation Step */}
      {chunksPreview.length > 0 && (
        <div className="bg-[var(--bg-card-alt)] rounded-2xl p-5 border-2 border-[var(--primary-sage)] space-y-4 animate-fadeIn shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-warm)] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-[var(--primary-sage)]" />
              <div>
                <h4 className="font-bold text-lg text-[var(--text-ink)] leading-none">
                  Review Extracted Passages ({chunksPreview.length} Chunks)
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Topic: "{topicTitle || pendingMaterial?.title || 'Extracted Material'}"
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmAndProceed}
              className="px-6 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-sage-hover)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
            >
              <span>Looks good, build my lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {chunksPreview.map((chunk) => (
              <div key={chunk.id} className="bg-[var(--bg-card)] rounded-xl p-3.5 border border-[var(--border-warm)] text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[var(--secondary-terracotta)]">
                  <span>Passage #{chunk.passageNum}</span>
                  <span className="text-[10px] text-[var(--text-light)]">{chunk.id}</span>
                </div>
                <p className="text-[var(--text-ink)] line-clamp-3 leading-relaxed font-sans">
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
