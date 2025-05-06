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

interface ProjectDownloadModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function ProjectDownloadModal({
  open,
  onClose,
  title,
}: ProjectDownloadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Model</DialogTitle>
          <DialogDescription>
            Please set the name of the downloaded model.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" defaultValue={title} className="col-span-3" />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              console.log('다운로드 성공');
              onClose();
            }}
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
