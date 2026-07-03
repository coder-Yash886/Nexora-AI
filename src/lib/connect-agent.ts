import "server-only";

import type { StreamCall } from "@stream-io/node-sdk";

import { streamVideo } from "@/lib/stream-video";

function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

async function connectGeminiAgent(options: {
  meetingId: string;
  agentUserId: string;
  agentName: string;
  agentImage: string;
  instructions: string;
}): Promise<void> {
  const serviceUrl = process.env.AGENT_SERVICE_URL ?? "http://127.0.0.1:8001";

  const response = await fetch(`${serviceUrl}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meeting_id: options.meetingId,
      agent_id: options.agentUserId,
      agent_name: options.agentName,
      agent_image: options.agentImage,
      instructions: options.instructions,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini agent service failed (${response.status}): ${body}`);
  }
}

async function connectOpenAiAgent(options: {
  call: StreamCall;
  agentUserId: string;
  instructions: string;
}): Promise<void> {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const realtimeClient = await streamVideo.video.connectOpenAi({
    call: options.call,
    openAiApiKey,
    agentUserId: options.agentUserId,
  });

  realtimeClient.updateSession({
    instructions: options.instructions,
  });
}

export async function connectAgentToCall(options: {
  call: StreamCall;
  meetingId: string;
  agentUserId: string;
  agentName: string;
  agentImage: string;
  instructions: string;
}): Promise<"gemini" | "openai"> {
  if (getGeminiApiKey()) {
    await connectGeminiAgent({
      meetingId: options.meetingId,
      agentUserId: options.agentUserId,
      agentName: options.agentName,
      agentImage: options.agentImage,
      instructions: options.instructions,
    });
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY) {
    await connectOpenAiAgent({
      call: options.call,
      agentUserId: options.agentUserId,
      instructions: options.instructions,
    });
    return "openai";
  }

  throw new Error(
    "No AI provider configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) or OPENAI_API_KEY.",
  );
}
