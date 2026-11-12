# Political Economics Game — Backend API

A minimal FastAPI backend for the roleplaying game. It loads `questions_v3.json`
(the complete 560-node graph) into memory once, then serves a tiny stateful
session API so the frontend does not have to re-implement graph walking or
budget tracking.

> This is intentionally a simple amateur project — in-memory storage, no
> database, no auth. Restarting the server wipes all sessions.

## Files

- `app.py` — the FastAPI server + graph/session logic.
- `ai.py` — Gemini AI explainer (explains decisions strictly from game data).
- `.env.example` — template for the git-ignored `.env` file holding your API key.
- `requirements.txt` — Python dependencies.
- `questions_v3.json` — the single source of truth for the story graph (in the project root, one level up).

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

Check schema của API tại http://localhost:8000/docs sau khi chạy nha!! 

### Enabling AI explanations

1. Copy the example file to create your local `.env`:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and paste your free Google AI Studio key:

   ```dotenv
   GEMINI_API_KEY=your-real-key-here
   ```

   (Optional: uncomment `GEMINI_MODEL` to change the model.)

3. Start the server as usual — the key is read from `.env` automatically:

   ```bash
   uvicorn app:app --reload
   ```

The `.env` file is git-ignored, so your real key is never committed. You can
also set `GEMINI_API_KEY` as an environment variable instead if you prefer.

Without a key, the endpoints still work but return a clear
"GEMINI_API_KEY is not set" message (and `ai_available` is `false`).

## Endpoints

Root

- `GET /` — small health/info payload.

Playthrough

- `POST /session` — start a new game (begins at node `1`, budget `$1,000,000`).
  Returns the session id and the first resolved screen.

- `GET /session/{session_id}` — resume / inspect a session's current screen.

- `POST /session/{session_id}/choose` — confirm a choice and advance the story.
  Request body:

  ```json
  { "choice_node_id": 3 }
  ```

  Validates that the choice belongs to the current question, applies its
  revenue (from the `revenue` string, e.g. `"+$4 million"`), advances to the
  next node, and returns the new screen.

AI explanations

- `POST /session/{session_id}/explain` — the "Explain with AI" button.
  Takes an empty body (`{}`) and returns an explanation of *why the current
  outcome happened*, anchored strictly to the decision trail. Each call
  appends the assistant's answer to the session's persistent chat log.

- `POST /session/{session_id}/chat` — casual Q&A. Sends a free-form question:

  ```json
  { "message": "Doanh nghiệp của tôi là gì?" }
  ```

  Answers naturally (still grounded in the decision trail), and records the
  user message + reply in the chat log.

- `GET /session/{session_id}/chat` — return the session's chat log without
  generating anything new.

  All three respond with:

  ```json
  {
    "messages": [
      { "role": "assistant", "content": "..." },
      { "role": "user", "content": "Doanh nghiệp của tôi là gì?" },
      { "role": "assistant", "content": "..." }
    ],
    "ai_available": true
  }
  ```

  The AI always answers in plain-text Vietnamese (no Markdown), grounded
  strictly in the decision data.

## Response shape

Every session endpoint returns:

```json
{
  "session_id": "...",
  "budget": 1004000000,
  "current_node": 2,
  "history": [3, 7, ...],
  "screen": {
    "contexts": [ ... ],
    "question": { "node": 2, "content": "...", ... },
    "choices": [
      { "node": 3, "content": "...", "benefits": "...", ... },
      { "node": 13, "content": "...", "benefits": "...", ... }
    ]
  }
}
```

When a `win` or `lose` node is reached, `screen` contains `outcome` instead of
`question`/`choices`:

```json
{
  "screen": {
    "contexts": [ ... ],
    "outcome": { "node": 17, "type": "lose", "content": "...", ... }
  }
}
```

Note: choice nodes returned to the client have their `next node` field stripped
so the client cannot look ahead; the backend is the only party that resolves
destinations.

## How the graph works

- `context` → links to exactly one next node (spliced into the screen preamble).
- `question` → links to exactly two `choice` nodes.
- `choice` → links to exactly one next node and carries a `revenue` string
  (e.g. `"+$4 million"`).
- `win` / `lose` → terminal outcomes (win/lose endings).

`Branch/*.json` files are pre-computed per-path views of the same graph (they
drop `type`/`next node`), kept only for reference — the backend uses
`questions_v3.json` exclusively.

## How AI explanations work

The backend keeps a **lean decision trail** per session — for each choice it
stores only the `choice_id` and the running `budget_after` (it does NOT
re-copy the choice text; that already lives in `questions_v3.json`).

When the player clicks "Explain with AI" (or sends a chat message):

1. The backend builds a text block by looking up each choice's
   content/benefits/drawback/impact/revenue from the graph, plus the ending if
   reached.
2. Gemini receives that trail as grounding context, along with the full prior
   conversation (multi-turn memory), and is instructed to answer **only** from
   that data — never inventing events or numbers.
3. The reply is appended to the session's chat log, so follow-ups (either via
   `/explain` or `/chat`) build on the shared conversation.

All AI output is plain-text Vietnamese with no Markdown formatting.
