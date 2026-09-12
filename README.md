# സമയമുണ്ട് 😂 — Smart Procrastination Manager

**Productivity alla… procrastination optimize cheyyam.**

A full-stack college project that combines React, Express, Supabase PostgreSQL and Gemini to generate dynamic Malayalam-Manglish procrastination commentary based on real task deadlines.

## Architecture

```text
Browser
  ↓
React + Vite :5173
  ↓ fetch only
Express :5000
  ├── validation
  ├── Supabase task CRUD
  ├── server-clock deadline/panic calculations
  └── Gemini calls only when needed
       ↓
Supabase PostgreSQL ← source of truth
       ↑
Gemini API → structured JSON → backend validation → React
```

The Gemini API never receives database credentials and never talks directly to Supabase.

## 1. Prerequisites

Install:

- Node.js 18+ (Node 20+ recommended)
- npm
- A Supabase project
- A Gemini API key

## 2. Supabase

The SQL is in:

```text
supabase/schema.sql
```

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Create a new query.
4. Paste the entire contents of `supabase/schema.sql`.
5. Run it.
6. Confirm that `public.tasks` exists.
7. In Supabase Project Settings → API, copy:
   - Project URL
   - service_role secret

This project deliberately has no login system. RLS is enabled and no public policies are created. The Express backend uses the service-role secret to access the table. **Never expose that secret to React or commit it to Git.**

## 3. Gemini

Use Google AI Studio to create an API key.

Put it only in:

```text
backend/.env
```

The backend uses the official `@google/genai` SDK and structured JSON output. The default model is configurable with `GEMINI_MODEL`.

## 4. Environment files

Create:

```text
backend/.env
```

from `backend/.env.example`:

```env
PORT=5000
APP_TIMEZONE=Asia/Kolkata
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
CORS_ORIGIN=http://localhost:5173
```

Create:

```text
frontend/.env
```

from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Do not put Supabase service-role or Gemini keys in the frontend.

## 5. Install

From the root:

```bash
npm install
npm run install:all
```

## 6. Run

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Or, after root dependencies are installed:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/health
```

## 7. Main API

```text
GET    /api/health

POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

PATCH  /api/tasks/:id/start
PATCH  /api/tasks/:id/complete

POST   /api/tasks/:id/ai-message
POST   /api/emergency
GET    /api/stats
```

## 8. Deadline rules

The backend server clock is authoritative.

```text
> 24 hours      CHILL
6–24 hours      MAYBE START
1–6 hours       OKAY SERIOUS
< 1 hour        PANIC MODE
passed          DEADLINE DEAD
completed       COMPLETED
```

Deadlines entered by the user are interpreted in `APP_TIMEZONE`, which defaults to `Asia/Kolkata`.

## 9. Honest procrastination statistic

The database stores `started_at`.

When the user presses **Start Task**, the backend writes the server timestamp.

Therefore:

```text
procrastination time = started_at - created_at
```

The history page does not invent this number.

## 10. Gemini behavior

Gemini receives only the small task context it needs:

- task name
- description
- deadline
- remaining time
- chapters
- estimated work
- panic state
- stage
- emergency mode when applicable

Gemini returns:

```json
{
  "panic_level": "HIGH",
  "headline": "🚨 PANIC MODE ACTIVATED",
  "message": "Ninakku ippo...",
  "action": "Ippo thanne start cheyyu.",
  "emoji": "😭🔥"
}
```

The backend validates this response. If Gemini fails, a predefined fallback message is used so the application continues working.

## 11. Troubleshooting

### Backend says environment variables are missing

Make sure the file is exactly:

```text
backend/.env
```

and contains real values.

### Supabase errors

Check:

- Project URL is correct.
- service-role secret is correct.
- `supabase/schema.sql` was run successfully.
- Table name is `tasks`.

### Gemini errors

Check:

- `GEMINI_API_KEY` is correct.
- The API key is active.
- The configured model is available to the key.
- The backend, not the frontend, is making the Gemini request.

### CORS error

Make sure:

```env
CORS_ORIGIN=http://localhost:5173
```

matches the actual frontend origin.

### Port already in use

Change `PORT` in `backend/.env` and update:

```env
VITE_API_BASE_URL=http://localhost:YOUR_PORT/api
```

in `frontend/.env`.

## 12. Viva explanation

> The React frontend collects task information and communicates only with the Express REST API. Express validates the input and stores/retrieves task data from Supabase. The backend calculates the remaining time and panic state using its own server clock. When an AI message is needed, it sends only the required task context to Gemini. Gemini returns structured Malayalam-Manglish JSON. The backend validates that response and sends it back to React. Supabase is the source of truth for task data, while the backend is the security and business-logic layer.

## 13. Important security rule

Never commit:

```text
backend/.env
frontend/.env
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

to the browser.
