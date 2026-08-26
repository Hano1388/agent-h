# Agent H

Agent H is a full-stack AI Q&A app. You type a question in the Next.js UI; the Express backend routes it through a LangChain LCEL chain that either answers directly or searches the web (Tavily), then returns `{ answer, sources, mode }`.

```
Browser (localhost:3000)
  → Next.js /api/search
  → Express POST /search (localhost:3030)
  → LCEL (route → direct | web pipeline)
  → { answer, sources, mode }
```

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (App Router), React, Tailwind CSS, shadcn/ui |
| Backend | Express, TypeScript, LangChain LCEL, Zod |
| Search | Tavily |
| Models | OpenAI (`gpt-4o-mini`) or Google Gemini |

## Prerequisites

- Node.js 20+ (recommended)
- npm
- An API key for **OpenAI** and/or **Google Gemini**
- A **Tavily** API key (for the web search path)

## Project layout

```
AgentH/
├── backend/     # Express API + LangChain search agent
└── frontend/    # Next.js chat UI
```

## Local setup

### 1. Clone and install

```bash
cd AgentH

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy the example file and add your keys:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# At least one of these is required
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key

# Required for web search path
TAVILY_API_KEY=your_tavily_key

# Optional: force a provider ("openai" or "google")
FORCED_PROVIDER=

# Optional (default 3030)
PORT=3030
```

**Frontend** — create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
```

### 3. Run the apps

Use two terminals.

**Backend** (port `3030`):

```bash
cd backend
npm run dev
```

**Frontend** (port `3000`):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), ask a question (at least 5 characters), and you should see an answer with a Direct/Web badge and source links when the web path was used.

## How a request flows

1. `AgentChat` posts `{ q }` to `/api/search`.
2. The Next.js route forwards that to `POST ${NEXT_PUBLIC_API_URL}/search`.
3. The backend LCEL chain routes to a direct LLM answer or a web pipeline (search → fetch → summarize → compose).
4. The UI shows `{ answer, sources, mode }` in the thread.

## Useful scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm run dev` | Start API with file watching |
| `backend/` | `npm start` | Start API once |
| `frontend/` | `npm run dev` | Start Next.js in development |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm start` | Serve the production build |

## Notes

- CORS on the backend allows `http://localhost:3000`.
- Keep `.env` files out of git (they are ignored). Use `.env.example` as the template for the backend.
- Queries must be at least 5 characters (`SearchInputSchema`).
