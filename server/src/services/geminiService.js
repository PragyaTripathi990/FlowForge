import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Models to try, in order. The newest Flash model is often overloaded on the
// free tier (503 "high demand"), so each retry moves on to the next one.
// Override with GEMINI_MODELS as a comma-separated list.
const MODELS = (process.env.GEMINI_MODELS || "gemini-3.8-flash,gemini-3.5-flash,gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

export async function callGemini(prompt, model = MODELS[0]) {
  try {
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(prompt);
    const text = result.response.text();

    return text;
  } catch (error) {
    console.error(`Gemini API Error (${model}):`, error.message);
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
}

export async function callGeminiWithRetry(prompt, model, maxRetries = 3) {
  // A caller-supplied model is tried first, then the configured fallbacks.
  const models = model ? [model, ...MODELS.filter((m) => m !== model)] : MODELS;
  const attempts = Math.max(maxRetries, models.length);
  let lastError;

  for (let i = 0; i < attempts; i++) {
    const current = models[i % models.length];
    try {
      return await callGemini(prompt, current);
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1}/${attempts} with ${current} failed:`, error.message);

      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 500));
      }
    }
  }

  throw lastError;
}
