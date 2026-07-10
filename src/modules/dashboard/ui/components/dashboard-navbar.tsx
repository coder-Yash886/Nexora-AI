"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftClose, PanelLeftIcon, SearchCodeIcon } from "lucide-react"
import { DashboardCommand } from "./dashboard-command"
import { useEffect, useState } from "react"

export const DashboardNavbar = () => {

    const {state, toggleSidebar, isMobile} = useSidebar();
    const [commandOpen, setCommandOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if(e.key === 'k' && (e.metaKey || e.ctrlKey)){
                e.preventDefault();
                setCommandOpen((open) => !open);
            }
        }
        document.addEventListener("keydown",down)
        return () => document.removeEventListener("keydown",down)
    },[])

    return (

        <>

        <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />

        <nav className="flex items-center gap-x-2 border-b bg-background px-3 py-3 sm:px-4">
            <Button className="size-9" variant='outline' onClick={toggleSidebar}>
              {(state === "collapsed" || isMobile) 
              ? <PanelLeftIcon  className="size-4"/> : <PanelLeftClose className="size-4"/>
              }
            </Button>
            <Button
            className="h-9 min-w-0 flex-1 justify-start font-normal text-muted-foreground hover:text-muted-foreground sm:w-[240px] sm:flex-none"
            variant='outline'
            size='sm'
            onClick={() => setCommandOpen((open) => !open)}
            >
                <SearchCodeIcon/>
                <span className="truncate">Search</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 
                rouneded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">&#8984;</span>k
                </kbd>
            </Button>
        </nav>
        </>
    )
}