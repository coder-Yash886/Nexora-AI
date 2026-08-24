"use client";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avtar";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  meetingId: string;
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const Transcript = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.meetings.getTranscript.useQuery({
    meetingId,
  });

  if (isLoading) {
    return (
      <LoadingState
        title="Loading transcript"
        description="Fetching meeting transcript..."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Error loading transcript"
        description="Please try again later"
      />
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white rounded-lg border px-4 py-10 flex flex-col items-center gap-3 text-center">
        <AlertCircleIcon className="size-8 text-muted-foreground/50" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            No transcript available yet
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
            Stream takes 3–5 minutes to generate the transcript after the call ends.
            Make sure the call lasted long enough for the transcription service to activate.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-1 gap-2"
          onClick={() => utils.meetings.getTranscript.invalidate({ meetingId })}
        >
          <RefreshCwIcon className="size-3.5" />
          Check again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border divide-y">
      {data.map((item, index) => (
        <div key={`${item.start_ts}-${index}`} className="flex gap-3 px-4 py-4">
          <GeneratedAvatar
            seed={item.speakerName}
            variant="initials"
            className="size-8 shrink-0 mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{item.speakerName}</p>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatTimestamp(item.start_ts)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
