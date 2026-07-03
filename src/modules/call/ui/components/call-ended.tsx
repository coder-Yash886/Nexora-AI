"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";

interface Props {
  meetingId: string;
}

export const CallEnded = ({ meetingId }: Props) => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleViewSummary = () => {
    setIsGenerating(true);
    router.push(`/meetings/${meetingId}`);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
        <LoadingState
          title="Your meeting summary is being generated"
          description="This may take a moment. Please wait..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">You have ended the call</h6>
            <p className="text-sm text-muted-foreground">
              Your summary will be ready shortly.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/meetings">Back to meetings</Link>
            </Button>
            <Button onClick={handleViewSummary}>View meeting summary</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
