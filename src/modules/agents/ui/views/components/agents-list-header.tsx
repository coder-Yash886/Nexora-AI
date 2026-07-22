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
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4 min-w-0">
            <div className="flex items-center justify-between gap-3">
                    <h5 className="font-medium text-xl truncate">My Agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)} className="shrink-0">
                        <PlusIcon />
                        New Agent
                    </Button>
            </div>
            <div className="flex flex-col gap-2 w-full min-w-0 sm:flex-row sm:items-center">
                <AgentsSearchFilter
                />
                {isAnyFilterModified && (
                    <Button variant="outline" size="sm" onClick={onClearFilter} className="w-full sm:w-auto">
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