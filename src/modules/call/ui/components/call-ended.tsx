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
      <div className="flex h-dvh min-h-0 flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar p-3">
        <LoadingState
          title="Your meeting summary is being generated"
          description="This may take a moment. Please wait..."
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar p-3 sm:p-4">
      <div className="flex w-full flex-1 items-center justify-center py-2 sm:py-4">
        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-y-6 rounded-lg bg-background p-4 shadow-sm sm:p-8">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">You have ended the call</h6>
            <p className="text-sm text-muted-foreground">
              Your summary will be ready shortly.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/meetings">Back to meetings</Link>
            </Button>
            <Button onClick={handleViewSummary} className="w-full sm:w-auto">
              View meeting summary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
