"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { useConfirm } from "@/hooks/use-confirm";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { CancelledState } from "../components/cancelled-state";
import { ProcessingState } from "../components/processing-state";
import { UpcomingState } from "../components/upcomming-state";
import { ActiveState } from "../components/active-state";

interface Props {
  meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

  const [data] = trpc.meetings.getOne.useSuspenseQuery({ id: meetingId });

  const removeMeeting = trpc.meetings.remove.useMutation({
    onSuccess: async () => {
      await utils.meetings.getMany.invalidate();
      router.push("/meetings");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    "This action will permanently remove this meeting.",
  );

  const handleRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    removeMeeting.mutate({ id: meetingId });
  };


  const isActive = data.status === "active";
  const isCompleted = data.status === "completed";
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isProessing = data.status === "processing";

  return (
    <>
      <RemoveConfirmation />
      {data && (
        <UpdateMeetingDialog
          open={updateMeetingDialogOpen}
          onOpenChange={setUpdateMeetingDialogOpen}
          initialValues={data}
        />
      )}
      <div className="flex-1 px-4 md:px-8 py-4 flex flex-col gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data?.name || ""}
          onEdit={() => setUpdateMeetingDialogOpen(true)}
          onRemove={handleRemove}
        />
        {isCancelled && <CancelledState />}
        {isCompleted && <div>CompletedState </div>}
        {isActive && <ActiveState meetingId={meetingId} />}
        {isUpcoming && <UpcomingState meetingId={meetingId} />}
        {isProessing && <ProcessingState />}
      </div>
    </>
  );
};

export const MeetingIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take a few seconds"
    />
  );
};

export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Error Loading Meeting"
      description="Please try again later"
    />
  );
};