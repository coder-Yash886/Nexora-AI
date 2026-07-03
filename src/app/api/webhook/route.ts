import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  CallEndedEvent,
  CallRecordingReadyEvent,
  CallSessionParticipantLeftEvent,
  CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";

import { db } from "@/db";
import { meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { processMeetingSummary } from "@/lib/process-meeting-summary";
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

  if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];
    console.log("Participant left call. Meeting ID:", meetingId);
  } else if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId || event.call.id;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    await db
      .update(meetings)
      .set({
        status: "processing",
        endedAt: new Date(),
      })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
  } else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        transcriptUrl: event.call_transcription.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (updatedMeeting.transcriptUrl) {
      void processMeetingSummary(updatedMeeting.id).catch((error) => {
        console.error("Direct summary processing failed:", error);
      });

      await inngest.send({
        name: "meetings/processing",
        data: {
          meetingId: updatedMeeting.id,
          transcriptUrl: updatedMeeting.transcriptUrl,
        },
      });
    }
  } else if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    await db
      .update(meetings)
      .set({
        recordingUrl: event.call_recording.url,
      })
      .where(eq(meetings.id, meetingId));
  }

  return NextResponse.json({ success: true });
}
