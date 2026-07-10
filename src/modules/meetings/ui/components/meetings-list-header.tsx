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
        <div className="flex w-full min-w-0 flex-col gap-y-4 px-4 py-4 md:px-8">
            <div className="flex flex-row items-center justify-between gap-2">
                    <h5 className="shrink-0 font-medium text-xl">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)} className="shrink-0">
                        <PlusIcon />
                        New Meeting
                    </Button>                  
            </div>
            <div className="grid w-full grid-cols-2 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center">
                <MeetingsSearchFilter/>
                <StatusFilter/>
                <div className="col-span-2 xl:col-span-1">
                <AgentIdFilter/>
                </div>
                {isAnyFilterModified && (
              <Button variant="outline" onClick={onClearFilters} className="col-span-2 w-full xl:col-span-1 xl:w-auto">
                <XCircleIcon className="size-4" />
                Clear
              </Button>
            )}
            </div>
        </div>
        </>
    )
}