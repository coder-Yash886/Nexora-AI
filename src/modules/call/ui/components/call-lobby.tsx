"use client";

import Link from "next/link";
import { LogInIcon, LoaderIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
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
    <div className="flex flex-col items-center justify-center gap-2 px-3">
      <p className="text-sm text-center leading-relaxed break-words max-w-[min(100%,280px)] mx-auto text-amber-400">
        🎤 Please allow microphone &amp; camera access in your browser to continue.
      </p>
    </div>
  );
};

export const CallLobby = ({ onJoin, isJoining = false }: Props) => {
  const call = useCall();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasMicPermission, isMute: isMicMuted } = useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission, isMute: isCameraMuted } = useCameraState();

  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

  const [micLoading, setMicLoading] = useState(false);
  const [camLoading, setCamLoading] = useState(false);

  // On mount: request browser permission via native API first,
  // then let SDK know the user has granted it.
  useEffect(() => {
    if (!call) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        // Release the raw tracks — SDK manages its own pipeline
        stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => {
        // Permission denied — AllowBrowserPermissions will render
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.id]);

  const toggleMic = async () => {
    if (!call || micLoading) return;
    setMicLoading(true);
    try {
      if (isMicMuted) {
        await call.microphone.enable();
      } else {
        await call.microphone.disable();
      }
    } catch (err) {
      console.error("Mic toggle error:", err);
    } finally {
      setMicLoading(false);
    }
  };

  const toggleCamera = async () => {
    if (!call || camLoading) return;
    setCamLoading(true);
    try {
      if (isCameraMuted) {
        await call.camera.enable();
      } else {
        await call.camera.disable();
      }
    } catch (err) {
      console.error("Camera toggle error:", err);
    } finally {
      setCamLoading(false);
    }
  };

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

          {/* Custom mic/camera toggle buttons */}
          <div className="flex gap-x-3 flex-wrap justify-center">
            {/* Microphone toggle */}
            <button
              onClick={toggleMic}
              disabled={micLoading || !hasMicPermission}
              title={isMicMuted ? "Turn on microphone" : "Turn off microphone"}
              className={`
                flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200
                ${isMicMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
                }
                disabled:opacity-50 disabled:cursor-not-allowed shadow-md
              `}
            >
              {micLoading ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : isMicMuted ? (
                <MicOffIcon className="size-4" />
              ) : (
                <MicIcon className="size-4" />
              )}
            </button>

            {/* Camera toggle */}
            <button
              onClick={toggleCamera}
              disabled={camLoading || !hasCameraPermission}
              title={isCameraMuted ? "Turn on camera" : "Turn off camera"}
              className={`
                flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200
                ${isCameraMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
                }
                disabled:opacity-50 disabled:cursor-not-allowed shadow-md
              `}
            >
              {camLoading ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : isCameraMuted ? (
                <VideoOffIcon className="size-4" />
              ) : (
                <VideoIcon className="size-4" />
              )}
            </button>
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
