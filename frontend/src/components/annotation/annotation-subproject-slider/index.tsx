'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SubProject } from '@/types/project-schema';
import { Plus } from 'lucide-react';
import ImageUploadModal from '@/components/projects/image-upload-modal';

interface Props {
  subProjects: SubProject[];
  selected: SubProject | null;
  onSelect: (sp: SubProject) => void;
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
        const isSelected = selected?.id === sp.id;
        return (
          <div
            key={sp.id}
            onClick={() => onSelect(sp)}
            className="relative h-[140px] w-[140px] min-w-[140px] cursor-pointer overflow-hidden border-r transition-all"
          >
            <Image
              src={sp.thumbnail}
              alt={`Thumbnail ${sp.id}`}
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
