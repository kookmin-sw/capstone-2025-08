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

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  type?: 'shared project' | 'model';
}

export default function DeleteModal({
  open,
  onClose,
  onDelete,
  type = 'shared project',
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your{' '}
            {type} and remove its data from our servers.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            onClick={() => {
              onDelete();
              onClose();
              toast(`${type} has been successfully deleted!`);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
