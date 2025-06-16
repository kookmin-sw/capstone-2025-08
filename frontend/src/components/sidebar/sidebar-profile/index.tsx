'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useUserStore } from '@/stores/use-user-store';

export function Profile() {
  const user = useUserStore((state) => state.user);

  if (!user) return null; // 로그인 안 된 경우

  return (
    <div className="box-border flex items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
      {/* 프로필 이미지 */}
      <Image
        width={32}
        height={32}
        src={user.profileImagePath || '/images/default-profile.png'}
        alt={`${user.name} profile image`}
        priority
        className="rounded-full object-cover"
        unoptimized
      />

      {/* 프로필 info(이름, email) */}
      <div className="w-full group-data-[collapsible=icon]:hidden">
        <div className="text-xs font-semibold">{user.name}</div>
        <div className="text-xs">{user.email}</div>
      </div>

      {/* 로그아웃 버튼 */}
      <div
        className="hover:bg-muted flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md group-data-[collapsible=icon]:hidden"
        // onClick={() => console.log('로그아웃 모달 띄우기')}
      >
        <LogOut size={16} color="#6B7280" />
      </div>
    </div>
  );
}
