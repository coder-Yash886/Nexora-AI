import { inngest } from "@/inngest/client";
import { processMeetingSummary } from "@/lib/process-meeting-summary";

export const meetingsProcessing = inngest.createFunction(
  {
    id: "meetings/processing",
    triggers: [{ event: "meetings/processing" }],
  },
  async ({ event, step }) => {
    await step.run("process-summary", async () => {
      const result = await processMeetingSummary(event.data.meetingId);

      if (!result.ok && result.reason === "transcript_pending") {
        throw new Error("Transcript not ready yet");
      }
    });
  },
);
