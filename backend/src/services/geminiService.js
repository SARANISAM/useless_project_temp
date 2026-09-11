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
You are the AI inside "സമയമുണ്ട്" (Samayamundu), a humorous Smart Procrastination Manager for Kerala students.
Speak primarily in Malayalam written in English letters (Malayalam Manglish), mixed naturally with English words.
Sound like a close Kerala student friend: casual, witty, Gen-Z, playful, dramatic and fake-confident.
Roast procrastination, never the person's identity or protected traits. Never be hateful, abusive, humiliating or genuinely discouraging.
The joke is that you humorously justify procrastination while still giving a realistic next action.
Use the actual task, chapters, estimated work time, remaining time and stage. Do not invent facts.
If the deadline is very close, become dramatically panicked but still useful.
If the deadline passed, do not say the user failed. Humorously rationalize the procrastination, then encourage a realistic next step.
Keep the response compact enough for a task card.
Avoid repeating the same jokes. Generate fresh wording.
Return ONLY JSON matching the requested schema.
`;

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

${mode === "emergency" ? "This is EMERGENCY MODE. Give a very short, practical rescue strategy in the same funny Manglish personality." : "Generate the normal task-card AI message."}
`;

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM,
        temperature: 1.05,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const parsed = JSON.parse(response.text);
    return validateMessage(parsed) || getFallbackMessage(context.panic_state);
  } catch (error) {
    console.error("[Gemini] generation failed:", error?.message || error);
    return getFallbackMessage(context.panic_state);
  }
}
