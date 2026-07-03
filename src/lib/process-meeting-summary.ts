import "server-only";

import { eq, inArray } from "drizzle-orm";
import JSONL from "jsonl-parse-stringify";

import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { generateGeminiText } from "@/lib/gemini";
import { streamVideo } from "@/lib/stream-video";
import { StreamTranscriptItem } from "@/modules/meetings/types";

const SUMMARY_PROMPT = `
You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

Use the following markdown structure for every output:

### Overview
Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences.

### Notes
Break down key content into thematic sections. Each section should summarize key points in bullet format.

Example:
#### Section Name
- Main point or interaction shown here
- Another key insight
`.trim();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStreamAssets(meetingId: string) {
  const call = streamVideo.video.call("default", meetingId);

  const [transcriptionsResult, recordingsResult] = await Promise.all([
    call.listTranscriptions().catch(() => null),
    call.listRecordings().catch(() => null),
  ]);

  const transcriptUrl =
    transcriptionsResult?.transcriptions?.at(-1)?.url ?? null;
  const recordingUrl = recordingsResult?.recordings?.at(-1)?.url ?? null;

  return { transcriptUrl, recordingUrl };
}

async function enrichTranscriptWithSpeakers(
  transcript: StreamTranscriptItem[],
) {
  const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

  const userSpeakers = await db
    .select()
    .from(user)
    .where(inArray(user.id, speakerIds));

  const agentSpeakers = await db
    .select()
    .from(agents)
    .where(inArray(agents.id, speakerIds));

  const speakers = [...userSpeakers, ...agentSpeakers];

  return transcript.map((item) => {
    const speaker = speakers.find((s) => s.id === item.speaker_id);

    return {
      ...item,
      user: {
        name: speaker?.name ?? "Unknown",
      },
    };
  });
}

async function generateSummaryFromTranscript(
  transcriptWithSpeakers: Awaited<ReturnType<typeof enrichTranscriptWithSpeakers>>,
) {
  return generateGeminiText({
    contents:
      "Summarize the following transcript:\n" +
      JSON.stringify(transcriptWithSpeakers),
    config: {
      systemInstruction: SUMMARY_PROMPT,
    },
  });
}

export type ProcessMeetingSummaryResult =
  | { ok: true; alreadyDone?: boolean }
  | { ok: false; reason: "transcript_pending" | "meeting_not_found" };

export async function processMeetingSummary(
  meetingId: string,
): Promise<ProcessMeetingSummaryResult> {
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, meetingId));

  if (!meeting) {
    return { ok: false, reason: "meeting_not_found" };
  }

  if (meeting.status === "completed" && meeting.summary) {
    return { ok: true, alreadyDone: true };
  }

  let transcriptUrl = meeting.transcriptUrl;
  let recordingUrl = meeting.recordingUrl;

  if (!transcriptUrl || !recordingUrl) {
    const streamAssets = await fetchStreamAssets(meetingId);
    transcriptUrl = transcriptUrl ?? streamAssets.transcriptUrl;
    recordingUrl = recordingUrl ?? streamAssets.recordingUrl;

    if (transcriptUrl || recordingUrl) {
      await db
        .update(meetings)
        .set({
          ...(transcriptUrl ? { transcriptUrl } : {}),
          ...(recordingUrl ? { recordingUrl } : {}),
        })
        .where(eq(meetings.id, meetingId));
    }
  }

  if (!transcriptUrl) {
    return { ok: false, reason: "transcript_pending" };
  }

  const response = await fetch(transcriptUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch transcript: ${response.status}`);
  }

  const transcript = JSONL.parse<StreamTranscriptItem>(await response.text());
  const transcriptWithSpeakers = await enrichTranscriptWithSpeakers(transcript);
  const summary = await generateSummaryFromTranscript(transcriptWithSpeakers);

  await db
    .update(meetings)
    .set({
      summary,
      status: "completed",
    })
    .where(eq(meetings.id, meetingId));

  return { ok: true };
}

export async function processMeetingSummaryWithRetry(
  meetingId: string,
  options?: { maxAttempts?: number; delayMs?: number },
) {
  const maxAttempts = options?.maxAttempts ?? 18;
  const delayMs = options?.delayMs ?? 10000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await processMeetingSummary(meetingId);

    if (result.ok || result.reason !== "transcript_pending") {
      return result;
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, meetingId));

  if (meeting && meeting.status === "processing") {
    await db
      .update(meetings)
      .set({
        status: "completed",
        summary:
          "### Overview\nThis meeting ended, but a transcript was not available yet. If transcription is still processing, check back later or re-open this meeting.\n\n### Notes\n#### Next steps\n- Ensure the call had enough spoken content for transcription\n- Refresh this page after a few minutes",
      })
      .where(eq(meetings.id, meetingId));

    return { ok: true };
  }

  return { ok: false, reason: "transcript_pending" as const };
}
