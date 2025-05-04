import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ProjectEditModalProps {
  open: boolean;
  onClose: () => void;
  onClickEdit: (updated: { title: string; description: string }) => void;
  initialTitle: string;
  initialDescription: string;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  open,
  onClose,
  onClickEdit,
  initialTitle,
  initialDescription,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input
              autoFocus={false}
              placeholder="Input your project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Input your project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
            }}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onClickEdit({ title, description });
            }}
            className="min-w-[80px]"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditModal;
