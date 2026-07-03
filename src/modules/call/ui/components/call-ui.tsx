import { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";
import { CallLobby } from "./call-lobby";

interface Props {
  meetingId: string;
  meetingName: string;
};

export const CallUI = ({ meetingId, meetingName }: Props) => {
  const trpc = useTRPC();
  const updateStatus = trpc.meetings.updateStatus.useMutation();
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  const handleJoin = async () => {
    if (!call) return;

    try {
      await call.join({ create: true });
      await call.microphone.enable();
      updateStatus.mutate({ id: meetingId, status: "active" });
      setShow("call");
    } catch (error: unknown) {
      console.error("Failed to join call:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to join the call. Please try again.";
      toast.error(message);
    }
  };

  const handleLeave = () => {
    if (!call) return;

    try {
      call.endCall();
      updateStatus.mutate({ id: meetingId, status: "completed" });
      setShow("ended");
    } catch (error: unknown) {
      console.error("Failed to leave/end call:", error);
      toast.error("An error occurred while leaving the call.");
    }
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} />}
      {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} />}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  )
};