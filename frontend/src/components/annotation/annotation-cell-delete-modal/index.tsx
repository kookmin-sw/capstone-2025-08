import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AnnotationCellDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const AnnotationCellDeleteModal: React.FC<AnnotationCellDeleteModalProps> = ({
  open,
  onClose,
  onConfirmDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Cell Polygon</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mt-2 text-sm">
          Are you sure you want to delete{' '}
          <span className="font-semibold">this polygon</span>? This action
          cannot be undone.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="min-w-[80px]">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            className="min-w-[80px]"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationCellDeleteModal;
