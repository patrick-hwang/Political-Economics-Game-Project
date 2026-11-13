# Political-Economics-Game-Project
An interesting game that helps you comprehend political economics, especially about the monopoly.

## How to run UI Prototype for testing
```bash
python -m http.server 8000
```

Then copy and open this url in browser to test: **http://localhost:8000/index.html**

## Vercel deployment

Import this repository as **one Vercel project**, with the Root Directory set
to the repository root. The root `vercel.json` defines two services:

| Service | Directory | Public routes |
| --- | --- | --- |
| `backend` | `backend` | `/api` and `/api/*`, including `/api/docs` |
| `frontend` | `frontend` | All remaining paths, including `/` |

The React/Vite frontend runs in the browser and calls the same-origin public
`/api/session` endpoints. There are **no internal service callers or bindings**
in this app. Runtime bindings cannot be consumed by browser JavaScript or Vite
builds. Do not add a `VITE_BACKEND_URL` containing an internal service URL. A
private backend would require adding a server-side proxy function to the
frontend and declaring a binding on that caller.

The backend build copies the root `questions_v3.json` into its function bundle.
The frontend already includes its fallback graph in `frontend/public`; keep
that file synchronized with the root graph when editing the story.

For AI explanations, set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in the
Vercel project's environment variables. Without the key, the game still works
and AI endpoints report that explanations are unavailable. Keep keys out of
`VITE_*` variables, which are exposed to the browser.

The backend uses Python 3.12 (`backend/.python-version`). Install frontend
dependencies and backend dependencies, then run all services
from the repository root:

```bash
npm ci --prefix frontend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m pip install --upgrade uv
npx vercel@latest dev --local
```

`vercel dev` is also supported when linked to a Vercel project. The `--local`
option avoids cloud authentication. Open the URL printed by the CLI and check
`/`, `/api`, and `/api/docs`, then start a game and submit a choice.

Vercel's Python development server requires `uv` 0.9.25 or newer. Installing it
inside the activated `.venv` ensures an older global installation does not
prevent the backend from starting. Check with `uv --version`. If startup fails,
run `npx vercel@latest dev --local --debug` to see the underlying service error.

For separate local processes, run `uvicorn app:app --reload` from `backend`
and `npm run dev` from `frontend`. Vite proxies `/api` to the local backend
without stripping the prefix; that localhost target is only a development
setting and is not used by the deployed frontend.

The backend currently stores sessions **in process memory**. Vercel instances
can restart or scale independently, so hosted sessions are not durable and
may return “Session not found.” The frontend can fall back to its local graph,
but reliable backend sessions and AI chat history require a shared datastore.
