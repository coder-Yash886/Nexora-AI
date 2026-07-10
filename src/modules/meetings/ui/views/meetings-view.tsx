"use client";

import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/colums";
import { MeetingsMobileList } from "../components/meetings-mobile-list";
import { EmptyState } from "@/components/empty-state";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/modules/agents/ui/views/components/data-pagination";
import { useRouter } from "next/navigation";

export const MeetingsView = () => {
  const router = useRouter();
  const [filters, setFilters] = useMeetingsFilters();
  const { data, isLoading, isError } = trpc.meetings.getMany.useQuery({
    ...filters,
    status: filters.status ?? undefined,
    agentId: filters.agentId || undefined,
  });

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
    <div className="flex min-w-0 w-full max-w-full flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <MeetingsMobileList
        items={data?.items ?? []}
        onSelect={(id) => router.push(`/meetings/${id}`)}
      />

      <div className="hidden w-full min-w-0 md:block">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          onRowClick={(row) => router.push(`/meetings/${row.id}`)}
        />
      </div>

      <DataPagination
         page={filters.page}
         totalPages={data?.totalPages ?? 1}
         onPageChange={(page) => setFilters({ page })}
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
