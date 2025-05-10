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

interface DownloadModelEditModalProps {
  open: boolean;
  onClose: () => void;
  modelTitle: string;
  author: string;
  downloadedDate: string;
}

export default function DownloadModelEditModal({
  open,
  onClose,
  modelTitle,
  author,
  downloadedDate,
}: DownloadModelEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Model Info</DialogTitle>
          <DialogDescription>
            Make changes to your model Info here. Click save when you&#39;re
            done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex gap-5">
            <Label htmlFor="name" className="text-right">
              Model
            </Label>
            <Input id="name" defaultValue={modelTitle} className="col-span-3" />
          </div>

          <div className="flex gap-5">
            <Label htmlFor="name" className="text-right">
              Author
            </Label>
            <div className="text-sm">{author}</div>
          </div>

          <div className="flex gap-5">
            <Label htmlFor="name" className="text-right">
              Downloaded Date
            </Label>
            <div className="text-sm">{downloadedDate}</div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              onClose();
              toast('Model Info has been successfully edited!');
            }}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
