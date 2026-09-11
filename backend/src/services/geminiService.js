import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../config/env.js";
import { getFallbackMessage } from "../utils/fallbackMessages.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    panic_level: { type: Type.STRING, description: "One of LOW, MEDIUM, HIGH, CRITICAL, DEAD, DONE." },
    headline: { type: Type.STRING },
    message: { type: Type.STRING },
    action: { type: Type.STRING },
    emoji: { type: Type.STRING }
  },
  required: ["panic_level", "headline", "message", "action", "emoji"]
};

const SYSTEM = `
You are the witty, humorous AI companion inside "സമയമുണ്ട്" (Samayamundu) — a smart procrastination manager designed for Kerala college students.
Personality & Language rules:
1. Speak in natural, hilarious Malayalam Manglish (Malayalam written in English letters) seamlessly mixed with English slang (e.g. "machane", "bro", "scene", "theernnu", "poweresh", "chumma", "supply", "internal", "deadline", "canteen", "chaya", "set aakkam").
2. Sound like a funny, supportive best friend sitting next to them in a hostel room or canteen.
3. Procrastination comedy: First humorously justify why they feel like putting it off ("samayamundu machane!"), but then immediately deliver a realistic reality-check and an actionable next step based on their specific task details.
4. Always incorporate the actual task details (task name, chapters, estimated time, deadline).
5. Tone according to urgency:
   - Plenty of time (CHILL / MAYBE_START): Relaxed and funny, allows a quick tea break or reel break, but warns against postponing till midnight.
   - Getting serious (OKAY_SERIOUS): Witty urgency — "Kettipidichu irikkenda, ippol thudangiyaal safe aayi theerkkam".
   - Panic / Critical (PANIC_MODE / CRITICAL): High-energy survival mode — "Scene contra machane! Phone maatti vechittu ippo thanne start cheyyu!" Give an aggressive triage tip.
   - Deadline passed (DEADLINE_DEAD): Do not shame them; humorously rationalize it ("Kazhinjathu kazhinju, ini damage control cheyyam") and tell them what to submit/do right now.
   - Emergency mode: Punchy, urgent 1-2 line rescue plan.
6. Return ONLY valid JSON matching the schema.
`;

function extractJson(text) {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(clean.slice(start, end + 1));
      } catch {}
    }
    return null;
  }
}

function validateMessage(value) {
  if (!value || typeof value !== "object") return null;
  const fields = ["panic_level", "headline", "message", "action", "emoji"];
  if (fields.some((f) => typeof value[f] !== "string" || !value[f].trim())) return null;
  return {
    panic_level: value.panic_level.trim().slice(0, 40),
    headline: value.headline.trim().slice(0, 120),
    message: value.message.trim().slice(0, 1200),
    action: value.action.trim().slice(0, 240),
    emoji: value.emoji.trim().slice(0, 40)
  };
}

const CANDIDATE_MODELS = [
  env.GEMINI_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash-lite"
].filter(Boolean);
const MODELS = [...new Set(CANDIDATE_MODELS)];

export async function generateAiMessage(context, mode = "normal") {
  const prompt = `
Mode: ${mode}
Task name: ${context.task_name}
Description: ${context.description || "None"}
Deadline: ${context.deadline_local}
Time remaining: ${context.time_remaining}
Chapters/topics: ${context.chapters ?? "Not specified"}
Estimated work minutes: ${context.estimated_minutes ?? "Not specified"}
Panic state: ${context.panic_state}
Stage: ${context.stage}

${mode === "emergency" ? "This is EMERGENCY MODE. Give a lightning-fast, high-impact rescue strategy in funny, urgent Manglish." : "Generate a hilarious, authentic Kerala student task-card message with a smart first action."}
`;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM,
          temperature: 0.85,
          maxOutputTokens: 2500,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const parsed = extractJson(response.text);
      const validated = validateMessage(parsed);
      if (validated) return validated;
    } catch (error) {
      console.warn(`[Gemini] model "${model}" failed (${error?.status || error?.message}), checking next available model...`);
    }
  }

  console.error("[Gemini] all models failed, falling back to local message.");
  return getFallbackMessage(context.panic_state);
}
