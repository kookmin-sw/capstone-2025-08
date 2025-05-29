'use client';

import Image from 'next/image';
import { MoveRight } from 'lucide-react';

interface DatasetProps {
  originalImage: string[];
  annotatedImage: string[];
}

export default function Dataset({
  originalImage,
  annotatedImage,
}: DatasetProps) {
  return (
    <div className="space-y-5">
      <div>Here are the results of annotating using the model.</div>
      {originalImage?.map((original, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="w-full">
            <Image
              src={original}
              alt={`before-${index}`}
              width={0}
              height={0}
              sizes="100%"
              className="h-auto w-full"
            />
          </div>
          <MoveRight className="hidden md:block" />
          <div className="w-full">
            <Image
              src={annotatedImage[index]}
              alt={`after-${index}`}
              width={0}
              height={0}
              sizes="100%"
              className="h-auto w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
