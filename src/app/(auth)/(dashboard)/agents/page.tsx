import { auth } from "@/lib/auth";
import { AgentsView } from "@/modules/agents/ui/views/agents-view"
import { AgentsListHeader } from "@/modules/agents/ui/views/components/agents-list-header";
import { getQueryClient, caller } from "@/trpc/server"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {

    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!session) {
      redirect("/");
    }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: [["agents", "getMany"]],
    queryFn: () => caller.agents.getMany(),
  });

  return (
    <>
     <AgentsListHeader />
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AgentsView />
    </HydrationBoundary>
    </>
  )
}

export default page