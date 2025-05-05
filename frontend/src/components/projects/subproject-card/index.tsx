'use client';

import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export default function SubProjectCard({
  name,
  size,
  status,
  thumbnailUrl,
}: {
  name: string;
  size: string;
  status: UploadStatus;
  thumbnailUrl?: string;
}) {
  const renderStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="rounded-full bg-gray-100 p-1">
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
        );
      case 'uploading':
        return (
          <div className="animate-spin rounded-full bg-blue-100 p-1">
            <Loader2 className="h-4 w-4 text-blue-500" />
          </div>
        );
      case 'done':
        return (
          <div className="rounded-full bg-green-100 p-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="rounded-full bg-red-100 p-1">
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
        );
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* 썸네일 */}
      <div className="bg-muted relative flex h-48 items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground text-sm">No Thumbnail</div>
        )}

        {/* 상태 아이콘 */}
        <div className="absolute right-2 top-2">{renderStatusIcon()}</div>
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-muted-foreground text-xs">{size}</span>
        </div>
        {/* 옵션 버튼 자리 */}
        <div className="text-muted-foreground">⋯</div>
      </div>
    </div>
  );
}
