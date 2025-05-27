'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageTitle from '@/components/common/page-title';
import Preferences from '@/components/settings/preferences';
import NameEditModal from '@/components/settings/name-edit-modal';
import { useUserStore } from '@/stores/use-user-store';
import { Camera } from 'lucide-react';
import { Configuration, ProfileAPIApi } from '@/generated-api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [showNameEditModal, setShowNameEditModal] = useState(false);

  const userInfo = useUserStore((state) => state.user);

  if (!userInfo) {
    return;
  }

  const token = localStorage.getItem('accessToken');
  const config = new Configuration({ accessToken: () => token || '' });
  const profileApi = new ProfileAPIApi(config);

  async function handleProfileImageUpload(file: File) {
    try {
      await profileApi.updateProfileImage({ image: file });

      const updatedUser = await profileApi.getUserSettings();
      useUserStore.getState().setUser(updatedUser);

      toast.success('Profile image updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile image. Please try again.');
    }
  }
  const getNotificationEnabled = (type: string) =>
    userInfo.notificationSettings?.find((n) => n.type === type)?.enabled ??
    false;

  return (
    <div>
      <PageTitle title={'Settings'} />

      <Toaster position="bottom-right" />

      <div className="w-1/2 space-y-10">
        <div>
          <h3 className="mb-4 text-lg font-medium">Profile</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="size-36 border-2">
                <AvatarImage
                  src={
                    userInfo?.profileImagePath || '/images/default-profile.png'
                  }
                />
                <AvatarFallback>
                  {userInfo?.name?.slice(0, 2) || 'US'}
                </AvatarFallback>
              </Avatar>

              <input
                id="upload-profile-image"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleProfileImageUpload(file);
                  }
                }}
              />

              <label
                htmlFor="upload-profile-image"
                className="absolute bottom-1 right-1 cursor-pointer"
              >
                <div className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 size-9 flex items-center justify-center rounded-full p-1">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </label>
            </div>

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
              file_upload_completed: getNotificationEnabled(
                'File Upload Completed',
              ),
              model_train_completed: getNotificationEnabled(
                'Model Train Completed',
              ),
              model_run_completed: getNotificationEnabled(
                'Model Run Completed',
              ),
              new_comments: getNotificationEnabled('New Comments'),
            }}
            api={profileApi}
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
          defaultName={userInfo.name || ''}
          api={profileApi}
        />
      )}
    </div>
  );
}
