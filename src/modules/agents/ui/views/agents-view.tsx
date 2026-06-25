"use client"
import { trpc } from "@/trpc/client"
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

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
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}