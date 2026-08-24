import Link from "next/link";
import { LogInIcon, LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCall,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { generateAvatarUri } from "@/lib/avatar";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./call-lobby.css";

interface Props {
  onJoin: () => void;
  isJoining?: boolean;
}

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
  );
};

const AllowBrowserPermissions = () => {
  return (
    <p className="text-sm text-center px-3 leading-relaxed break-words max-w-[min(100%,280px)] mx-auto">
      Please grant your browser permission to access your camera and microphone.
    </p>
  );
};

export const CallLobby = ({ onJoin, isJoining = false }: Props) => {
  const call = useCall();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission } = useCameraState();

  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

  // Request permissions via Stream SDK so the browser prompt appears
  // and the ToggleAudioPreviewButton works correctly.
  useEffect(() => {
    if (!call) return;

    // Enable briefly to trigger the browser permission dialog,
    // then disable so the user starts muted/camera-off in the lobby.
    const requestPermissions = async () => {
      try {
        await call.microphone.enable();
        await call.camera.enable();
        // Now disable both — user can toggle from the lobby controls
        await call.microphone.disable();
        await call.camera.disable();
      } catch {
        // Permission denied — AllowBrowserPermissions message will show
      }
    };

    requestPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.id]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-[100vw] min-w-0 overflow-x-hidden bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-3 sm:px-8 flex flex-1 items-center justify-center w-full max-w-full min-w-0 box-border">
        <div className="flex flex-col items-center justify-center gap-y-5 sm:gap-y-6 bg-background rounded-lg p-4 sm:p-10 shadow-sm w-[min(100%,28rem)] max-w-full min-w-0 box-border overflow-hidden">
          <div className="flex flex-col gap-y-2 text-center px-1 w-full">
            <h6 className="text-lg font-medium">Ready to join?</h6>
            <p className="text-sm text-muted-foreground">
              Set up your call before joining
            </p>
          </div>

          <div className="lobby-video-preview w-full max-w-full min-w-0 overflow-hidden rounded-md">
            <VideoPreview
              DisabledVideoPreview={
                hasBrowserMediaPermission
                  ? DisabledVideoPreview
                  : AllowBrowserPermissions
              }
            />
          </div>

          <div className="flex gap-x-2 flex-wrap justify-center">
            <ToggleAudioPreviewButton />
            <ToggleVideoPreviewButton />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-between w-full">
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/meetings">Cancel</Link>
            </Button>
            <Button
              onClick={onJoin}
              disabled={isJoining}
              className="w-full sm:w-auto"
            >
              {isJoining ? (
                <LoaderIcon className="animate-spin" />
              ) : (
                <LogInIcon />
              )}
              {isJoining ? "Joining..." : "Join Call"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
