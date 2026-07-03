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
        <main className='flex flex-1 flex-col min-w-0 h-screen bg-muted overflow-auto'>
          <DashboardNavbar />
      {children}
      </main>
    </SidebarProvider>
  )
}

export default layout
