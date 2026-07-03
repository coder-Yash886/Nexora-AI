"use client";

import { useEffect, useRef } from "react";

import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";

interface Props {
  meetingId: string;
}

export const ProcessingState = ({ meetingId }: Props) => {
  const utils = trpc.useUtils();
  const startedRef = useRef(false);
  const generateSummary = trpc.meetings.generateSummary.useMutation({
    onSettled: async () => {
      await utils.meetings.getOne.invalidate({ id: meetingId });
    },
  });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    generateSummary.mutate({ id: meetingId });
  }, [meetingId, generateSummary]);

  return (
    <LoadingState
      title="Your meeting summary is being generated"
      description="This may take a moment. Please wait..."
    />
  );
};
