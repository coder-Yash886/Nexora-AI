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
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <LoadingState
        title="Your meeting summary is being generated"
        description="This may take a moment. Please wait..."
      />
    </div>
  );
};
