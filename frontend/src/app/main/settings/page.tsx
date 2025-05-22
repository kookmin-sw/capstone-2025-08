'use client';

import { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageTitle from '@/components/common/page-title';
import Preferences from '@/components/settings/preferences';
import NameEditModal from '@/components/settings/name-edit-modal';
import { GetUserSettingsResponseDto, ProfileAPIApi } from '@/generated-api';

export default function SettingsPage() {
  const ProfileApi = useMemo(() => new ProfileAPIApi(), []);
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [userInfo, setUserInfo] = useState<GetUserSettingsResponseDto>({});
  const notificationMap = useMemo(() => {
    if (!userInfo.notificationSettings) return {};

    const map: Record<string, boolean> = {};
    userInfo.notificationSettings.forEach((s) => {
      const key = s.type!.toLowerCase().replace(/ /g, '_');
      if (s.enabled) {
        map[key] = s.enabled;
      }
    });
    return map;
  }, [userInfo.notificationSettings]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfoRes = await ProfileApi.getUserSettings();
        setUserInfo(userInfoRes);
        console.log('userInfo: ', userInfoRes);
      } catch (error) {
        console.error('유저 정보를 불러오는 중 오류 발생:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <PageTitle title={'Settings'} />

      <Toaster position="bottom-right" />

      <div className="w-1/2 space-y-10">
        <div>
          <h3 className="mb-4 text-lg font-medium">Profile</h3>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="size-36">
              <AvatarImage src={userInfo.profileImagePath} />
              <AvatarFallback></AvatarFallback>
            </Avatar>

            <div className="w-full rounded-lg border">
              <div className="flex h-14 items-center justify-between px-4 py-3">
                Name: {userInfo.name}
                <Button onClick={() => setShowNameEditModal(true)}>Edit</Button>
              </div>
              <div className="bg-border h-px" />
              <div className="flex h-14 items-center px-4 py-3">
                Email: {userInfo.email}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Preferences</h3>
          <Preferences
            defaultValues={{
              file_upload_completed: notificationMap.file_upload_completed,
              model_train_completed: notificationMap.model_train_completed,
              model_run_completed: notificationMap.model_run_completed,
              new_comments: notificationMap.new_comments,
            }}
          />
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Account Management</h3>
          <div className="w-full rounded-lg border">
            <button
              onClick={() => console.log('Logged out')}
              className="h-14 w-full cursor-pointer rounded-t-lg px-4 py-3 text-blue-600 hover:bg-blue-50"
            >
              Log out of all devices
            </button>
            <div className="bg-border h-px" />
            <button
              onClick={() => console.log('Account deleted')}
              className="h-14 w-full cursor-pointer rounded-b-lg px-4 py-3 text-red-600 hover:bg-red-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showNameEditModal && (
        <NameEditModal
          open={showNameEditModal}
          onClose={() => setShowNameEditModal(false)}
          defaultName={userInfo.name ?? ''}
        />
      )}
    </div>
  );
}
