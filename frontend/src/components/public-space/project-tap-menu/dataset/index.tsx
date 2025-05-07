import Image from 'next/image';
import { MoveRight } from 'lucide-react';

export default function Dataset() {
  return (
    <div className="space-y-5">
      <div>Here are the results of annotating using the model.</div>
      <div className="flex items-center justify-between gap-4">
        <div className="w-full">
          <Image
            src="/images/test-public-space-image.png"
            alt="before"
            width={0}
            height={0}
            sizes="100%"
            className="h-auto w-full"
          />
        </div>
        <MoveRight className="hidden md:block" />
        <div className="w-full">
          <Image
            src="/images/test-public-space-image.png"
            alt="after"
            width={0}
            height={0}
            sizes="100%"
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
