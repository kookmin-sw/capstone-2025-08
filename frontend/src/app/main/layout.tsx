'use client';

import React from 'react';
import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // /main/projects/annotation/ 경로일 경우 사이드바를 숨김
  const hideSidebar = pathname.startsWith('/main/projects/annotation/');

  return hideSidebar ? (
    <main>{children}</main>
  ) : (
    <SidebarProvider open>
      <AppSidebar />
      <main className="w-screen px-16 py-12">{children}</main>
    </SidebarProvider>
  );
}
