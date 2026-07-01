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
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        New Meeting
                    </Button>                  
            </div>
            <div className="flex items-center gap-2">
                <MeetingsSearchFilter/>
                <StatusFilter/>
                <AgentIdFilter/>
                {isAnyFilterModified && (
              <Button variant="outline" onClick={onClearFilters}>
                <XCircleIcon className="size-4" />
                Clear
              </Button>
            )}
            </div>
        </div>
        </>
    )
}