'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
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

const MarkdownEditor = dynamic(
  () => import('@/components/shared-model/markdown-editor'),
  {
    ssr: false, // 에러로 인해 SSR 방지하기 위해
  },
);

export default function UploadPage() {
  const router = useRouter();
  const [openDataSet, setOpenDataSet] = useState<boolean>(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagLimitExceeded, setIsTagLimitExceeded] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // 한국어, 중국어, 일본어 입력시 오류를 막기 위함

  const MAX_TAGS = 5;

  console.log('markdownContent', markdownContent);

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

  // const handleSubmit = () => {
  //   const data = {
  //     title,
  //     markdownContent,
  //     tags,
  //     datasetFiles, // 파일은 FileList 또는 URL로
  //     projectId,
  //     modelId,
  //   };
  //
  //   console.log('제출할 데이터:', data);
  //   // 🔜 API 호출 또는 저장 처리
  // };

  return (
    <div className="space-y-10">
      <PageTitle title="Public Space > Shared Model" />

      <Toaster position="bottom-right" />

      <div className="flex flex-col gap-1.5">
        <div className="text-xl">Project</div>
        <Select>
          <SelectTrigger className="w-1/2">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-xl">Model</div>
        <Select>
          <SelectTrigger className="w-1/2">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-xl">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Input your project title"
          defaultValue="default value"
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
                onFilesSelected={() => console.log('gkdlgkdl')}
                contents={`Click to browse or drag and drop your image files`}
                showPreview={true}
              />
              <UploadDropzone
                onFilesSelected={() => console.log('gkdlgkdl')}
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
            toast('Model has been successfully shared!');
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
