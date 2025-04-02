import React from 'react';
import { AppSidebar } from '@/components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* open == false일 때 icon 버전, open == true일 때 일반 버전 사이드바 */}
      <SidebarProvider open={true}>
        <AppSidebar />
        <main>{children}</main>
      </SidebarProvider>
    </div>
  );
}
