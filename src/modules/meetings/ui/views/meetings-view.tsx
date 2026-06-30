"use client";

import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export const MeetingsView = () => {
  const { data, isLoading, isError } = trpc.meetings.getMany.useQuery({});

  if (isLoading) {
    return (
      <LoadingState
        title="Loading Meetings"
        description="This will take few seconds...."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Error Loading Meetings"
        description="Something went wrong"
      />
    );
  }

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      {(data?.items ?? []).length === 0 ? (
        <p className="text-muted-foreground">No meetings yet.</p>
      ) : (
        <ul className="space-y-2">
          {(data?.items ?? []).map((meeting) => (
            <li key={meeting.id} className="rounded-lg border bg-white p-4">
              {meeting.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
