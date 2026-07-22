import {
    CircleXIcon,
    CircleCheckIcon,
    VideoIcon,
    LoaderIcon,
    ClockArrowUpIcon,
} from "lucide-react"

import { CommandSelect } from "@/components/ui/command-select"
import { MeetingStatus } from "../../types"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"

const options = [
    {
        id: MeetingStatus.Upcoming,
        value: MeetingStatus.Upcoming,
        keywords: [MeetingStatus.Upcoming],
        children: (
            <div className="flex items-center gap-x-2 capitalize [&>svg]:size-4 shrink-0">
                <ClockArrowUpIcon />
                <span className="truncate">{MeetingStatus.Upcoming}</span>
            </div>
        )
    },

     {
        id: MeetingStatus.Completed,
        value: MeetingStatus.Completed,
        keywords: [MeetingStatus.Completed],
        children: (
            <div className="flex items-center gap-x-2 capitalize [&>svg]:size-4 shrink-0">
                <CircleCheckIcon />
                <span className="truncate">{MeetingStatus.Completed}</span>
            </div>
        )
    },

    {
        id: MeetingStatus.Active,
        value: MeetingStatus.Active,
        keywords: [MeetingStatus.Active],
        children: (
            <div className="flex items-center gap-x-2 capitalize [&>svg]:size-4 shrink-0">
                <VideoIcon />
                <span className="truncate">{MeetingStatus.Active}</span>
            </div>
        )
    },
    
    {
        id: MeetingStatus.Cancelled,
        value: MeetingStatus.Cancelled,
        keywords: [MeetingStatus.Cancelled],
        children: (
            <div className="flex items-center gap-x-2 capitalize [&>svg]:size-4 shrink-0">
                <CircleXIcon />
                <span className="truncate">{MeetingStatus.Cancelled}</span>
            </div>
        )
    },

      {
        id: MeetingStatus.Processing,
        value: MeetingStatus.Processing,
        keywords: [MeetingStatus.Processing],
        children: (
            <div className="flex items-center gap-x-2 capitalize [&>svg]:size-4 shrink-0">
                <LoaderIcon />
                <span className="truncate">{MeetingStatus.Processing}</span>
            </div>
        )
    },
]


export const StatusFilter = () => {
    const [filters, setFilters] = useMeetingsFilters();

    return (
        <CommandSelect
            placeholder="Status"
            className="h-9 w-full md:w-[160px] shrink-0 bg-white shadow-xs"
            options={options}
            onSelect={(value) => setFilters({status: value as MeetingStatus})}
            value={filters.status ?? ""}
        />
    )

}