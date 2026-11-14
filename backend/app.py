"""Minimal FastAPI backend for the Political-Economics roleplaying game.

Loads questions_v3.json once into memory as the single source of truth,
then exposes a tiny stateful session API. Each session tracks the current
node, the running budget, and the player's history.

Run:
    uvicorn app:app --reload

Endpoints:
    POST /api/session            -> create a playthrough (starts at node 1)
    GET  /api/session/{id}        -> current screen / state
    POST /api/session/{id}/choose -> confirm a choice, advance the story
"""
from __future__ import annotations

import json
import re
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai import build_trail_text, explainer

# Vercel builds a service-local copy; direct local runs use the source file.
DATA_FILE = Path(__file__).resolve().parent / "questions_v3.json"
if not DATA_FILE.is_file():
    DATA_FILE = DATA_FILE.parent.parent / "questions_v3.json"
START_NODE_ID = 1
INITIAL_BUDGET = 1_000_000  # dollars; matches index.html

app = FastAPI(
    title="Political Economics Game API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    swagger_ui_oauth2_redirect_url="/api/docs/oauth2-redirect",
)
router = APIRouter(prefix="/api")

# Allow the static local frontend to call this API during development.
# No auth/cookies are used, so credentials stay disabled regardless of origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,  # no cookies/auth; safe with these origins too
)


# ============================================
# GRAPH LOADING (single source of truth)
# ============================================

def load_graph() -> dict[int, dict[str, Any]]:
    with DATA_FILE.open("r", encoding="utf-8") as fh:
        data = json.load(fh)

    graph: dict[int, dict[str, Any]] = {}
    for item in data:
        node_id = int(item["node"])
        graph[node_id] = item
    return graph


GRAPH = load_graph()

# In-memory session store. Fine for an amateur/single-user toy project.
SESSIONS: dict[str, dict[str, Any]] = {}


# ============================================
# SCREEN RESOLUTION (ported from index.html)
# ============================================

def resolve_screen(node_id: int) -> dict[str, Any]:
    """Walk context nodes until a question or a win/lose node is reached."""
    contexts: list[dict[str, Any]] = []
    visited: set[int] = set()

    while True:
        if node_id in visited:
            raise HTTPException(status_code=500, detail=f"Cycle detected at node {node_id}")
        visited.add(node_id)

        node = GRAPH.get(node_id)
        if node is None:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found")

        ntype = node.get("type")
        next_ids = node.get("next node") or []

        if ntype == "context":
            contexts.append(node)
            if len(next_ids) != 1:
                raise HTTPException(
                    status_code=500,
                    detail=f"Context node {node_id} must link to exactly one next node",
                )
            node_id = int(next_ids[0])
            continue

        if ntype == "question":
            if len(next_ids) != 2:
                raise HTTPException(
                    status_code=500,
                    detail=f"Question node {node_id} must have exactly two choices",
                )
            choices = []
            for cid in next_ids:
                choice = GRAPH.get(int(cid))
                if choice is None or choice.get("type") != "choice":
                    raise HTTPException(
                        status_code=500,
                        detail=f"Question {node_id} points to non-choice node {cid}",
                    )
                choices.append(_public_choice(choice))
            return {"contexts": contexts, "question": node, "choices": choices}

        if ntype in ("win", "lose"):
            return {"contexts": contexts, "outcome": node}

        raise HTTPException(status_code=500, detail=f"Unexpected node type {ntype!r} at {node_id}")


def _public_choice(choice: dict[str, Any]) -> dict[str, Any]:
    """Return a choice without leaking the destination node id to the client."""
    return {k: v for k, v in choice.items() if k != "next node"}


# ============================================
# REQUEST MODELS
# ============================================

class ChooseRequest(BaseModel):
    choice_node_id: int


# ============================================
# RESPONSE MODELS
# ============================================

class ChoiceView(BaseModel):
    node: int
    type: Any = "choice"
    content: Any = ""
    benefits: Any = ""
    impact: Any = ""
    revenue: Any = ""
    revenue_million: Any = None
    potential_drawback: Any = Field(default="", alias="potential drawback")


class QuestionView(BaseModel):
    node: int
    type: Any = "question"
    content: Any = ""
    benefits: Any = ""
    impact: Any = ""
    revenue: Any = ""
    revenue_million: Any = None
    next_node: list[int] = Field(default_factory=list, alias="next node")
    potential_drawback: Any = Field(default="", alias="potential drawback")


