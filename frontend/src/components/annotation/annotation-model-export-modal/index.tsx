import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AnnotationModelExportModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (modelName: string) => void;
}

const AnnotationModelExportModal: React.FC<AnnotationModelExportModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [modelName, setModelName] = useState('');

  const handleSave = () => {
    if (modelName.trim()) {
      onSave(modelName.trim());
      setModelName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setModelName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Model</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter a name to export this model. <br />
          You can reuse this model in other projects to save time and effort.{' '}
          <br />
          Optionally, you can share this model in the{' '}
          <span className="font-semibold">Public Space</span> to help others
          benefit from your work.
        </p>
        <Input
          placeholder="Enter model name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="mt-2"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="min-w-[80px]">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationModelExportModal;
