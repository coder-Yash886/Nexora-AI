import Link from "next/link";
import { LogInIcon } from "lucide-react";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { generateAvatarUri } from "@/lib/avatar";

import "@stream-io/video-react-sdk/dist/css/styles.css";

interface Props {
  onJoin: () => void;
};

const DisabledVideoPreview = () => {
  const { data } = authClient.useSession();

  return (
    <DefaultVideoPlaceholder
      participant={
        {
          name: data?.user.name ?? "",
          image: 
            data?.user.image ??
            generateAvatarUri({
              seed: data?.user.name ?? "",
              variant: "initials",
            }),
        } as StreamVideoParticipant
      }
    />
  )
}

const AllowBrowserPermissions = () => {
  return (
    <p className="text-sm">
      Please grant your browser a permission to access your camera and
      microphone.
    </p>
  );
};

export const CallLobby = ({ onJoin }: Props) => {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission } = useCameraState();

  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

  return (
    <div className="flex h-dvh min-h-0 w-full max-w-full flex-col items-center justify-center overflow-x-hidden bg-radial from-sidebar-accent to-sidebar p-3 sm:p-4">
      <div className="flex w-full max-w-full min-w-0 flex-1 items-center justify-center py-2 sm:py-4">
        <div className="box-border flex w-full max-w-lg min-w-0 flex-col items-center justify-center gap-y-5 overflow-hidden rounded-lg bg-background p-4 shadow-sm sm:max-w-2xl sm:p-8">
          <div className="flex w-full flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">Ready to join?</h6>
            <p className="text-sm">Set up your call before joining</p>
          </div>
          <div className="call-lobby-preview w-full max-w-full min-w-0 overflow-hidden rounded-md">
            <VideoPreview
              DisabledVideoPreview={
                hasBrowserMediaPermission
                  ? DisabledVideoPreview
                  : AllowBrowserPermissions 
              }
            />
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2">
            <ToggleAudioPreviewButton />
            <ToggleVideoPreviewButton />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button asChild variant="ghost" className="w-full">
              <Link href="/meetings">
                Cancel
              </Link>
            </Button>
            <Button
              onClick={onJoin}
              className="w-full"
            >
              <LogInIcon />
              Join Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}