class OutcomeView(BaseModel):
    node: int
    type: Any = ""
    content: Any = ""
    benefits: Any = ""
    impact: Any = ""
    revenue: Any = ""
    revenue_million: Any = None
    next_node: list[int] = Field(default_factory=list, alias="next node")
    potential_drawback: Any = Field(default="", alias="potential drawback")


class Screen(BaseModel):
    contexts: list[dict[str, Any]] = []
    question: QuestionView | None = None
    choices: list[ChoiceView] | None = None
    outcome: OutcomeView | None = None


class SessionView(BaseModel):
    session_id: str
    budget: float
    current_node: int
    history: list[int]
    screen: Screen


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ExplainRequest(BaseModel):
    question: str | None = None


class ChatRequest(BaseModel):
    message: str


class ChatView(BaseModel):
    messages: list[ChatMessage]
    ai_available: bool



# ============================================
# ENDPOINTS
# ============================================

@router.get("")
@router.get("/")
def root() -> dict[str, Any]:
    return {"game": "Political Economics Game", "nodes": len(GRAPH)}


@router.post("/session", response_model=SessionView)
def create_session() -> Any:
    session_id = uuid.uuid4().hex
    SESSIONS[session_id] = {
        "current_node": START_NODE_ID,
        "budget": INITIAL_BUDGET,
        "history": [],
        "trail": [],
        "chat": [],
    }
    return _session_view(session_id)


@router.get("/session/{session_id}", response_model=SessionView)
def get_session(session_id: str) -> Any:
    _require_session(session_id)
    return _session_view(session_id)


@router.post("/session/{session_id}/choose", response_model=SessionView)
def choose(session_id: str, body: ChooseRequest) -> Any:
    session = _require_session(session_id)
    choice_id = body.choice_node_id

    choice = GRAPH.get(choice_id)
    if choice is None or choice.get("type") != "choice":
        raise HTTPException(status_code=404, detail=f"Choice node {choice_id} not found")

    # The choice must belong to the question currently on-screen.
    current_screen = resolve_screen(session["current_node"])
    current = current_screen.get("question")
    if current is None:
        raise HTTPException(status_code=409, detail="Session is not at a question node")

    allowed = [int(c) for c in (current.get("next node") or [])]
    if choice_id not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Choice {choice_id} is not valid for question {current.get('node')}",
        )

    next_ids = choice.get("next node") or []
    if len(next_ids) != 1:
        raise HTTPException(status_code=500, detail=f"Choice {choice_id} must link to one node")

    next_target = int(next_ids[0])

    # Apply revenue of choice and any intervening context nodes
    change = _revenue(choice)
    curr_target = next_target
    while curr_target in GRAPH and GRAPH[curr_target].get("type") == "context":
        change += _parse_revenue_string(GRAPH[curr_target].get("revenue"))
        curr_nexts = GRAPH[curr_target].get("next node") or []
        if not curr_nexts:
            break
        curr_target = int(curr_nexts[0])

    session["budget"] += change
    session["current_node"] = next_target
    session["history"].append(choice_id)

    # Lean trail: store only the choice id + running budget. The choice's text
    # (content/benefits/impact/revenue) is looked up from GRAPH at explain-time,
    # so we don't duplicate what questions_v3.json / Branch files already hold.
    session["trail"].append({
        "choice_id": choice_id,
        "budget_after": session["budget"],
    })

    view = _session_view(session_id)
    choice_budget_before = session["budget"] - change
    choice_budget_after = choice_budget_before + _revenue(choice)
    choice_context = {
        "node": choice_id,
        "type": "choice_result",
        "isChoiceResult": True,
        "content": choice.get("content", ""),
        "benefits": choice.get("benefits", ""),
        "potential_drawback": choice.get("potential drawback", ""),
        "impact": choice.get("impact", ""),
        "revenue": choice.get("revenue", ""),
        "budget_before": choice_budget_before,
        "budget_after": choice_budget_after,
    }

    running_budget = choice_budget_after
    for ctx in view["screen"].get("contexts", []):
        ctx_rev = _parse_revenue_string(ctx.get("revenue"))
        ctx["budget_before"] = running_budget
        running_budget += ctx_rev
        ctx["budget_after"] = running_budget

    view["screen"]["contexts"] = [choice_context] + view["screen"].get("contexts", [])
    return view


