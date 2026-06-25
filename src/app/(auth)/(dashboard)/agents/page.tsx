import { AgentsView } from "@/modules/agents/ui/views/agents-view"
import { getQueryClient, caller } from "@/trpc/server"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: [["agents", "getMany"]],
    queryFn: () => caller.agents.getMany(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AgentsView />
    </HydrationBoundary>
  )
}

export default page