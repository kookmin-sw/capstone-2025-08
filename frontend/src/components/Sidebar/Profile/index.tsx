'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';

// profile dummy
const profile = {
  imageUrl: '/images/test-profile-image.png',
  name: 'hyeonjin Hwang',
  email: 'jjini6530@kookmin.ac.kr',
};

export function Profile() {
  return (
    <div className="box-border flex items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
      {/* 프로필 이미지 */}
      <Image
        width={32}
        height={32}
        src={profile.imageUrl}
        alt={`${profile.name} profile image`}
        className="rounded-full"
      />

      {/* 프로필 info(이름, email) */}
      <div className="w-full group-data-[collapsible=icon]:hidden">
        <div className="text-sm font-semibold">{profile.name}</div>
        <div className="text-xs">{profile.email}</div>
      </div>

      {/* 로그아웃 버튼 */}
      <div
        className="hover:bg-muted flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md group-data-[collapsible=icon]:hidden"
        onClick={() => console.log('로그아웃 모달 띄우기')}
      >
        <LogOut size={16} color="#6B7280" />
      </div>
    </div>
  );
}
