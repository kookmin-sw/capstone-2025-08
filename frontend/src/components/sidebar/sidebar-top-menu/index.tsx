'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  History,
  FolderOpenDot,
  Earth,
  Settings,
  ChevronRight,
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

// Top Menu items.
const topItems = [
  // {
  //   title: 'Recents',
  //   url: '/main/recents',
  //   icon: History,
  // },
  {
    title: 'Projects',
    url: '/main/projects',
    icon: FolderOpenDot,
  },
  {
    title: 'Public Space',
    url: '/main/public-space',
    icon: Earth,
    items: [
      {
        title: 'Community',
        url: '/main/public-space/community',
      },
      {
        title: 'Downloaded Model',
        url: '/main/public-space/downloaded-model',
      },
      {
        title: 'Shared Model',
        url: '/main/public-space/shared-model',
      },
    ],
  },
  {
    title: 'Settings',
    url: '/main/settings',
    icon: Settings,
  },
];

export function TopMenu() {
  const pathname = usePathname(); // pathname과 선택된 메뉴의 url을 비교하여 메뉴 하이라이팅을 하기 위함
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platforms</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {topItems.map((item) =>
            item.items ? (
              <Collapsible
                key={item.title}
                asChild
                className="group/collapsible"
                defaultOpen={item.items.some(
                  (subItem) => pathname === subItem.url,
                )}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    asChild
                    onClick={() => router.push(item.items[0].url)}
                  >
                    <SidebarMenuButton
                      className={`cursor-pointer ${
                        pathname.startsWith(item.url)
                          ? 'bg-sidebar-accent-foreground text-sidebar-accent font-medium'
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto transition-transform duration-200 
                          group-data-[state=open]/collapsible:rotate-90`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`${
                              pathname === subItem.url
                                ? 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  // isActive={pathname === item.url}
                  className={`${
                    pathname === item.url
                      ? 'bg-sidebar-accent-foreground text-sidebar-accent font-medium'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
