"use client"
import { trpc } from "@/trpc/client"
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "../../../../components/data-table";
import { columns } from "./components/colums";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "./components/data-pagination";
import { useRouter } from "next/navigation";

export const AgentsView = () => {
  const router = useRouter();
  const [filters, setFilters] = useAgentsFilters()
  const { data, isLoading, isError } = trpc.agents.getMany.useQuery({
    ...filters
  });

  if (isLoading) return (
    <LoadingState
      title="Loading Agents"
      description="This will take few seconds...."
    />
  )

  if (isError) return (
    <ErrorState
      title="Error Loading Agents"
      description="Something went wrong"
    />
  )

  return (
    <div className="flex min-w-0 w-full max-w-full flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <div className="w-full min-w-0 overflow-x-auto">
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        onRowClick={(row) => router.push(`/agents/${row.id}`)}
      />
      </div>
      <DataPagination
        page={filters.page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(page) => setFilters({ page })}
      />
      {(data?.items ?? []).length === 0 && (
        <EmptyState
          title="Create your first agent"
          description="Create an agent to join your meeting. Each agent will follow your instructions and can interact with participants during the call"
        />
      )}
    </div>
  )
}