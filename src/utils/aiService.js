/**
 * AI Service for ConceptCraft
 * Grounded generation engine for Level-Adaptive Explanations, Quizzes, and Teach-Back Verifications.
 * Supports Gemini API with built-in smart RAG fallback for zero-setup demo.
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Stage 2: EXPLAIN - Grounded Level-Adaptive Explanation Generation
 */
export async function generateLevelExplanation({ chunks, level = 'Beginner', language = 'en', apiKey = '' }) {
  const sourceContext = chunks
    .map(c => `[Passage ${c.passageNum}: ${c.title}]\n${c.content}`)
    .join('\n\n');

  const systemInstruction = `You are ConceptCraft, a patient, encouraging AI tutor. 
Your target audience includes low-literacy students, first-generation learners, and non-native English speakers.
STRICT RULE: Every explanation MUST be strictly grounded in the provided source passages below. Do NOT invent outside facts.

CRITICAL INSTRUCTION: Perform REAL synthesis, not simple copy-pasting or paragraph mirroring:
1. Actively identify and extract any formulas, equations, numbers, units, definitions, and key terms from the source chunks.
2. Present all extracted formulas and key definitions under a clearly labeled "Key Formulas & Definitions" section.
3. Restructure and simplify the explanation body for the requested level ("${level}"). For Beginner level, use simple everyday language and clear analogies.
4. Include passage references like [Passage 1] after key facts so students can inspect the source proof.
5. IMPORTANT: DO NOT USE LaTeX Math syntax (like $ or \\(\\)). Use plain text symbols (e.g. T(n), O(N^2), pi).
6. Write in clean Markdown format with ## headings and bullet points.

Language requested: ${language === 'hi' ? 'Hindi (or Hindi-English accessible script)' : 'English'}.

Format your response cleanly:
Explanation Body

Key Formulas & Definitions:
• <Extracted formula/equation/definition> [Passage X]

Everyday Analogy: <analogy>

Key Takeaways:
• <Point 1> [Passage X]
• <Point 2> [Passage X]`;

  const prompt = `SOURCE CONTENT:
${sourceContext}

TASK: Synthesize a grounded explanation for level "${level}". Extract formulas, definitions, and key points cleanly.`;

  // Try Gemini API if key exists
  // Uses @google/genai v2 API: ai.models.generateContent({ model, contents, config })
  if (apiKey && apiKey.trim()) {
    console.log("[ConceptCraft AI] ⚡ Invoking Gemini API for Explanation (Level: " + level + ")...");
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: { systemInstruction }
      });
      if (response.text) {
        console.log("[ConceptCraft AI] ✅ Gemini API Explanation SUCCESS! Source: Gemini");
        return parseExplanationOutput(response.text, chunks, level);
      }
      console.warn("[ConceptCraft AI] ⚠️ Gemini API returned empty response for Explanation.");
    } catch (err) {
      console.error("[ConceptCraft AI] ❌ Gemini API Explanation FAILED:", err.message, err);
    }
  } else {
    console.log("[ConceptCraft AI] ℹ️ No Gemini API key provided — skipping API, using Local Fallback.");
  }

  // Smart local RAG fallback
  console.log("[ConceptCraft AI] 📴 Triggering Local Fallback engine for Explanation.");
  return generateLocalExplanation(chunks, level, language);
}

/**
 * Utility to shuffle question options and update correctIndex
 * Fixes LLM bias where correct answers are frequently placed at index 0.
 */
function shuffleQuizOptions(question) {
  if (!question || !Array.isArray(question.options) || question.correctIndex === undefined) return question;
  
  const options = [...question.options];
  const correctOption = options[question.correctIndex];
  
  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return {
    ...question,
    options,
    correctIndex: options.indexOf(correctOption)
  };
}

/**
 * Stage 3: TEST - Adaptive Quiz Generation
 */
