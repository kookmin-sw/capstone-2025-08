'use client';

import React, { useEffect, useState } from 'react';
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
import {
  CreateProjectRequestDtoModelTypeEnum,
  GetProjectsResponseModelsDto,
  GetProjectsResponseModelsDtoModelTypeEnum,
} from '@/generated-api';

interface ProjectCreateModalProps {
  models: GetProjectsResponseModelsDto[];
  open: boolean;
  onClose: () => void;
  onNext: (info: {
    title: string;
    description: string;
    modelId: number | undefined;
    modelType: CreateProjectRequestDtoModelTypeEnum;
  }) => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  models,
  open,
  onClose,
  onNext,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modelType, setModelType] =
    useState<GetProjectsResponseModelsDtoModelTypeEnum>('CELL');
  const [modelName, setModelName] = useState('none');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setModelType('CELL');
      setModelName('none');
    }
  }, [open]);

  const isFormValid = title.trim() !== '' && description.trim() !== '';

  const handleNext = () => {
    const selectedModel = models.find((m) => m.modelName === modelName);
    const modelId = selectedModel?.modelId;

    onNext({
      title,
      description,
      modelId: modelId ?? undefined,
      modelType: modelType as CreateProjectRequestDtoModelTypeEnum,
    });
  };

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
              <Select
                value={modelType}
                onValueChange={(value) => {
                  setModelType(
                    value as GetProjectsResponseModelsDtoModelTypeEnum,
                  );
                  setModelName('none'); // 타입 변경 시 모델명 초기화
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(GetProjectsResponseModelsDtoModelTypeEnum).map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() +
                          type.slice(1).toLowerCase()}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Selected</SelectItem>
                  {models.length > 0 &&
                    models.map((model) => (
                      <SelectItem
                        key={model.modelId}
                        value={model.modelName || ''}
                        disabled={model.modelType !== modelType}
                      >
                        {model.modelName}
                      </SelectItem>
                    ))}
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
            onClick={handleNext}
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
