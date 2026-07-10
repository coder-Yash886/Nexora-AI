"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, XCircle } from "lucide-react"
import { NewAgentDialog } from "./new-agent-dialog"
import { useState } from "react"
import { useAgentsFilters } from "@/modules/agents/hooks/use-agents-filters"
import { AgentsSearchFilter } from "./agents-search-filter"
import { DEFAULT_PAGE } from "@/constants"

export const AgentsListHeader = () => {
    const [filters, setFilters] = useAgentsFilters();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const isAnyFilterModified = !!filters.search

    const onClearFilter = () => {
        setFilters({
            search: "",
            page: DEFAULT_PAGE,
        })
    }

    return (
        <>
        <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        <div className="flex w-full min-w-0 flex-col gap-y-4 px-4 py-4 md:px-8">
            <div className="flex flex-row items-center justify-between gap-2">
                    <h5 className="shrink-0 font-medium text-xl">My Agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)} className="shrink-0">
                        <PlusIcon />
                        New Agent
                    </Button>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <AgentsSearchFilter />
                {isAnyFilterModified && (
                    <Button variant="outline" size="sm" onClick={onClearFilter} className="w-full xl:w-auto">
                        <XCircle
                         />
                        Clear
                    </Button>
                )}
            </div>
        </div>
        </>
    )
}