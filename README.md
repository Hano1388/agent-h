# Agent H

Agent H is a full-stack AI Q&A app. You type a question in the Next.js UI, the Express backend calls an LLM through LangChain, and the reply comes back as a short beginner-friendly summary plus a confidence score (0–1).

```
Browser (localhost:3000)
  → Next.js /api/ask
  → Express POST /ask-agent (localhost:3030)
  → LangChain (OpenAI or Google Gemini)
  → { summary, confidence }
```

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (App Router), React, Tailwind CSS, shadcn/ui |
| Backend | Express, TypeScript, LangChain, Zod |
| Models | OpenAI (`gpt-4o-mini`) or Google Gemini |

## Prerequisites

- Node.js 20+ (recommended)
- npm
- An API key for **OpenAI** and/or **Google Gemini**

## Project layout

```
AgentH/
├── backend/     # Express API + LangChain
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

# Optional: force a provider ("openai" or "google")
# If unset, OpenAI is preferred when OPENAI_API_KEY is present
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

Open [http://localhost:3000](http://localhost:3000), ask a question, and you should see a summary with a confidence chip.

## How a request flows

1. `AgentChat` posts `{ query }` to `/api/ask`.
2. The Next.js route forwards that to `POST ${NEXT_PUBLIC_API_URL}/ask-agent`.
3. The backend builds a LangChain chat model, runs structured output validated by Zod (`summary`, `confidence`), and returns JSON.
4. The UI appends the exchange to the thread.

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
- Free-tier Gemini keys may need a lighter model; adjust the model name in `backend/src/langChainModel.ts` if you hit quota or model errors.
