import Image from 'next/image';

export default function Description() {
  return (
    <div className="space-y-5">
      <div>This model was annotated using Hwang Ri-gon.</div>{' '}
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
    </div>
  );
}
