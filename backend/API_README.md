# Political Economics Game — Backend API

A minimal FastAPI backend for the roleplaying game. It loads `questions_v3.json`
(the complete 560-node graph) into memory once, then serves a tiny stateful
session API so the frontend does not have to re-implement graph walking or
budget tracking.

> This is intentionally a simple amateur project — in-memory storage, no
> database, no auth. Restarting the server wipes all sessions.

## Files

- `app.py` — the FastAPI server + graph/session logic.
- `requirements.txt` — Python dependencies.
- `questions_v3.json` — the single source of truth for the story graph.

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

Check schema của API tại http://localhost:8000/docs sau khi chạy nha!! 

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
  revenue (from `revenue_million`), advances to the next node, and returns the
  new screen.

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
- `choice` → links to exactly one next node and carries `revenue_million`.
- `win` / `lose` → terminal outcomes (9 classes of win/lose combined).

`Branch/*.json` files are pre-computed per-path views of the same graph (they
drop `type`/`next node`), kept only for reference — the backend uses
`questions_v3.json` exclusively.
