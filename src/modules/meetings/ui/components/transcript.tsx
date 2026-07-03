"use client";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avtar";

interface Props {
  meetingId: string;
}

export const Transcript = ({ meetingId }: Props) => {
  const trpc = useTRPC();
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
      <div className="bg-white rounded-lg border px-4 py-8 text-center text-muted-foreground">
        No transcript available yet.
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
            className="size-8 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">{item.speakerName}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
