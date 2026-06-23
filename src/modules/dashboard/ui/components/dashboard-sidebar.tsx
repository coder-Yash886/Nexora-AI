"use client";

import Link from "next/link"
import Image from "next/image";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";

const firstSection = [
    {
        icon: VideoIcon,
        label: "Meetings",
        herf: "/meetings",
    },
    {
        icon: BotIcon,
        label: "Agents",
        herf: "/agents",
    }
]

const secondSection = [
    {
        icon: StarIcon,
        label: "Upgrade",
        herf: "/upgrade",
    },
 
]

export const DashboardSidebar = () => {

    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href='/' className="flex items-center gap-2 px-2 pt-2">
                        <Image src="/logo.svg" height={36} width={36} alt="Meet.AI"/>
                        <p className="text-2xl font-semibold">Meet.AI</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                 <Separator className="opacity-10 text[#5D6B68]"/>
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((item) => (
                                <SidebarMenuItem  key={item.herf}>
                                    <SidebarMenuButton>
                                        <Link href={item.herf}>
                                            <item.icon className="size-5"/>
                                        <span className="text-sm font-medium tracking-tight">
                                            {item.label}
                                        </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
