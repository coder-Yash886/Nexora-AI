"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, XCircleIcon} from "lucide-react"
import { NewMeetingDialog } from "./new-meeting-dialog"
import { useState } from "react"
import { MeetingsSearchFilter } from "./meetings-search-filter"
import { StatusFilter } from "./status-filter"
import { AgentIdFilter } from "./agent-id-filter"
import { DEFAULT_PAGE } from "@/constants"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"


export const MeetingsListHeader = () => {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [filters, setFilters] = useMeetingsFilters();

    const isAnyFilterModified =
    !!filters.status || !!filters.search || !!filters.agentId;


    const onClearFilters = () => {
        setFilters({
          status: null,
          agentId: "",
          search: "",
          page: DEFAULT_PAGE,
        });
      };

    return (
        <>
        <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4 min-w-0 w-full max-w-full">
            <div className="flex items-center justify-between gap-3">
                    <h5 className="font-medium text-xl truncate">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)} className="shrink-0">
                        <PlusIcon />
                        New Meeting
                    </Button>                  
            </div>
            {/* Mobile: stack filters. Desktop: row */}
            <div className="grid grid-cols-1 gap-2 w-full min-w-0 md:flex md:flex-wrap md:items-center">
                <div className="w-full md:w-auto min-w-0">
                  <MeetingsSearchFilter/>
                </div>
                <div className="w-full md:w-auto min-w-0">
                  <StatusFilter/>
                </div>
                <div className="w-full md:w-auto min-w-0">
                  <AgentIdFilter/>
                </div>
                {isAnyFilterModified && (
              <Button variant="outline" onClick={onClearFilters} className="w-full md:w-auto shrink-0">
                <XCircleIcon className="size-4" />
                Clear
              </Button>
            )}
            </div>
        </div>
        </>
    )
}
