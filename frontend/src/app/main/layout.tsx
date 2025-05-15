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

  const hideSidebar = pathname.startsWith('/main/projects/');

  const iconSidebar = !/^\/main\/public-space\/\d+$/.test(pathname);

  const hasPadding =
    pathname !== '/main' && !/^\/main\/public-space\/\d+$/.test(pathname);

  return hideSidebar ? (
    <main>{children}</main>
  ) : (
    <SidebarProvider open={iconSidebar}>
      <AppSidebar />
      <main className={`w-screen ${hasPadding ? 'px-16 py-12' : ''}`}>
        {children}
      </main>
    </SidebarProvider>
  );
}
