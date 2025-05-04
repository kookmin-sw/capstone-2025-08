import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SubProjectDeleteModalProps {
  open: boolean;
  onClose: () => void;
  subProjectFileName: string;
  onClickDelete: () => void;
}

const SubProjectDeleteModal: React.FC<SubProjectDeleteModalProps> = ({
  open,
  onClose,
  subProjectFileName,
  onClickDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SVS File Delete</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mt-2 text-sm">
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            &quot;{subProjectFileName}&quot;
          </span>
          ? This action is irreversible and will permanently remove the file.
        </p>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
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

export default SubProjectDeleteModal;
