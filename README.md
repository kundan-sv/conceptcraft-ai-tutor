# 🎓 ConceptCraft — Grounded AI Tutor for Every Student

**Built for the Prometheus July AI Challenge**

> An AI tutor for students that AI education has left behind — voice-first, grounded in real source material, and honest about what a student actually understands.

🔗 **Live Demo:** https://conceptcraft-ai-tutor.vercel.app/  

---

## 🌍 The Problem

Most AI tutors assume fluent English reading, confident typing, and comfort with text-heavy interfaces. Millions of students don't have that — including students I met during rural fieldwork in Jharkhand, whose formal schooling stopped at 5th standard. They're exactly who needs AI-powered learning most, and exactly who current AI tools ignore.

**ConceptCraft** is built for them: upload any topic — a PDF, notes, or a textbook photo — and get a personalized, voice-narrated, level-adaptive lesson that's strictly grounded in your source material, with a comprehension check that actually proves understanding.

---

## ⚙️ Quick Start — Using the Live App

1. Open the live app: **https://conceptcraft-ai-tutor.vercel.app/**
2. Click **"⚡ Quick Start"** to try a pre-loaded topic instantly, or upload your own PDF/notes
3. **To unlock full Gemini-powered generation** (recommended for the best experience):
   - Click **"API Key"** in the header
   - Get a **free** Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Paste it in and click Save
4. Without a key, the app still works fully using a built-in **Local Grounding Engine** as a zero-setup fallback — so there's no hard requirement to get a key just to explore the app.

> **Note:** Google's Gemini free tier has a daily request quota. If you see a "⚡ Local Fallback" badge instead of "✨ Powered by Gemini API," it means the quota was reached — the app gracefully falls back rather than breaking.

---

## ✨ Key Features

| Stage | What It Does |
|---|---|
| **1. Ground Material** | Upload a PDF, paste notes, or pick a sample topic. Content is chunked into passages for grounded (RAG-style) generation — the AI never invents facts outside the source. |
| **2. Learn & Listen** | Level-adaptive explanations (Beginner / Intermediate / Exam-Revision), narrated aloud via the Web Speech API, with a language toggle (English/Hindi). |
| **3. Adaptive Quiz** | Quiz questions generated strictly from the source material, with difficulty that adapts to performance. |
| **4. Teach-Back Verification** | The student explains the concept in their own words — text or voice — and a semantic verification agent compares it against the real source, praising correct points and flagging genuine misconceptions. This is the core differentiator: **proof of understanding, not just delivery of information.** |
| **5. Mastery & Visual** | An interactive concept visualization for supported topics (e.g. Ohm's Law circuit simulator). |

---

## 🧠 Why the AI Is Core, Not Cosmetic

- **RAG-grounded generation**: every explanation, quiz question, and verification is generated from retrieved source chunks — not open-ended chat, minimizing hallucination.
- **Level-adaptive synthesis**: the model actively extracts formulas, definitions, and key concepts and restructures them per reading level — genuine synthesis, not paraphrasing.
- **Semantic teach-back verification**: student explanations are compared against source material for real conceptual understanding, not keyword matching.
- **Graceful local fallback**: a rule-based local engine ensures the app remains functional even without an API key or during quota limits — a deliberate resilience choice for reliability.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **AI:** Google Gemini API (`@google/genai`)
- **PDF Parsing:** `pdfjs-dist`
- **Voice:** Web Speech API (STT + TTS)
- **Styling:** Custom design system (Tailwind CSS)
- **Deployment:** Vercel

---

## 🚀 Running Locally

```bash
git clone https://github.com/kundan_sv/conceptcraft-ai-tutor.git
cd conceptcraft-ai-tutor
npm install
npm run dev
```

Open `http://localhost:5173`. Add your Gemini API key via the in-app modal (no `.env` setup required).

---
