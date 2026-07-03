import "server-only";

import { and, eq, not } from "drizzle-orm";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { generateAvatarUri } from "@/lib/avatar";
import { connectAgentToCall } from "@/lib/connect-agent";
import { streamVideo } from "@/lib/stream-video";

export async function connectAgentToMeeting(meetingId: string): Promise<void> {
  const [existingMeeting] = await db
    .select()
    .from(meetings)
    .where(
      and(
        eq(meetings.id, meetingId),
        not(eq(meetings.status, "completed")),
        not(eq(meetings.status, "cancelled")),
      ),
    );

  if (!existingMeeting) {
    console.error(`Meeting ${meetingId} not found for agent connection`);
    return;
  }

  const [existingAgent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, existingMeeting.agentId));

  if (!existingAgent) {
    console.error(`Agent ${existingMeeting.agentId} not found`);
    return;
  }

  const agentImage = generateAvatarUri({
    seed: existingAgent.name,
    variant: "botttsNeutral",
  });

  await streamVideo.upsertUsers([
    {
      id: existingAgent.id,
      name: existingAgent.name,
      role: "user",
      image: agentImage,
    },
  ]);

  console.log(`Connecting agent "${existingAgent.name}" to meeting ${meetingId}...`);

  const call = streamVideo.video.call("default", meetingId);
  const provider = await connectAgentToCall({
    call,
    meetingId,
    agentUserId: existingAgent.id,
    agentName: existingAgent.name,
    agentImage,
    instructions: existingAgent.instructions,
  });

  console.log(`${provider} agent connected to meeting ${meetingId}`);
}
