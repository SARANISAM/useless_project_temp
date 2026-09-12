import dotenv from "dotenv";
dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GEMINI_API_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(`[env] Missing: ${missing.join(", ")}. Copy backend/.env.example to backend/.env and fill it.`);
  process.exit(1);
}

export const env = Object.freeze({
  PORT: Number(process.env.PORT || 5000),
  APP_TIMEZONE: process.env.APP_TIMEZONE || "Asia/Kolkata",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173"
});
