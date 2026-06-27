"use client"
import { trpc } from "@/trpc/client"
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "./components/data-table";
import { columns } from "./components/colums";
import { EmptyState } from "@/components/empty-state";







export const AgentsView = () => {
  const { data, isLoading, isError } = trpc.agents.getMany.useQuery();

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
    <div className="flex-1 pb-4 px-4 md:x-8 flex flex-col gap-y-4">
    <DataTable columns={columns}  data={data}/>
    {data.length === 0 && (
      <EmptyState 
        title="Create your first agent"
        description="Create an agent to join your meeting. Each agent will follow your instructions and can interact with participants during the call"
      />
    )}
    </div>
  )
}