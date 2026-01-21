import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { ERROR_MESSAGES } from "../constants/index.js";

let cachedGeminiModelName = null;
let cachedGroqModelName = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const buildPrompt = ({ userMessage, history = [], knowledge = "" }) => {
  const historyText =
    history?.length > 0
      ? history
          .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
          .join("\n")
      : "(empty)";

  return `
You are a professional customer support assistant.

Rules:
- Use Company Knowledge Base first.
- If the answer is not available, say: "I don't have that specific information in my knowledge base."
- Be concise, accurate, and professional.
- Do not invent company policies.

Company Knowledge Base:
${knowledge || "(No documents uploaded yet)"}

Conversation History:
${historyText}

User Message:
${userMessage}

Response:
`.trim();
};

const isQuotaOrOverload = (err) => {
  const status = err?.status;
  const msg = (err?.message || "").toLowerCase();

  return (
    status === 429 ||
    status === 503 ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit")
  );
};

/* =========================
   GEMINI
========================= */

const safeExtractGemini = (result) => {
  try {
    return result?.response?.text?.()?.trim();
  } catch {
    return "";
  }
};

const listSupportedGeminiModels = async (apiKey) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to list Gemini models: ${res.status} ${txt}`);
  }

  const data = await res.json();
  const models = data?.models || [];

  return models
    .filter((m) => Array.isArray(m.supportedGenerationMethods))
    .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
    .map((m) => m.name?.replace("models/", ""))
    .filter(Boolean);
};

const pickBestGeminiModel = (supportedModels) => {
  const preferred = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  for (const p of preferred) {
    if (supportedModels.includes(p)) return p;
  }

  return supportedModels[0];
};

const generateWithRetryGemini = async ({ model, prompt, maxAttempts = 3 }) => {
  let lastErr = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const reply = safeExtractGemini(result);
      if (reply) return reply;

      lastErr = new Error("Empty Gemini response");
    } catch (err) {
      lastErr = err;

      if (!isQuotaOrOverload(err)) break;

      await sleep(500 * attempt * attempt);
    }
  }

  throw lastErr;
};

const generateWithGemini = async ({ prompt }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(ERROR_MESSAGES.GEMINI_API_KEY_MISSING);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  let modelCandidates = [];

  if (process.env.AI_MODEL?.trim()) {
    modelCandidates = [process.env.AI_MODEL.trim()];
    console.log(`Using configured Gemini model: ${process.env.AI_MODEL.trim()}`);
  } else {
    const supported = await listSupportedGeminiModels(apiKey);
    if (!supported.length) throw new Error("No Gemini model supports generateContent.");

    cachedGeminiModelName = cachedGeminiModelName || pickBestGeminiModel(supported);
    modelCandidates = [
      cachedGeminiModelName,
      ...supported.filter((m) => m !== cachedGeminiModelName),
    ];

    console.log(`Auto-selected Gemini model: ${cachedGeminiModelName}`);
  }

  let lastError = null;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await generateWithRetryGemini({ model, prompt, maxAttempts: 3 });
    } catch (err) {
      lastError = err;
      if (!isQuotaOrOverload(err)) break;
    }
  }

  throw lastError || new Error("Gemini failed to generate response");
};

/* =========================
   OPENAI
========================= */

const generateWithOpenAI = async ({ prompt }) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("OPENAI_API_KEY missing in .env");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  console.log(`Using OpenAI model: ${model}`);

  const resp = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a professional customer support assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const reply = resp?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty OpenAI response");

  return reply;
};

/* =========================
   GROQ (AUTO MODEL PICK)
========================= */

const listGroqModels = async (groq) => {
  const res = await groq.models.list();
  const ids = res?.data?.map((m) => m.id).filter(Boolean) || [];
  return ids;
};

const pickBestGroqModel = (supportedIds) => {
  const preferred = [
    "llama-3.3-70b-versatile",
    "llama-3.3-8b-instant",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ];

  for (const p of preferred) {
    if (supportedIds.includes(p)) return p;
  }

  return supportedIds[0];
};

const generateWithGroq = async ({ prompt }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GROQ_API_KEY missing in .env");
  }

  const groq = new Groq({ apiKey });

  let model = process.env.GROQ_MODEL?.trim();

  if (!model) {
    // auto select
    const supported = await listGroqModels(groq);
    if (!supported.length) throw new Error("No Groq models available for this API key.");

    
    if (!cachedGroqModelName) {
      cachedGroqModelName = pickBestGroqModel(supported);
      console.log(`Auto-selected Groq model: ${cachedGroqModelName}`);
    }

    model = cachedGroqModelName;
  } else {
    console.log(`Using Groq model: ${model}`);
  }

  const resp = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a professional customer support assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const reply = resp?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty Groq response");

  return reply;
};

/* =========================
   MAIN
========================= */

export const generateAIReply = async ({ userMessage, history, knowledge }) => {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const prompt = buildPrompt({ userMessage, history, knowledge });

  if (provider === "gemini") return await generateWithGemini({ prompt });
  if (provider === "openai") return await generateWithOpenAI({ prompt });
  if (provider === "groq") return await generateWithGroq({ prompt });

  // auto: Gemini -> OpenAI -> Groq
  if (provider === "auto") {
    try {
      return await generateWithGemini({ prompt });
    } catch (err1) {
      if (!isQuotaOrOverload(err1)) throw err1;

      try {
        return await generateWithOpenAI({ prompt });
      } catch (err2) {
        if (!isQuotaOrOverload(err2)) throw err2;

        return await generateWithGroq({ prompt });
      }
    }
  }

  throw new Error("Unsupported AI provider. Use gemini|openai|groq|auto");
};
