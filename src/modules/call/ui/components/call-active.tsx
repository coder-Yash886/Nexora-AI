"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CallControls, useCallStateHooks } from "@stream-io/video-react-sdk";

import { CallAgent } from "./call-agent";
import { CallParticipantFrame } from "./call-participant-frame";

interface Props {
  onLeave: () => void;
  meetingName: string;
  meetingId: string;
  agentName: string;
  agentImage: string;
  userName: string;
  userImage: string;
}

export const CallActive = ({
  onLeave,
  meetingName,
  meetingId,
  agentName,
  agentImage,
  userName,
  userImage,
}: Props) => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { isMute: isCameraOff } = useCameraState();

  const [agentReply, setAgentReply] = useState("");
  const [agentStatus, setAgentStatus] = useState("Type or tap mic to ask");
  const isThinking = agentStatus === "Thinking...";

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <header className="flex items-center gap-3 px-4 py-4">
        <Link
          href="/"
          className="flex items-center justify-center rounded-full bg-white/10 p-1.5"
        >
          <Image src="/logo.svg" width={22} height={22} alt="Logo" />
        </Link>
        <h4 className="text-base font-medium">{meetingName}</h4>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-2">
        <CallParticipantFrame
          name={agentName}
          image={agentImage}
          size="large"
          isAgent
          subtitle={agentReply || undefined}
          isThinking={isThinking}
          isMicMuted={false}
          isCameraOff
        />

        <CallParticipantFrame
          name={userName}
          image={userImage}
          size="small"
          isMicMuted={isMicMuted}
          isCameraOff={isCameraOff}
        />
      </div>

      <div className="space-y-3 px-4 pb-3">
        <p className="text-center text-xs text-white/50">{agentStatus}</p>
        <CallAgent
          meetingId={meetingId}
          enabled
          onReply={setAgentReply}
          onStatusChange={setAgentStatus}
        />
      </div>

      <div className="bg-[#101213] px-4 py-3">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