export async function generateAdaptiveQuiz({ chunks, difficulty = 1, previousMistakes = [], language = 'en', apiKey = '' }) {
  const sourceContext = chunks
    .map(c => `[Passage ${c.passageNum}: ${c.title}]\n${c.content}`)
    .join('\n\n');

  const systemInstruction = `You are ConceptCraft Quiz Generator. 
Generate 8 multiple-choice questions strictly based on the source text.
- Difficulty Level: ${difficulty} (1 = Plain language, basic recall; 2 = Understanding & application; 3 = Exam challenge).
- Grounding: Questions and correct answers MUST be traceable directly to the provided passages.
- Distribution: Distribute questions evenly across DIFFERENT sections and passages of the source material. Do not cluster on just the first concept. Reference passage numbers spread across the full range of chunks provided.
- Response MUST be valid JSON array of question objects.`;

  const prompt = `SOURCE TEXT:
${sourceContext}

Generate 8 quiz questions in JSON format. Distribute them across different source passages:
[
  {
    "id": 1,
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this is correct grounded in passage...",
    "sourcePassageNum": 1
  }
]`;

  if (apiKey && apiKey.trim()) {
    console.log("[ConceptCraft AI] ⚡ Invoking Gemini API for Adaptive Quiz (Difficulty: " + difficulty + ")...");
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: { systemInstruction, responseMimeType: 'application/json' }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log("[ConceptCraft AI] ✅ Gemini API Quiz SUCCESS! Source: Gemini");
          const shuffledQuiz = parsed.map(shuffleQuizOptions);
          shuffledQuiz.source = 'Gemini';
          return shuffledQuiz;
        }
        console.warn("[ConceptCraft AI] ⚠️ Gemini Quiz returned non-array or empty JSON.");
      } else {
        console.warn("[ConceptCraft AI] ⚠️ Gemini Quiz returned empty response text.");
      }
    } catch (err) {
      console.error("[ConceptCraft AI] ❌ Gemini Quiz API FAILED:", err.message, err);
    }
  } else {
    console.log("[ConceptCraft AI] ℹ️ No Gemini API key provided for Quiz — using Local Fallback.");
  }

  console.log("[ConceptCraft AI] 📴 Triggering Local Fallback engine for Adaptive Quiz.");
  const localQuiz = generateLocalQuiz(chunks, difficulty, language);
  const shuffledLocalQuiz = localQuiz.map(shuffleQuizOptions);
  shuffledLocalQuiz.source = 'Local Fallback';
  return shuffledLocalQuiz;
}

/**
 * Stage 4: TEACH-BACK & VERIFY - Semantic Verification against Source
 */
export async function verifyTeachBack({ chunks, conceptTitle, studentExplanation, language = 'en', apiKey = '' }) {
  const sourceContext = chunks
    .map(c => `[Passage ${c.passageNum}: ${c.title}]\n${c.content}`)
    .join('\n\n');

  const systemInstruction = `You are ConceptCraft Teach-Back Verifier.
The student has explained the topic in their own words. Compare their explanation against the original source text.

Tasks:
1. Evaluate overall understanding (isUnderstood: boolean, score: 0-100).
2. List 2-3 specific points the student got RIGHT (praise).
3. Flag any specific MISCONCEPTIONS or key details missing.
4. Provide warm, encouraging, plain-language guidance.
5. JSON format response.`;

  const prompt = `SOURCE MATERIAL:
${sourceContext}

TOPIC: ${conceptTitle}
STUDENT'S EXPLANATION:
"${studentExplanation}"

Respond ONLY in JSON format:
{
  "score": 85,
  "isUnderstood": true,
  "summaryRating": "Great job! You understood the main core concept.",
  "correctPoints": ["You correctly identified that...", "You explained..."],
  "misconceptions": ["Keep in mind that resistance squeezes current, not voltage."],
  "encouragement": "You are explaining this like a true pro! Just remember the difference between push (voltage) and friction (resistance).",
  "groundedRef": "Passage 1 & Passage 3"
}`;

  if (apiKey && apiKey.trim()) {
    console.log("[ConceptCraft AI] ⚡ Invoking Gemini API for Teach-Back Verification...");
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: { systemInstruction, responseMimeType: 'application/json' }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        console.log("[ConceptCraft AI] ✅ Gemini API Teach-Back SUCCESS! Source: Gemini");
        parsed.source = 'Gemini';
        parsed.isFallback = false;
        return parsed;
      }
      console.warn("[ConceptCraft AI] ⚠️ Gemini Teach-Back returned empty response text.");
    } catch (err) {
      console.error("[ConceptCraft AI] ❌ Gemini Teach-Back API FAILED:", err.message, err);
    }
  } else {
    console.log("[ConceptCraft AI] ℹ️ No Gemini API key provided for Teach-Back — using Local Fallback.");
  }

  console.log("[ConceptCraft AI] 📴 Triggering Local Fallback engine for Teach-Back Verification.");
  const localVer = generateLocalVerification(chunks, conceptTitle, studentExplanation, language);
  localVer.source = 'Local Fallback';
  localVer.isFallback = true;
  return localVer;
}

