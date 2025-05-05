import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProjectDeleteModalProps {
  open: boolean;
  onClose: () => void;
  projectTitle: string;
  onClickDelete: () => void;
}

const ProjectDeleteModal: React.FC<ProjectDeleteModalProps> = ({
  open,
  onClose,
  projectTitle,
  onClickDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Delete</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mt-2 text-sm">
          Are you sure you want to delete the project{' '}
          <span className="font-semibold">&quot;{projectTitle}&quot;</span>?
          This action cannot be undone.
        </p>

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
            variant="destructive"
            onClick={() => {
              onClickDelete();
            }}
            className="min-w-[80px]"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDeleteModal;
