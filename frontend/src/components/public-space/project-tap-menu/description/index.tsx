'use client';

import Image from 'next/image';

interface DescriptionProps {
  content: string;
}

export default function Description({ content }: DescriptionProps) {
  return (
    <div className="space-y-5">
      <div>{content}</div>
    </div>
  );
}
