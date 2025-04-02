'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bell, FileQuestion, ShieldCheck } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// Bottom Menu items.
const bottomItems = [
  {
    title: 'Notifications',
    url: '/notifications',
    icon: Bell,
  },
  {
    title: 'Docs & Help',
    url: '/main/docs-help',
    icon: FileQuestion,
  },
  {
    title: 'Policies & Terms',
    url: '/main/policies-terms',
    icon: ShieldCheck,
  },
];

export function BottomMenu() {
  const pathname = usePathname(); // pathname과 선택된 메뉴의 url을 비교하여 메뉴 하이라이팅을 하기 위함
  const [clickNotifications, setClickNotifications] = useState(false);

  // notifications 클릭 시, 알림 모달창을 띄우는 함수
  const handleNotificationClick = () => {
    console.log('알림 모달창');
    setClickNotifications((prev) => !prev); // 현재 상태를 반전시킴 (true ↔ false)
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Supported</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.title === 'Notifications' ? (
                <SidebarMenuButton
                  onClick={handleNotificationClick} // 클릭 시, 알림 모달창 띄우기
                  className={`${
                    clickNotifications
                      ? 'bg-sidebar-accent-foreground text-sidebar-accent font-medium'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={`${
                    pathname === item.url
                      ? 'bg-sidebar-accent-foreground text-sidebar-accent font-medium'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
