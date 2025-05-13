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

interface NameEditModalProps {
  open: boolean;
  onClose: () => void;
  defaultName: string;
}

export default function NameEditModal({
  open,
  onClose,
  defaultName,
}: NameEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
          <DialogDescription>Please set your display name.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" defaultValue={defaultName} className="col-span-3" />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              onClose();
              toast('Name has been successfully edited!');
            }}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