/* ====================================================================
   SMART LOCAL RAG GENERATOR FALLBACKS (Guarantees smooth offline/zero-key demo)
   ==================================================================== */

/**
 * Real pattern extraction logic for local RAG fallback:
 * Scans chunks for formulas/equations, definitions, and information-dense sentences.
 */
function extractFormulasAndDefinitions(chunks) {
  const formulas = [];
  const definitions = [];
  const keySentences = [];

  if (!chunks || chunks.length === 0) return { formulas, definitions, keySentences };

  const formulaRegex = /=|formula|equation|equals|times|divided|ratio|\bV\b|\bΩ\b|\bA\b|\bH2O\b|\bCO2\b|\bO2\b|\bC6H12O6\b|[0-9]+\s*(volts|amps|ohms|volts|watts|m\/s|kg|%|°c)/i;
  const defRegex = /\bis defined as\b|\brefers to\b|\bis the process\b|\bis a\b|\bis an\b|\bis measured in\b|\bis known as\b|\bmeans\b|\bacts like\b|\bdescribes\b|\bis the actual\b|\bis the opposition\b|\bis the essential\b|\bis the fundamental\b|\bis the continuous\b/i;

  chunks.forEach(chunk => {
    const rawSentences = chunk.content
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 12);

    rawSentences.forEach(sentence => {
      const cleanSentence = sentence.replace(/\[Passage\s*\d+[^\]]*\]/gi, '').trim();

      if (formulaRegex.test(cleanSentence)) {
        if (!formulas.some(f => f.text === cleanSentence)) {
          formulas.push({
            text: cleanSentence,
            passageNum: chunk.passageNum,
            title: chunk.title
          });
        }
      }

      if (defRegex.test(cleanSentence)) {
        if (!definitions.some(d => d.text === cleanSentence)) {
          definitions.push({
            text: cleanSentence,
            passageNum: chunk.passageNum,
            title: chunk.title
          });
        }
      }

      if (cleanSentence.length > 25 && cleanSentence.length < 180) {
        if (!keySentences.some(k => k.text === cleanSentence)) {
          keySentences.push({
            text: cleanSentence,
            passageNum: chunk.passageNum,
            title: chunk.title
          });
        }
      }
    });
  });

  return { formulas, definitions, keySentences };
}

