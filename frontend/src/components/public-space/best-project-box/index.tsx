'use client';

import Image from 'next/image';
import WaveBackground from '@/components/public-space/best-project-box/wave-background';
import { useRouter } from 'next/navigation';
import { BestProjectDto } from '@/generated-api';
import { formatNumberToAbbreviation } from '@/utils/number-format-util';

interface BestProjectProps {
  projects: BestProjectDto[];
}

export default function BestProjectBox({ projects }: BestProjectProps) {
  const router = useRouter();
  const order = [1, 0, 2]; // 2등, 1등, 3등 순서

  const iconPaths = [
    '/icons/2nd-icon.svg',
    '/icons/1st-icon.svg',
    '/icons/3rd-icon.svg',
  ];

  const sizes = ['h-64', 'h-72', 'h-56'];

  return (
    <div className="relative flex h-[500px] w-full items-end justify-center">
      <WaveBackground />
      <div className="absolute bottom-0 z-10 flex w-full items-end justify-center gap-20">
        {order.map((rankIndex, visualIndex) => {
          const project = projects[rankIndex];
          if (!project) return null;

          return (
            <div
              key={project.sharedProjectId}
              onClick={() =>
                router.push(`/main/public-space/${project.sharedProjectId}`)
              }
              className="flex cursor-pointer flex-col items-center gap-9"
            >
              {/* 프로필 이미지 */}
              <div className="relative h-36 w-36">
                <Image
                  src={
                    project.profileImageUrl ?? '/images/test-profile-image.png'
                  }
                  alt={project.authorName ?? ''}
                  fill
                  className="rounded-full border-4 border-white object-cover shadow-md"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 font-bold shadow">
                  {project.authorName}
                </div>
              </div>

              {/* 포디움 박스 */}
              <div
                className={`from-primary to-primary-800 flex w-40 flex-col items-center gap-5 rounded-t-lg bg-gradient-to-b py-6 text-white ${sizes[visualIndex]}`}
              >
                <Image
                  src={iconPaths[visualIndex]}
                  alt={`${visualIndex + 1}등 아이콘`}
                  width={80}
                  height={80}
                />

                <div className="flex flex-col items-center">
                  <div className="text-6xl font-bold">
                    {formatNumberToAbbreviation(project.downloadCount ?? 0)}
                  </div>
                  <div className="text-sm">{project.title}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
