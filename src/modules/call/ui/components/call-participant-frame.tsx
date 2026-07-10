"use client";

import { MicOffIcon, MoreHorizontalIcon, VideoOffIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface Props {
  name: string;
  image: string;
  size?: "large" | "small";
  isAgent?: boolean;
  subtitle?: string;
  isMicMuted?: boolean;
  isCameraOff?: boolean;
  isThinking?: boolean;
}

function SignalBars() {
  return (
    <div className="flex items-end gap-0.5 h-3">
      <span className="w-0.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="w-0.5 h-2 rounded-full bg-emerald-400" />
      <span className="w-0.5 h-3 rounded-full bg-emerald-400" />
    </div>
  );
}

export const CallParticipantFrame = ({
  name,
  image,
  size = "large",
  isAgent = false,
  subtitle,
  isMicMuted = true,
  isCameraOff = true,
  isThinking = false,
}: Props) => {
  const isLarge = size === "large";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-[#0d0f10] border border-[#2d52ff]/40 shadow-lg",
        isLarge ? "w-full max-w-3xl aspect-video" : "w-full max-w-56 aspect-video",
      )}
    >
      {isAgent && isLarge ? (
        <button
          type="button"
          className="absolute top-3 left-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/80"
          aria-label="More options"
        >
          <MoreHorizontalIcon className="size-4" />
        </button>
      ) : null}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "relative rounded-full overflow-hidden bg-white/5",
            isLarge ? "size-32 md:size-40" : "size-16",
            isThinking && "ring-2 ring-[#2d52ff] ring-offset-2 ring-offset-[#0d0f10] animate-pulse",
          )}
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      {subtitle && isLarge ? (
        <div className="absolute inset-x-0 bottom-14 px-3 sm:px-6">
          <p className="mx-auto max-w-lg rounded-lg bg-black/50 px-3 py-2 text-center text-xs text-white/90 backdrop-blur-sm sm:px-4 sm:text-sm">
            {subtitle}
          </p>
        </div>
      ) : null}

      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-white">{name}</span>
          {isMicMuted ? (
            <MicOffIcon className="size-3.5 shrink-0 text-white/70" />
          ) : null}
          {isCameraOff ? (
            <VideoOffIcon className="size-3.5 shrink-0 text-white/70" />
          ) : null}
        </div>
        <SignalBars />
      </div>
    </div>
  );
};
