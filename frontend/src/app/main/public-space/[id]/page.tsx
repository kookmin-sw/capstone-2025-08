'use client';

import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dummyProjectDetail } from '@/data/dummy';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/common/page-title';
import TabMenu from '@/components/common/tab-menu';
import CommentBox from '@/components/public-space/comment-box';
import Performance from '@/components/public-space/project-tap-menu/performance';
import ProjectCard from '@/components/public-space/project-card';
import Description from '@/components/public-space/project-tap-menu/description';
import Dataset from '@/components/public-space/project-tap-menu/dataset';
import ProjectDownloadModal from '@/components/public-space/project-download-modal';
import { Toaster } from 'sonner';

export default function PublicSpaceDetailPage() {
  const router = useRouter();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const tabs = [
    {
      value: 'description',
      label: 'Description',
      content: <Description />,
    },
    {
      value: 'performance',
      label: 'Performance',
      content: <Performance />,
    },
    {
      value: 'dataSet',
      label: 'DataSet',
      content: <Dataset />,
    },
  ];

  return (
    <div>
      <div className="relative h-72 w-full">
        <Image
          fill
          src={dummyProjectDetail.coverImage}
          alt={dummyProjectDetail.title}
          className="object-cover"
        />
        <div className="bg-black/35 absolute inset-0" />
      </div>

      <Toaster position="bottom-right" />

      <div className="space-y-10 px-16 py-9">
        <div className="space-y-3">
          <PageTitle
            title={dummyProjectDetail.title}
            icon={<Download />}
            buttonName="Download"
            buttonSize="129px"
            onButtonClick={() => setShowDownloadModal(true)}
            showDivider={false}
          />
          <div className="text-muted-foreground text-sm">
            {dummyProjectDetail.author} | {dummyProjectDetail.date}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {dummyProjectDetail.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="w-full">
          <TabMenu tabs={tabs} bgColor="white" />
        </div>

        <CommentBox />

        <div className="my-8 border-b" />

        <div className="space-y-5">
          <div className="flex justify-between">
            <div className="text-xl font-semibold">Similar Projects</div>
            <div
              onClick={() => router.push(`/main/public-space/community`)}
              className="cursor-pointer underline"
            >
              See More
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {dummyProjectDetail.similarProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/main/public-space/${project.id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {showDownloadModal && (
        <ProjectDownloadModal
          open={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          title={dummyProjectDetail.title}
        />
      )}
    </div>
  );
}
