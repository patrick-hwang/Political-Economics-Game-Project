"""Minimal FastAPI backend for the Political-Economics roleplaying game.

Loads questions_v3.json once into memory as the single source of truth,
then exposes a tiny stateful session API. Each session tracks the current
node, the running budget, and the player's history.

Run:
    uvicorn app:app --reload

Endpoints:
    POST /session                 -> create a playthrough (starts at node 1)
    GET  /session/{id}            -> current screen / state
    POST /session/{id}/choose     -> confirm a choice, advance the story
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DATA_FILE = Path(__file__).resolve().parent.parent / "questions_v3.json"
START_NODE_ID = 1
INITIAL_BUDGET = 1_000_000  # dollars; matches index.html

app = FastAPI(title="Political Economics Game API")

# Allow the static local frontend to call this API during development.
# No auth/cookies are used, so credentials stay disabled regardless of origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:8000",
        "http://127.0.0.1",
        "http://127.0.0.1:8000",
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


# ============================================
# ENDPOINTS
# ============================================

@app.get("/")
def root() -> dict[str, Any]:
    return {"game": "Political Economics Game", "nodes": len(GRAPH)}


@app.post("/session", response_model=SessionView)
def create_session() -> Any:
    session_id = uuid.uuid4().hex
    SESSIONS[session_id] = {
        "current_node": _question_node(START_NODE_ID),
        "budget": INITIAL_BUDGET,
        "history": [],
    }
    return _session_view(session_id)


@app.get("/session/{session_id}", response_model=SessionView)
def get_session(session_id: str) -> Any:
    _require_session(session_id)
    return _session_view(session_id)


@app.post("/session/{session_id}/choose", response_model=SessionView)
def choose(session_id: str, body: ChooseRequest) -> Any:
    session = _require_session(session_id)
    choice_id = body.choice_node_id

    choice = GRAPH.get(choice_id)
    if choice is None or choice.get("type") != "choice":
        raise HTTPException(status_code=404, detail=f"Choice node {choice_id} not found")

    # The choice must belong to the question currently on-screen.
    current = GRAPH.get(session["current_node"])
    if current is None or current.get("type") != "question":
        raise HTTPException(status_code=409, detail="Session is not at a question node")

    allowed = [int(c) for c in (current.get("next node") or [])]
    if choice_id not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Choice {choice_id} is not valid for question {session['current_node']}",
        )

    next_ids = choice.get("next node") or []
    if len(next_ids) != 1:
        raise HTTPException(status_code=500, detail=f"Choice {choice_id} must link to one node")

    # Apply revenue and advance to the destination's resolved question node
    # (skip any intervening context nodes so the session is always "at"
    # a question or a terminal outcome).
    session["budget"] += _revenue(choice)
    session["current_node"] = _question_node(int(next_ids[0]))
    session["history"].append(choice_id)

    return _session_view(session_id)


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
    value = choice.get("revenue_million")
    if value is None:
        return 0.0
    return float(value) * 1_000_000


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
