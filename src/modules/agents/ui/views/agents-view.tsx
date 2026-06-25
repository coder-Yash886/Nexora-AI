"use client"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { LoadingState } from "@/components/loading-state";

export const AgentsView = () => {
  const { data, isLoading, isError } = trpc.agents.getMany.useQuery();

  if (isLoading){
    return (
        <LoadingState
        title= "Loading Agents"
        description= "This will take few seconds...."
        />
    )
  }
   
  if (isError)
     return <div>Error</div>

  return (
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}