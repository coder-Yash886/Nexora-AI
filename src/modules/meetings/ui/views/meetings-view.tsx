"use client";

import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/colums";
import { EmptyState } from "@/components/empty-state";


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
      <DataTable 
       data={data?.items ?? []}
       columns={columns}
       />
      {(data?.items ?? []).length === 0 && (
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, and interact with participants in real time."
        />
      )}
    </div>
  );
};
