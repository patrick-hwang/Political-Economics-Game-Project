"""AI explanation backend using Google's Gemini (free tier).

Explanations are generated *strictly* from the game data (the player's
decision trail) — the model is instructed never to invent events that are not
present in the provided data. If no API key is configured, a clear
instructional message is returned instead of crashing.

Configuration (environment variables):
    GEMINI_API_KEY   (required) — Google AI Studio API key.
    GEMINI_MODEL     (optional) — model id, default "gemini-2.0-flash".
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

# Load .env from the project root (or backend/) so GEMINI_API_KEY can be set
# in a git-ignored file instead of an environment variable.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

MODEL_DEFAULT = "gemini-2.0-flash"


class GeminiExplainer:
    """Lazily-loaded Gemini client; safe to instantiate without a key."""

    def __init__(self) -> None:
        self._client = None
        self._model: str | None = None
        self._init_error: str | None = None

    def available(self) -> bool:
        self._ensure_client()
        return self._client is not None

    def _ensure_client(self) -> None:
        if self._client is not None or self._init_error is not None:
            return

        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            self._init_error = (
                "GEMINI_API_KEY is not set. Add your free Google AI Studio key "
                "to the environment to enable AI explanations."
            )
            return

        try:
            from google import genai  # type: ignore
        except ImportError:
            self._init_error = (
                "The 'google-genai' package is not installed. "
                "Run: pip install google-genai"
            )
            return

        try:
            self._client = genai.Client(api_key=api_key)
            self._model = os.environ.get("GEMINI_MODEL", MODEL_DEFAULT)
        except Exception as exc:  # noqa: BLE001 - surface any config error clearly
            self._init_error = f"Could not initialize Gemini: {exc}"

    @property
    def init_error(self) -> str | None:
        self._ensure_client()
        return self._init_error

    def explain_decision(
        self,
        context: str,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """Explain *why the current outcome happened*, anchored to the decision trail.

        Used by the "Explain with AI" button after each choice/ending.
        """
        self._ensure_client()
        if self._client is None:
            return self._init_error or "AI explanation is unavailable."

        final_message = (
            "Explain in Vietnamese why this outcome happened as a result of the "
            "player's decisions, step by step, using ONLY the decision data above."
        )
        return self._ask(context, final_message, history)

    def chat(
        self,
        context: str,
        message: str,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """Answer a free-form chat message, using the decision trail as context.

        Used for casual Q&A (not tied to a specific choice).
        """
        self._ensure_client()
        if self._client is None:
            return self._init_error or "AI explanation is unavailable."

        final_message = (
            f"The player says: {message}\n\n"
            "Answer naturally in Vietnamese. If relevant, connect your answer to "
            "their decisions using ONLY the decision data above; otherwise just "
            "answer the question directly."
        )
        return self._ask(context, final_message, history)

    def _ask(
        self,
        context: str,
        final_message: str,
        history: list[dict[str, str]] | None,
    ) -> str:
        """Shared helper: build the system prompt + multi-turn contents and call Gemini."""
        system = (
            "You are a tutor for a political-economics game about monopoly and "
            "business strategy. Explain *only* using the decision data provided. "
            "Do not invent events, characters, or numbers that are not present in "
            "the data. Be concise, clear, and educational: connect the player's "
            "choices to their economic consequences.\n\n"
            "ALWAYS answer in Vietnamese (Tiếng Việt), regardless of the language "
            "of the question.\n\n"
            "FORMAT: reply in plain text only. Do NOT use Markdown formatting "
            "(no asterisks, hashes, backticks, bullet points, numbered lists, "
            "bold, italics, or links). Use normal sentences and plain paragraphs."
        )

        preamble = (
            "Here is the player's full decision trail so far. Use ONLY this data "
            "to explain outcomes and answer questions; do not invent anything "
            "beyond it:\n\n" f"{context}"
        )

        contents: list[dict[str, str]] = [{"role": "user", "content": preamble}]

        for msg in history or []:
            role = msg.get("role")
            if role in ("user", "assistant"):
                contents.append({"role": role, "content": msg.get("content", "")})

        contents.append({"role": "user", "content": final_message})

        client = self._client
        if client is None:
            return self._init_error or "AI explanation is unavailable."

        try:
            response = client.models.generate_content(
                model=self._model,
                contents=contents,
                config={"system_instruction": system},
            )
            return _strip_markdown(response.text)
        except Exception as exc:  # noqa: BLE001 - return a readable error to the user
            return f"AI explanation failed: {exc}"


def _strip_markdown(text: str) -> str:
    """Remove common Markdown artifacts as a safeguard, in case the model
    ignores the formatting instruction. Keeps plain sentences/paragraphs."""
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)   # headings
    text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)              # bold
    text = re.sub(r"(\*|_)(.*?)\1", r"\2", text)                 # italics
    text = re.sub(r"`{1,3}", "", text)                             # inline/code fences
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)  # bullet lists
    text = re.sub(r"^\s*\d+[.)]\s+", "", text, flags=re.MULTILINE)  # numbered lists
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)         # links -> text
    text = re.sub(r"[ \t]+\n", "\n", text)                        # trailing spaces
    return text.strip()


# Module-level singleton.
explainer = GeminiExplainer()


def build_trail_text(
    trail: list[dict[str, Any]],
    outcome: dict[str, Any] | None,
    graph: dict[int, dict[str, Any]] | None = None,
) -> str:
    """Turn a lean decision trail into a readable text block for the model.

    Each trail step only stores `choice_id` + `budget_after`. The choice's text
    (content/benefits/drawback/impact/revenue) is looked up from `graph` here,
    so we don't duplicate data that already lives in questions_v3.json.
    """
    lines: list[str] = []

    for i, step in enumerate(trail, start=1):
        choice_id = step.get("choice_id")
        node: dict[str, Any] = {}
        if graph is not None and choice_id is not None:
            node = graph.get(choice_id) or {}

        lines.append(
            f"Decision {i}: {node.get('content', '')}".rstrip() + "\n" +
            f"  - Benefits: {node.get('benefits') or '(none)'}\n" +
            f"  - Drawback: {node.get('potential drawback') or '(none)'}\n" +
            f"  - Outcome: {node.get('impact') or '(none)'}\n" +
            f"  - Revenue impact: {node.get('revenue') or 'n/a'}\n" +
            f"  - Budget after: ${step.get('budget_after', 0):,.0f}\n"
        )

    if outcome is not None:
        lines.append(
            f"Final outcome ({outcome.get('type', 'end')}): "
            f"{outcome.get('content', '')}\n"
        )

    if not lines:
        lines.append("(No decisions have been recorded yet.)")

    return "\n".join(lines)
