interface Props {
    children: React.ReactNode;
}

import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardNavbar } from '@/modules/dashboard/ui/components/dashboard-navbar';
import { DashboardSidebar } from '@/modules/dashboard/ui/components/dashboard-sidebar';
import React from 'react'

const layout = ({ children } : Props) => {
  return (
    <SidebarProvider>
        <DashboardSidebar/>
        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-muted">
          <DashboardNavbar />
          <div className="min-w-0 w-full max-w-full flex-1">{children}</div>
        </main>
    </SidebarProvider>
  )
}

export default layout
