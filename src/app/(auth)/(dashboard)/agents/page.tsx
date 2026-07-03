import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/agents/params";
import { AgentsView } from "@/modules/agents/ui/views/agents-view"
import { AgentsListHeader } from "@/modules/agents/ui/views/components/agents-list-header";
import { HydrateClient, trpc } from "@/trpc/server"
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";


interface Props{
  searchParams: Promise<SearchParams>
}

const page = async ({searchParams}: Props) => {

    const filters = await loadSearchParams(searchParams)
    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!session) {
      redirect("/sign-in");
    }

  void trpc.agents.getMany.prefetch(filters);

  return (
    <>
     <AgentsListHeader />
    <HydrateClient>
      <AgentsView />
    </HydrateClient>
    </>
  )
}

export default page