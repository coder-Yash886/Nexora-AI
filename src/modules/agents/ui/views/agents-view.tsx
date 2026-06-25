"use client"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"

export const AgentsView = () => {
  const { data, isLoading, isError } = trpc.agents.getMany.useQuery();

  if (isLoading)
     return <div>Loading...</div>
  if (isError)
     return <div>Error</div>

  return (
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}