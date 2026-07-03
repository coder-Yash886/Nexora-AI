"use client"
import { ErrorState } from "@/components/error-state";
import { generateAvatarUri } from "@/lib/avatar";
import { useTRPC } from "@/trpc/client";
import { CallProvider } from "../components/call-provider";

interface Props {
  meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const [data] = trpc.meetings.getOne.useSuspenseQuery({ id: meetingId });

  const agentImage = generateAvatarUri({
    seed: data.agent.name,
    variant: "botttsNeutral",
  });

  if(data.status === "completed" || data.status === "cancelled"){
    return(
        <div className="flex h-screen items-center justify-center">
            <ErrorState 
                title="Meeting has ended"
                description="You can no longer join this meeting"
            />
        </div>
    )
  }

  return (
    <CallProvider
      meetingId={meetingId}
      meetingName={data.name}
      agentName={data.agent.name}
      agentImage={agentImage}
    />
  );
};