# ============================================
# AI CHAT ENDPOINTS
# ============================================

@router.post("/session/{session_id}/explain", response_model=ChatView)
def explain(session_id: str, body: ExplainRequest) -> Any:
    """Generate (or continue) an AI explanation for the current point in the
    story. Each call appends the assistant's answer to the session's chat log."""
    session = _require_session(session_id)

    trail = session.get("trail", [])
    outcome = None
    screen = resolve_screen(session["current_node"])
    if "outcome" in screen:
        outcome = screen["outcome"]

    context = build_trail_text(trail, outcome, GRAPH)

    # Explain the current outcome, anchored to the decision trail.
    chat = session.setdefault("chat", [])
    answer = explainer.explain_decision(context, history=chat)

    chat.append({"role": "assistant", "content": answer})

    return {
        "messages": chat,
        "ai_available": explainer.available(),
    }


@router.post("/session/{session_id}/chat", response_model=ChatView)
def chat(session_id: str, body: ChatRequest) -> Any:
    """Casual Q&A with the AI. Unlike /explain, this answers a free-form
    message (still grounded in the decision trail) rather than explaining the
    current outcome. Appends the message + reply to the session's chat log."""
    session = _require_session(session_id)

    trail = session.get("trail", [])
    outcome = None
    screen = resolve_screen(session["current_node"])
    if "outcome" in screen:
        outcome = screen["outcome"]

    context = build_trail_text(trail, outcome, GRAPH)

    chat = session.setdefault("chat", [])
    answer = explainer.chat(context, body.message, history=chat)

    chat.append({"role": "user", "content": body.message})
    chat.append({"role": "assistant", "content": answer})

    return {
        "messages": chat,
        "ai_available": explainer.available(),
    }


@router.get("/session/{session_id}/chat", response_model=ChatView)
def get_chat(session_id: str) -> Any:
    """Return the session's chat log without generating anything new."""
    session = _require_session(session_id)
    return {
        "messages": session.get("chat", []),
        "ai_available": explainer.available(),
    }


# ============================================
# HELPERS
# ============================================

def _require_session(session_id: str) -> dict[str, Any]:
    session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def _question_node(start: int) -> int:
    """Advance from `start` through context nodes to the first question or
    terminal node. This is the node the player is actually 'on' for choosing."""
    node_id = start
    seen: set[int] = set()
    while True:
        if node_id in seen:
            raise HTTPException(status_code=500, detail=f"Cycle at node {node_id}")
        seen.add(node_id)
        node = GRAPH.get(node_id)
        if node is None:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
        ntype = node.get("type")
        if ntype == "context":
            node_id = int((node.get("next node") or [0])[0])
            continue
        return node_id  # question, win, or lose


def _revenue(choice: dict[str, Any]) -> float:
    """Parse a choice's revenue into dollars.

    Prefers the numeric `revenue_million` field when present, otherwise parses
    the human-readable `revenue` string (e.g. "+$4 million", "-$500,000").
    """
    value = choice.get("revenue_million")
    if value is not None:
        return float(value) * 1_000_000
    return _parse_revenue_string(choice.get("revenue"))


def _parse_revenue_string(raw: Any) -> float:
    """Parse strings like '+$3.2 million', '-$500,000', '$250,000'."""
    if raw is None or raw == "":
        return 0.0
    if isinstance(raw, (int, float)):
        return float(raw)

    text = str(raw).strip().lower()
    sign = -1.0 if text.startswith("-") else 1.0
    match = re.search(r"[+-]?\$?\s*([\d,.]+)\s*(million|m|thousand|k)?", text)
    if not match:
        return 0.0

    value = float(match.group(1).replace(",", ""))
    unit = match.group(2)
    multiplier = (
        1_000_000 if unit in ("million", "m")
        else 1_000 if unit in ("thousand", "k")
        else 1
    )
    return value * multiplier * sign


def _session_view(session_id: str) -> dict[str, Any]:
    session = SESSIONS[session_id]
    screen = resolve_screen(session["current_node"])
    return {
        "session_id": session_id,
        "budget": session["budget"],
        "current_node": session["current_node"],
        "history": session["history"],
        "screen": screen,
    }


app.include_router(router)
