import { AgentIdView } from "@/modules/agents/ui/views/agent-id-view";
import { HydrateClient, trpc } from "@/trpc/server";

interface Props {
  params: Promise<{ agentId: string }>;
}

const Page = async ({ params }: Props) => {
  const { agentId } = await params;

  void trpc.agents.getOne.prefetch({ id: agentId });

  return (
    <HydrateClient>
      <AgentIdView agentId={agentId} />
    </HydrateClient>
  );
};

export default Page;
