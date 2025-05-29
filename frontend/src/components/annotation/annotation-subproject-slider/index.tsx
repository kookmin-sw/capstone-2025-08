'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import ImageUploadModal from '@/components/projects/image-upload-modal';
import { SubProjectSummaryDto } from '@/generated-api';

interface Props {
  subProjects: SubProjectSummaryDto[];
  selected: SubProjectSummaryDto | null;
  onSelect: (sp: SubProjectSummaryDto) => void;
}

export default function AnnotationSubProjectSlider({
  subProjects,
  selected,
  onSelect,
}: Props) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="bg-muted absolute bottom-0 flex overflow-x-auto border-b border-t">
      {subProjects.map((sp) => {
        const isSelected = selected?.subProjectId === sp.subProjectId;
        return (
          <div
            key={sp.subProjectId}
            onClick={() => onSelect(sp)}
            className="relative h-[140px] w-[140px] min-w-[140px] cursor-pointer overflow-hidden border-r transition-all"
          >
            <Image
              src={sp.thumbnailUrl || ''}
              alt={`Thumbnail ${sp.subProjectId}`}
              fill
              sizes="140px"
              className={`object-cover transition-opacity ${
                isSelected ? '' : 'opacity-30'
              }`}
              priority={false}
            />
          </div>
        );
      })}

      <div
        onClick={() => setShowUploadModal(true)}
        className="text-muted-foreground hover:text-foreground flex h-[140px] w-[140px] min-w-[140px] cursor-pointer items-center justify-center border-r"
      >
        <Plus />
      </div>

      <ImageUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        mode="append"
        onAppendSubmit={(files) => {
          console.log('업로드된 파일:', files);
        }}
      />
    </div>
  );
}
