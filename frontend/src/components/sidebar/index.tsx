'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

import { TopMenu } from '@/components/sidebar/sidebar-top-menu';
import { BottomMenu } from '@/components/sidebar/sidebar-bottom-menu';
import { Profile } from '@/components/sidebar/sidebar-profile';

export function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar collapsible="icon">
      {/* 사이드바 헤더 -> 로고 */}
      <SidebarHeader className="items-center">
        <Image
          width={180}
          height={128}
          src="/images/pathos-logo.png"
          alt="pathos logo"
          priority
          className="cursor-pointer"
          onClick={() => router.push('/main')} // pathos 로고 클릭 시 메인으로 이동
        />
      </SidebarHeader>

      {/* 사이드바 컨텐츠 -> 메뉴 리스트 */}
      <SidebarContent className="justify-between">
        <TopMenu />
        <BottomMenu />
      </SidebarContent>

      {/* 분리를 위한 선 */}
      <Separator className="shrink px-2" />

      {/* 사이드바 푸터 -> 프로필 */}
      <SidebarFooter>
        <Profile />
      </SidebarFooter>
    </Sidebar>
  );
}
