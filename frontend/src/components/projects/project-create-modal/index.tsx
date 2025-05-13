'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ProjectCreateModalProps {
  open: boolean;
  onClose: () => void;
  onNext: (info: { title: string; description: string }) => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  open,
  onClose,
  onNext,
}) => {
  // TODO: 모델 목록 연결
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modelType, setModelType] = useState('Cell');
  const [modelName, setModelName] = useState('none');

  const isFormValid =
    title.trim() !== '' &&
    description.trim() !== '' &&
    modelType !== '' &&
    modelName !== 'null';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input
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

          <div className="flex flex-col gap-2">
            <Label>Model</Label>
            <div className="flex gap-2">
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cell">Cell</SelectItem>
                  <SelectItem value="Tissue">Tissue</SelectItem>
                  <SelectItem value="Multi">Multi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resnet50">ResNet-50</SelectItem>
                  <SelectItem value="unet">UNet</SelectItem>
                  <SelectItem value="none">No Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="min-w-[80px]">
            Cancel
          </Button>
          <Button
            onClick={() => onNext({ title, description })}
            className="min-w-[80px]"
            disabled={!isFormValid}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal;