function parseExplanationOutput(text, chunks, level) {
  let analogy = "";
  const analogyMatch = text.match(/analogy:?\s*([^\n]+)/i);
  if (analogyMatch) {
    analogy = analogyMatch[1].replace(/[*_"]/g, '').trim();
  } else {
    analogy = `Grounded synthesis generated for ${chunks[0]?.sourceName || chunks[0]?.title || 'uploaded material'}.`;
  }

  let keyDefinitions = [];
  const keyDefMatch = text.match(/(?:Key Formulas & Definitions|Formulas & Definitions|Key Definitions):?\s*([\s\S]*?)(?=\n\n###|\n\nEveryday Analogy|\n\nKey Takeaways|$)/i);
  if (keyDefMatch) {
    keyDefinitions = keyDefMatch[1]
      .split('\n')
      .map(l => l.replace(/^[•*\-\d.]+\s*/, '').trim())
      .filter(l => l.length > 5);
  }

  if (keyDefinitions.length === 0) {
    const extracted = extractFormulasAndDefinitions(chunks);
    keyDefinitions = [...extracted.formulas, ...extracted.definitions].slice(0, 4).map(item => `${item.text} [Passage ${item.passageNum}]`);
  }

  return {
    level,
    text: text,
    analogy: analogy,
    keyDefinitions: keyDefinitions,
    bulletPoints: null, // Removed placeholder; Gemini output already includes its own Markdown takeaways
    referencedChunks: chunks.slice(0, 3),
    source: 'Gemini',
    isFallback: false
  };
}

function generateLocalExplanation(chunks, level, language) {
  console.log("[ConceptCraft AI Service] Local Fallback Generator running for level:", level);
  if (!chunks || chunks.length === 0) {
    return {
      level,
      text: 'No material loaded yet.',
      formulasAndDefinitions: [],
      keyDefinitions: [],
      analogy: null,
      bulletPoints: [],
      referencedChunks: [],
      engineUsed: 'Local Fallback',
      source: 'Local Fallback',
      isFallback: true
    };
  }

  const allText = chunks.map(c => c.content).join(' ');
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [allText];

  // Extract formula-like sentences (contains = sign or common formula patterns)
  const formulaSentences = sentences.filter(s => /=|formula|equation/i.test(s)).slice(0, 3);

  // Extract definition-style sentences
  const definitionSentences = sentences.filter(s => 
    /\bis\b.*(defined as|refers to|means|known as)|^[A-Z][a-z]+ is /i.test(s)
  ).slice(0, 4);

  // Score sentences by information density (longer, contains numbers/capitalized terms = more likely key point)
  const scoredSentences = sentences.map(s => {
    let score = 0;
    if (/\d/.test(s)) score += 2;
    if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(s)) score += 1;
    if (s.length > 40 && s.length < 200) score += 1;
    return { text: s.trim(), score };
  }).sort((a, b) => b.score - a.score);

  const keyPoints = scoredSentences.slice(0, 5).map(s => s.text);

  let explanationText = '';
  if (level === 'Beginner') {
    explanationText = keyPoints.slice(0, 3).map(s => 
      s.replace(/\b(\w+)\b/g, (word) => word)
    ).join(' ');
    if (!explanationText) explanationText = sentences.slice(0, 3).join(' ');
  } else if (level === 'Intermediate') {
    explanationText = keyPoints.join(' ');
  } else {
    // Exam-Revision: bullet-style, dense
    explanationText = keyPoints.map(p => `• ${p}`).join('\n');
  }

  const formulasAndDefs = [...formulaSentences, ...definitionSentences];

  return {
    level,
    text: explanationText || 'Unable to extract clear content — try a longer source passage.',
    formulasAndDefinitions: formulasAndDefs,
    keyDefinitions: formulasAndDefs,
    analogy: level === 'Beginner' ? generateSimpleAnalogy(keyPoints[0] || '') : null,
    bulletPoints: keyPoints.slice(0, 3),
    referencedChunks: chunks.slice(0, 3),
    engineUsed: 'Local Fallback',
    source: 'Local Fallback',
    isFallback: true
  };
}

function generateSimpleAnalogy(sampleText) {
  return `Think of this like something familiar in everyday life — imagine how ${sampleText.slice(0, 60).toLowerCase()}... relates to something you already know.`;
}

function generateLocalQuiz(chunks, difficulty, language) {
  const isHindi = language === 'hi';
  
  if (chunks.length > 0 && chunks[0].title.toLowerCase().includes('ohm')) {
    return [
      {
        id: 1,
        question: isHindi 
          ? "विद्युत धारा (Current) के प्रवाह को कौन सा बल आगे धकेलता है?" 
          : "What force acts like electrical pressure pushing charge through a circuit?",
        options: isHindi 
          ? ["वोल्टेज (Voltage)", "प्रतिरोध (Resistance)", "द्रव्यमान (Mass)", "तापमान (Temperature)"] 
          : ["Voltage (V)", "Resistance (R)", "Friction", "Temperature"],
        correctIndex: 0,
        explanation: isHindi
          ? "Passage 1 के अनुसार, वोल्टेज वह विद्युत दाब (pressure) है जो धारा को आगे धकेलता है।"
          : "According to Passage 1: 'Voltage is the electrical pressure or push that forces electric charge through a circuit.'",
        sourcePassageNum: 1
      },
      {
        id: 2,
        question: isHindi
          ? "यदि किसी सर्किट में प्रतिरोध (Resistance) को बढ़ा दिया जाए, तो धारा (Current) पर क्या प्रभाव पड़ेगा?"
          : "If you increase Resistance while keeping Voltage constant, what happens to the Current?",
        options: isHindi
          ? ["धारा घट जाएगी (Current decreases)", "धारा बढ़ जाएगी", "धारा वैसी ही रहेगी", "सर्किट जल जाएगा"]
          : ["Current decreases", "Current increases", "Current stays exactly the same", "Voltage vanishes"],
        correctIndex: 0,
        explanation: isHindi
          ? "Passage 4 के अनुसार, यदि प्रतिरोध बढ़ता है, तो विद्युत धारा का बहाव धीमा या कम हो जाता है।"
          : "Grounded in Passage 4: 'If you increase resistance while keeping voltage constant, current decreases.'",
        sourcePassageNum: 4
      },
      {
        id: 3,
        question: isHindi
          ? "ओम के नियम (Ohm's Law) का सही गणितीय सूत्र कौन सा है?"
          : "What is the correct mathematical formula for Ohm's Law?",
        options: ["V = I × R", "V = I + R", "V = R / I", "I = V × R"],
        correctIndex: 0,
        explanation: isHindi
          ? "Passage 4 के अनुसार: V = I × R (Voltage = Current × Resistance)."
          : "Grounded in Passage 4: 'The relationship is expressed in the formula: V = I × R.'",
        sourcePassageNum: 4
      }
    ];
  }

  // Generic grounded quiz fallback
  return [
    {
      id: 1,
      question: `Based on Passage 1 (${chunks[0]?.title || 'Passage 1'}), what is the primary driving force or mechanism?`,
      options: [
        chunks[0]?.content.slice(0, 50) + "...",
        "An unrelated secondary factor",
        "Decreasing energy input",
        "None of the above"
      ],
      correctIndex: 0,
      explanation: `Directly supported by Passage 1: "${chunks[0]?.content.slice(0, 100)}..."`,
      sourcePassageNum: 1
    },
    {
      id: 2,
      question: `According to Passage 2, how do key factors interact?`,
      options: [
        "They balance and affect the overall outcome",
        "They have no relationship",
        "Only the first factor matters",
        "It cancels out completely"
      ],
      correctIndex: 0,
      explanation: "Grounded in Passage 2 source details.",
      sourcePassageNum: 2
    }
  ];
}

/**
 * Helper: Extracts key terms from source chunks for topic-generic verification.
 */
function extractKeyTermsFromChunks(chunks) {
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'which',
    'would', 'their', 'there', 'they', 'also', 'been', 'each', 'other', 'them',
    'about', 'into', 'more', 'some', 'these', 'than', 'only', 'such', 'when',
    'like', 'through', 'over', 'after', 'first', 'used', 'make', 'made', 'most',
    'call', 'called', 'using', 'between', 'under', 'where', 'while', 'same',
    'passage', 'section', 'chapter', 'content', 'topic'
  ]);

  const termsByPassage = [];
  if (!chunks || chunks.length === 0) return termsByPassage;

  chunks.forEach(chunk => {
    const text = `${chunk.title || ''} ${chunk.content || ''}`;
    const rawWords = text.match(/[A-Z][a-z]{2,}|[a-z]{4,}/g) || [];
    const uniqueTerms = [];

    rawWords.forEach(w => {
      const lower = w.toLowerCase();
      if (!stopWords.has(lower) && !uniqueTerms.includes(lower)) {
        uniqueTerms.push(lower);
      }
    });

    termsByPassage.push({
      passageNum: chunk.passageNum || 1,
      title: chunk.title || `Passage ${chunk.passageNum || 1}`,
      keyTerms: uniqueTerms.slice(0, 8)
    });
  });

  return termsByPassage;
}

function generateLocalVerification(chunks, conceptTitle = 'this concept', studentText = '', language = 'en') {
  const isHindi = language === 'hi';
  const textLower = studentText.toLowerCase();

  const passageTerms = extractKeyTermsFromChunks(chunks);

  const matchedPassages = [];
  const missedPassages = [];
  const correctPoints = [];
  const misconceptions = [];

  let totalTermsChecked = 0;
  let totalTermsMatched = 0;

  passageTerms.forEach(p => {
    const matchedInPassage = p.keyTerms.filter(kt => textLower.includes(kt));
    totalTermsChecked += Math.min(p.keyTerms.length, 4);
    totalTermsMatched += matchedInPassage.length;

    if (matchedInPassage.length > 0) {
      matchedPassages.push(p.passageNum);
      const displayTerms = matchedInPassage.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
      correctPoints.push(
        isHindi
          ? `आपने ${p.title} से मुख्य अवधारणाओं (${displayTerms}) को सही ढंग से समझाया!`
          : `You accurately included key concepts (${displayTerms}) from ${p.title}!`
      );
    } else {
      missedPassages.push(p.passageNum);
      const topTerm = p.keyTerms[0] ? (p.keyTerms[0].charAt(0).toUpperCase() + p.keyTerms[0].slice(1)) : 'key details';
      misconceptions.push(
        isHindi
          ? `याद रखें कि ${p.title} से ${topTerm} का उल्लेख भी शामिल करें।`
          : `Remember to mention ${topTerm} from ${p.title} for a complete explanation.`
      );
    }
  });

  let coverageRatio = totalTermsChecked > 0 ? (totalTermsMatched / totalTermsChecked) : 0.5;
  let score = Math.round(coverageRatio * 70);

  if (studentText.length > 40) score += 15;
  if (studentText.length > 100) score += 15;

  score = Math.min(100, Math.max(35, score));

  const isUnderstood = score >= 65;

  const summaryRating = isUnderstood
    ? (isHindi 
        ? `शानदार! आपने "${conceptTitle}" के मुख्य सिद्धांतों को बहुत अच्छी तरह समझाया है!` 
        : `Awesome job! You demonstrated a clear understanding of "${conceptTitle}".`)
    : (isHindi 
        ? `अच्छी कोशिश! आइए "${conceptTitle}" के कुछ मुख्य बिंदुओं को फिर से देखें।` 
        : `Good effort! Let's clarify a couple of key concepts from "${conceptTitle}".`);

  const encouragement = isUnderstood
    ? (isHindi
        ? `आप इसे एक सच्चे शिक्षक की तरह समझा रहे हैं! स्रोत सामग्री के साथ आपका संरेखण बहुत मजबूत है।`
        : `You are explaining this like a true pro! Teaching it back in your own words is the single best way to master ${conceptTitle}.`)
    : (isHindi
        ? `शिक्षण एक प्रक्रिया है! छूटी हुई सामग्री को फिर से देखें और अपनी भाषा में फिर से कोशिश करें।`
        : `Teaching is a learning journey! Review the missed passage details and try explaining ${conceptTitle} again.`);

  const refPassages = matchedPassages.length > 0 
    ? matchedPassages.map(p => `Passage ${p}`).join(' & ')
    : `Passage 1 - Passage ${chunks.length}`;

  return {
    score,
    isUnderstood,
    summaryRating,
    correctPoints: correctPoints.length > 0 ? correctPoints : [
      isHindi ? "आपकी कोशिश बहुत अच्छी है और आपकी अभिव्यक्ति स्पष्ट है!" : "Great effort expressing your thoughts in plain language!"
    ],
    misconceptions: misconceptions.slice(0, 3),
    encouragement,
    groundedRef: refPassages
  };
}
