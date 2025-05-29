'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRef } from 'react';
import { useUserStore } from '@/stores/use-user-store';
import { ProfileAPIApi, UpdateUserNameRequestDto } from '@/generated-api';

interface NameEditModalProps {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  api: ProfileAPIApi;
}

export default function NameEditModal({
  open,
  onClose,
  defaultName,
  api,
}: NameEditModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNameUpdate = async () => {
    const newName = inputRef.current?.value?.trim();
    if (!newName) {
      toast.error('Name cannot be empty.');
      return;
    }

    try {
      const body: UpdateUserNameRequestDto = { name: newName };
      await api.updateUserName({ updateUserNameRequestDto: body });

      const updatedUser = await api.getUserSettings();
      useUserStore.getState().setUser(updatedUser);

      toast.success('Name updated successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update name. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
          <DialogDescription>Set your new display name.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={defaultName} ref={inputRef} />
        </div>

        <DialogFooter>
          <Button onClick={handleNameUpdate}>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
