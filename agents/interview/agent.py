"""PathED LiveKit interviewer worker.

Interview LLM is Ollama Cloud (gpt-oss). Speech stays in the browser
(Web Speech API) so Groq is not used in this feature. Run from the repo root:

    npm run interview:agent

Requires Python 3.10+ and:  pip install -r agents/interview/requirements.txt
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

import aiohttp
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession
from livekit.plugins import openai, silero

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env.local")
load_dotenv(ROOT / ".env")

APP_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").rstrip("/")
SECRET = os.getenv("INTERVIEW_AGENT_SECRET", "")
AGENT_NAME = os.getenv("LIVEKIT_AGENT_NAME", "pathed-interviewer")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://ollama.com/v1").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_INTERVIEW_MODEL", "gpt-oss:120b")


async def persist(session_id: str, role: str, content: str) -> None:
    text = (content or "").strip()
    if not session_id or not text or not SECRET:
        return
    try:
        async with aiohttp.ClientSession() as http:
            await http.post(
                f"{APP_URL}/api/ai/interview/internal/turn",
                json={
                    "sessionId": session_id,
                    "role": role,
                    "content": text[:8000],
                    "source": "voice",
                },
                headers={
                    "x-interview-agent-secret": SECRET,
                    "content-type": "application/json",
                },
                timeout=aiohttp.ClientTimeout(total=8),
            )
    except Exception as exc:  # noqa: BLE001 — worker must not crash on persist
        print(f"[interview-agent] persist failed: {exc}")


class Interviewer(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(instructions=instructions)


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def interview(ctx: agents.JobContext) -> None:
    if not OLLAMA_API_KEY:
        raise RuntimeError("OLLAMA_API_KEY is required for the interview agent.")

    meta: dict = {}
    try:
        meta = json.loads(ctx.room.metadata or "{}")
    except json.JSONDecodeError:
        meta = {}

    session_id = str(meta.get("sessionId") or "")
    instructions = str(
        meta.get("instructions")
        or "You are PathED Interviewer. Run a short, fair mock technical interview. Ask one question at a time."
    )

    session = AgentSession(
        llm=openai.LLM(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            api_key=OLLAMA_API_KEY,
        ),
        vad=silero.VAD.load(),
    )

    @session.on("conversation_item_added")
    def _on_item(ev) -> None:  # type: ignore[no-untyped-def]
        item = ev.item
        role = "student" if getattr(item, "role", "") in {"user", "student"} else "interviewer"
        text = getattr(item, "text_content", None) or getattr(item, "content", "")
        if isinstance(text, list):
            text = " ".join(str(part) for part in text)
        if session_id and text:
            asyncio.create_task(persist(session_id, role, str(text)))

    await session.start(room=ctx.room, agent=Interviewer(instructions))
    await session.generate_reply(
        instructions='Introduce yourself briefly and tell them to say start interview. Do not ask a question yet.'
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
