'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@toast-ui/editor/dist/toastui-editor.css';
import PageTitle from '@/components/common/page-title';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadDropzone } from '@/components/common/upload-dropzone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import {
  GetProjectWithModelsResponseDto,
  PublicSpaceAPIApi,
} from '@/generated-api';

const MarkdownEditor = dynamic(
  () => import('@/components/shared-model/markdown-editor'),
  {
    ssr: false, // 에러로 인해 SSR 방지하기 위해
  },
);

export default function UploadPage() {
  const PublicSpaceApi = useMemo(() => new PublicSpaceAPIApi(), []);
  const router = useRouter();

  // title
  const [title, setTitle] = useState('');

  // dataSet
  const [openDataSet, setOpenDataSet] = useState<boolean>(false);
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [resultFiles, setResultFiles] = useState<File[]>([]);

  // description
  const [markdownContent, setMarkdownContent] = useState('');

  // tag
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagLimitExceeded, setIsTagLimitExceeded] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // 한국어, 중국어, 일본어 입력시 오류를 막기 위함
  const MAX_TAGS = 5;

  const [projectWithModels, setProjectWithModels] =
    useState<GetProjectWithModelsResponseDto | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await PublicSpaceApi.getProjectWithModels();
        setProjectWithModels(data);
      } catch (error) {
        console.error('Error fetching projects and models:', error);
        toast.error('Failed to load project and model list.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tagInput === '' && isTagLimitExceeded) {
      setIsTagLimitExceeded(false);
    }
  }, [tagInput, isTagLimitExceeded]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    if (tags.length >= MAX_TAGS) {
      setIsTagLimitExceeded(true); // 추가 시도에서 차단되었을 때만 경고 띄우기
      return;
    }

    setIsTagLimitExceeded(false); // 정상 추가면 경고 숨김

    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= 5 || tags.includes(tagInput.trim())) return;

      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (
      !selectedProjectId ||
      !selectedModelId ||
      tags.length === 0 ||
      !markdownContent ||
      !title ||
      originalFiles.length === 0 ||
      resultFiles.length === 0
    ) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    const formData = new FormData();

    // 1. requestDto → JSON Blob으로 감싸기
    const requestDto = {
      projectId: selectedProjectId,
      modelId: selectedModelId,
      title: title,
      description: markdownContent,
      tags: tags,
    };

    formData.append(
      'requestDto',
      new Blob([JSON.stringify(requestDto)], {
        type: 'application/json',
      }),
    );

    // 2. originalImages
    originalFiles.forEach((file) => {
      formData.append('originalImages', file);
    });

    // 3. resultImages
    resultFiles.forEach((file) => {
      formData.append('resultImages', file);
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public-space`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) throw new Error('업로드 실패');

      toast.success('Model has been successfully shared!');
      router.push('/main/public-space/shared-model');
    } catch (error) {
      console.error(error);
      toast.error('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-10">
      <PageTitle title="Public Space > Shared Model" />

      <Toaster position="bottom-right" />

      <div className="flex flex-col gap-1.5">
        <div className="text-xl">Project</div>
        <Select onValueChange={(value) => setSelectedProjectId(Number(value))}>
          <SelectTrigger className="w-1/2">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projectWithModels?.projects?.map((item) => (
              <SelectItem
                key={item.projectId}
                value={item.projectId?.toString() || ''}
              >
                {item.projectTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-xl">Model</div>
        <Select onValueChange={(value) => setSelectedModelId(Number(value))}>
          <SelectTrigger className="w-1/2">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {projectWithModels?.projects &&
              projectWithModels.projects
                .find((p) => p.projectId === selectedProjectId)
                ?.models?.map((model) => (
                  <SelectItem
                    key={model.modelId}
                    value={model.modelId?.toString() || ''}
                  >
                    {model.modelName}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-xl">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Input your project title"
          className="col-span-3 w-1/2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xl">Description</Label>
        <MarkdownEditor
          content={markdownContent}
          setContent={setMarkdownContent}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tag" className="flex items-center gap-2 text-xl">
          Tag{' '}
          <span className="text-muted-foreground text-sm">
            {tags.length}/{MAX_TAGS}
          </span>
        </Label>

        {isTagLimitExceeded && (
          <div className="text-sm text-red-500">
            You can add up to 5 tags only.
          </div>
        )}

        <Input
          id="tag"
          placeholder="Input your custom tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          className={`w-1/2 ${
            isTagLimitExceeded
              ? 'border-red-500 focus-visible:ring-red-500'
              : ''
          }`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-2.5"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-muted-foreground hover:text-foreground text-sm hover:cursor-pointer"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-4">
          <div className="text-xl">DataSet</div>
          <Switch onClick={() => setOpenDataSet(!openDataSet)} />
        </div>
        {openDataSet && (
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">
              Please put the original image on the left and the resulting image
              on the right.
            </div>
            <div className="flex w-full gap-4">
              <UploadDropzone
                onFilesSelected={(files) => setOriginalFiles(files)}
                contents={`Click to browse or drag and drop your image files`}
                showPreview={true}
              />
              <UploadDropzone
                onFilesSelected={(files) => setResultFiles(files)}
                contents={`Click to browse or drag and drop your image files`}
                showPreview={true}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/main/public-space/shared-model')}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleSubmit();
            // router.push('/main/public-space/shared-model');
          }}
          className="min-w-[80px]"
        >
          Share
        </Button>
      </div>
    </div>
  );
}
