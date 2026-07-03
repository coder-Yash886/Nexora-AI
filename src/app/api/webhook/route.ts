import { NextRequest, NextResponse } from "next/server";
import {
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";

import { connectAgentToMeeting } from "@/lib/connect-agent-to-meeting";
import { streamVideo } from "@/lib/stream-video";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();

  let payload: unknown;
  try {
    payload = streamVideo.verifyAndParseWebhook(body, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;
  console.log("Webhook event received:", eventType);

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId || event.call.id;
    console.log("Extracted meetingId:", meetingId);

    if (!meetingId) {
      console.error("Missing meetingId in webhook payload");
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    try {
      await connectAgentToMeeting(meetingId);
    } catch (err) {
      console.error("Failed to connect AI agent via webhook:", err);
      return NextResponse.json({
        success: true,
        warning: "AI agent connection failed; continuing without agent",
      });
    }

    return NextResponse.json({ success: true });
  }

  if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];
    console.log("Participant left call. Meeting ID:", meetingId);

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
