# Agent H

Full-stack AI Q&A app: ask a question in the browser, and the backend routes it through a LangChain LCEL chain — either a direct LLM answer or a web-search pipeline (Tavily → fetch → summarize → compose).

**Response shape:** `{ answer, sources, mode }` where `mode` is `"direct"` or `"web"`.

---

## Quick start (~5 minutes)

### Prerequisites

- **Node.js 20+**
- **npm**
- API keys (free tiers work for local dev):
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini) **or** [OpenAI](https://platform.openai.com/api-keys)
  - [Tavily](https://tavily.com/) (web search path)

### 1. Install dependencies

From the repo root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

**Backend**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at minimum:

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | Yes | Default `3030` |
| `MODEL_PROVIDER` | Yes | `gemini` or `openai` |
| `GOOGLE_API_KEY` | If using Gemini | Free tier friendly |
| `OPENAI_API_KEY` | If using OpenAI | |
| `TAVILY_API_KEY` | For web search | Needed for “Top 10…” style queries |

**Frontend**

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
```

### 3. Start both apps

**Terminal 1 — backend**

```bash
cd backend
npm run dev
```

Wait for: `Server is running on port 3030`

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Try it

**In the UI:** type a question (min **5 characters**) and click **Ask**.

**Direct path** (LLM only, no web search):

```bash
curl -X POST http://localhost:3030/search \
  -H "Content-Type: application/json" \
  -d '{"q": "What is TypeScript?"}'
```

**Web path** (Tavily + page fetch + summarize):

```bash
curl -X POST http://localhost:3030/search \
  -H "Content-Type: application/json" \
  -d '{"q": "Top 10 colleges in Kurdistan Region of Iraq"}'
```

Expected JSON:

```json
{
  "answer": "...",
  "sources": ["https://..."],
  "mode": "web"
}
```

---

## Architecture

```
Browser (localhost:3000)
  → Next.js POST /api/search
  → Express POST /search (localhost:3030)
  → LCEL chain: router → direct | web pipeline → validation
  → { answer, sources, mode }
```

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (App Router), React, Tailwind, shadcn/ui |
| Backend | Express, TypeScript, LangChain LCEL, Zod |
| Search | Tavily, html-to-text |
| Models | OpenAI or Google Gemini (via env) |

## Project layout

```
AgentH/
├── backend/
│   └── src/
│       ├── index.ts              # Express server
│       ├── routes/searchLCEL.ts  # POST /search
│       └── searchAgent/          # LCEL pipelines
└── frontend/
    └── src/
        ├── app/api/search/       # Proxy to backend
        └── components/AgentChat.tsx
```

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm run dev` | API with hot reload |
| `backend/` | `npm start` | API once |
| `frontend/` | `npm run dev` | Next.js dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm start` | Serve production build |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `TAVILY_API_KEY is not set` | Add key to `backend/.env` (web path only) |
| `Invalid URL` | Usually fixed — web search must use Tavily first, not pass the query as a URL |
| Query rejected | `q` must be at least 5 characters |
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_URL` and that backend is on port `3030` |
| CORS error | Set `CORS_ORIGIN=http://localhost:3000` in `backend/.env` |
| Gemini quota / model errors | Try `GEMINI_MODEL=gemini-2.0-flash-lite` in `backend/.env` |
| Env changes not picked up | Restart `npm run dev` in both terminals |

## Notes

- `.env` files are gitignored — never commit API keys.
- Use `backend/.env.example` and `frontend/.env.example` as templates.
- Web search can take 30–60 seconds (multiple page fetches + LLM calls).
