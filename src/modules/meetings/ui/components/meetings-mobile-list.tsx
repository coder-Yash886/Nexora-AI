"use client";

import { format } from "date-fns";
import { ClockFadingIcon, CornerDownRightIcon } from "lucide-react";

import { GeneratedAvatar } from "@/components/generated-avtar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { MeetingGetMany } from "../../types";
import {
  formatDuration,
  statusColorMap,
  statusIconMap,
} from "./colums";

interface Props {
  items: MeetingGetMany;
  onSelect: (id: string) => void;
}

export const MeetingsMobileList = ({ items, onSelect }: Props) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2 md:hidden">
      {items.map((meeting) => {
        const StatusIcon =
          statusIconMap[meeting.status as keyof typeof statusIconMap];

        return (
          <button
            key={meeting.id}
            type="button"
            onClick={() => onSelect(meeting.id)}
            className="w-full rounded-lg border bg-white p-4 text-left shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold capitalize">{meeting.name}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CornerDownRightIcon className="size-3 shrink-0" />
                  <span className="truncate capitalize">{meeting.agent.name}</span>
                  <GeneratedAvatar
                    variant="botttsNeutral"
                    seed={meeting.agent.name}
                    className="size-4 shrink-0"
                  />
                  {meeting.startedAt ? (
                    <span className="shrink-0">
                      {format(meeting.startedAt, "MMM d")}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize [&>svg]:size-4",
                    statusColorMap[meeting.status as keyof typeof statusColorMap],
                  )}
                >
                  <StatusIcon
                    className={cn(
                      meeting.status === "processing" && "animate-spin",
                    )}
                  />
                  {meeting.status}
                </Badge>

                <Badge
                  variant="outline"
                  className="capitalize [&>svg]:size-4"
                >
                  <ClockFadingIcon className="text-blue-700" />
                  {meeting.duration
                    ? formatDuration(meeting.duration)
                    : "No duration"}
                </Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
