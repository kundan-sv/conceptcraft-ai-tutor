/**
 * Web Speech API Utilities (TTS SpeechSynthesis & STT SpeechRecognition)
 * Provides reliable, zero-dependency voice narration & audio input.
 */

// Check browser support
export const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
export const isSTTSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

let activeUtterance = null;
let activeRecognition = null;
let speechQueue = [];
let speechTimeoutId = null;
let isSpeakingCancelled = false;

/**
 * Finds the highest quality voice available for the target language.
 */
function getBestVoice(targetLang) {
  if (!isTTSSupported) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetPrefix = targetLang.slice(0, 2).toLowerCase();
  const matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetPrefix));

  if (matchingVoices.length === 0) return voices[0];

  // Prioritize Google, Natural, Microsoft, or Premium enhanced voices
  const priorityKeywords = ['google', 'natural', 'microsoft', 'premium', 'enhanced', 'samantha', 'karen', 'daniel', 'rishi', 'neerja', 'heera'];

  for (const keyword of priorityKeywords) {
    const found = matchingVoices.find(v => v.name.toLowerCase().includes(keyword));
    if (found) return found;
  }

  return matchingVoices[0];
}

/**
 * Text-to-Speech Narrator using SpeechSynthesis
 * Features sentence-level chunking with natural micro-pauses and high-quality voice selection.
 */
export function speakText({ text, lang = 'en-US', rate = 1.0, pitch = 1.0, onStart, onEnd, onError, onBoundary }) {
  if (!isTTSSupported) {
    if (onError) onError('Web Speech API is not supported in this browser.');
    return false;
  }

  // Stop any currently playing audio and clear queue
  stopSpeaking();
  isSpeakingCancelled = false;

  // Strip Markdown markers like **bold** or [Passage 1] for clean reading
  const cleanText = text
    .replace(/\[Passage\s*\d+[^\]]*\]/gi, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s*/g, '')
    .trim();

  if (!cleanText) return false;

  // Split into sentence chunks for natural sentence-boundary pauses
  const sentences = cleanText
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 0) return false;

  speechQueue = [...sentences];

  const targetLang = (lang === 'hi' || lang === 'hi-IN') ? 'hi-IN' : 'en-US';

  // Ensure voices are loaded
  let bestVoice = getBestVoice(targetLang);

  // Adjusted natural rate (slightly calmer default pacing ~0.95x) and pitch (1.0)
  const naturalRate = Math.max(0.7, Math.min(1.3, rate * 0.95));
  const naturalPitch = pitch;

  let hasStarted = false;

  function speakNextSentence() {
    if (isSpeakingCancelled || speechQueue.length === 0) {
      activeUtterance = null;
      if (!isSpeakingCancelled && onEnd) onEnd();
      return;
    }

    const sentenceText = speechQueue.shift();
    const utterance = new SpeechSynthesisUtterance(sentenceText);
    utterance.lang = targetLang;
    utterance.rate = naturalRate;
    utterance.pitch = naturalPitch;

    if (bestVoice) {
      utterance.voice = bestVoice;
    } else {
      const refreshedVoice = getBestVoice(targetLang);
      if (refreshedVoice) utterance.voice = refreshedVoice;
    }

    utterance.onstart = () => {
      activeUtterance = utterance;
      if (!hasStarted) {
        hasStarted = true;
        if (onStart) onStart();
      }
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (isSpeakingCancelled) return;

      if (speechQueue.length > 0) {
        // Micro-pause (220ms delay) at sentence boundary for natural human breathing rhythm
        speechTimeoutId = setTimeout(() => {
          speakNextSentence();
        }, 220);
      } else {
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (evt) => {
      activeUtterance = null;
      if (evt.error !== 'canceled' && onError) {
        onError(evt.error || 'Speech synthesis error');
      }
    };

    utterance.onboundary = (evt) => {
      if (onBoundary) onBoundary(evt);
    };

    window.speechSynthesis.speak(utterance);
  }

  // Handle asynchronous voice loading in browsers like Chrome
  if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged === null) {
    window.speechSynthesis.onvoiceschanged = () => {
      bestVoice = getBestVoice(targetLang);
    };
  }

  speakNextSentence();
  return true;
}

export function stopSpeaking() {
  isSpeakingCancelled = true;
  speechQueue = [];
  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }
  if (isTTSSupported && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function pauseSpeaking() {
  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }
  if (isTTSSupported && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking() {
  if (isTTSSupported && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/**
 * Speech-to-Text Voice Input using SpeechRecognition
 */
export function startListening({ lang = 'en-US', onResult, onError, onEnd }) {
  if (!isSTTSupported) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  stopListening();

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    if (onResult) {
      onResult(finalTranscript.trim() + (interimTranscript ? ' ' + interimTranscript : ''));
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error || 'Voice input error');
  };

  recognition.onend = () => {
    activeRecognition = null;
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    activeRecognition = recognition;
    return recognition;
  } catch (err) {
    if (onError) onError(err.message || 'Could not start microphone.');
    return null;
  }
}

export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // ignore
    }
    activeRecognition = null;
  }
}
