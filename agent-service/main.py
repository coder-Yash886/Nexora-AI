import asyncio
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from vision_agents.core import Agent, User
from vision_agents.plugins import gemini, getstream

# Load env from meetai root (.env) and local overrides
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()

# Map Next.js Stream env names to what vision-agents/getstream expect
if not os.getenv("STREAM_API_KEY"):
    os.environ["STREAM_API_KEY"] = os.getenv("NEXT_PUBLIC_STREAM_VIDEO_API_KEY", "")
if not os.getenv("STREAM_API_SECRET"):
    os.environ["STREAM_API_SECRET"] = os.getenv("STREAM_VIDEO_SECRET_KEY", "")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

active_tasks: dict[str, asyncio.Task[None]] = {}

FAST_REPLY_CONFIG = {
    "response_modalities": ["AUDIO"],
    "realtime_input_config": {
        "automatic_activity_detection": {
            "start_of_speech_sensitivity": "START_SENSITIVITY_HIGH",
            "end_of_speech_sensitivity": "END_SENSITIVITY_HIGH",
            "silence_duration_ms": 150,
            "prefix_padding_ms": 30,
        }
    },
}


class ConnectRequest(BaseModel):
    meeting_id: str
    agent_id: str
    agent_name: str = "AI Agent"
    agent_image: str | None = None
    instructions: str = "You are a helpful meeting assistant."


def get_gemini_api_key() -> str | None:
    return (
        os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
    )


def build_instructions(instructions: str) -> str:
    return (
        f"{instructions.strip()}\n\n"
        "Reply immediately with short, direct answers. "
        "Be conversational and respond as soon as the user finishes speaking."
    )


async def run_agent(req: ConnectRequest) -> None:
    api_key = get_gemini_api_key()
    if not api_key:
        logger.error("No Gemini API key found (GOOGLE_API_KEY / GEMINI_API_KEY)")
        return

    try:
        edge = getstream.Edge()
        agent = Agent(
            edge=edge,
            agent_user=User(
                name=req.agent_name,
                id=req.agent_id,
                image=req.agent_image or "",
            ),
            instructions=build_instructions(req.instructions),
            llm=gemini.Realtime(api_key=api_key, config=FAST_REPLY_CONFIG),
        )

        call = edge.client.video.call("default", req.meeting_id)
        logger.info("Agent %s joining call %s", req.agent_id, req.meeting_id)

        async with agent.join(call, participant_wait_timeout=0):
            await agent.finish()
    except Exception:
        logger.exception("Agent connection failed for meeting %s", req.meeting_id)
    finally:
        active_tasks.pop(req.meeting_id, None)
        logger.info("Agent disconnected from meeting %s", req.meeting_id)


app = FastAPI()


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "active_meetings": [
            meeting_id
            for meeting_id, task in active_tasks.items()
            if not task.done()
        ],
    }


@app.post("/connect")
async def connect(req: ConnectRequest) -> dict[str, str]:
    if not get_gemini_api_key():
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY or GOOGLE_API_KEY not set",
        )

    if not os.getenv("STREAM_API_KEY") or not os.getenv("STREAM_API_SECRET"):
        raise HTTPException(
            status_code=500,
            detail="STREAM_API_KEY / STREAM_API_SECRET not set",
        )

    existing = active_tasks.get(req.meeting_id)
    if existing is not None and not existing.done():
        return {"status": "already_connected", "meeting_id": req.meeting_id}

    task = asyncio.create_task(run_agent(req))
    active_tasks[req.meeting_id] = task
    return {"status": "connecting", "meeting_id": req.meeting_id}
