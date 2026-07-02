"use client"
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";

interface Props {
  meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const [data] = trpc.meetings.getOne.useSuspenseQuery({ id: meetingId });


  if(data.status === "upcoming"){
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
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  );
};