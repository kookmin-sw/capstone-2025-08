'use client';

import { Plus, Award, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/public-space/sub-title';
import Podium from '@/components/public-space/best-project';
import ProjectItem from '@/components/public-space/project-item';

export const dummyProjects = [
  {
    id: 'project-001',
    title: 'First project',
    author: 'hyeonjin Hwang',
    tags: ['Cell', 'DataSet', 'Comment'],
    thumbnail: '/images/test-public-space-image.png', // 업로드한 이미지 경로로 수정
    downloadCount: '13M',
  },
  {
    id: 'project-002',
    title: 'Tumor Annotation',
    author: 'Jisoo Kim',
    tags: ['Tumor', 'Pathology', 'Model'],
    thumbnail: '/images/test-public-space-image.png',
    downloadCount: '8.4M',
  },
  {
    id: 'project-003',
    title: 'Colon Tissue AI',
    author: 'Minho Lee',
    tags: ['Colon', 'AI Model', 'Dataset'],
    thumbnail: '/images/test-public-space-image.png',
    downloadCount: '5.2M',
  },
  {
    id: 'project-004',
    title: 'Lung Cell Detection',
    author: 'Yuna Park',
    tags: ['Lung', 'Detection', 'Inference'],
    thumbnail: '/images/test-public-space-image.png',
    downloadCount: '11M',
  },
  {
    id: 'project-005',
    title: 'Stain Normalization Study',
    author: 'Taewoo Ryu',
    tags: ['Stain', 'Normalization', 'Histopathology'],
    thumbnail: '/images/test-public-space-image.png',
    downloadCount: '9.7M',
  },
];

export default function PublicSpaceCommunityPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <PageTitle
        title="Public Space"
        icon={<Plus />}
        buttonName="Share My Project"
        buttonSize="154px"
        onButtonClick={() => router.push('/main/public-space/upload')}
        showDivider={false}
      />
      <div>검색바</div>
      <div className="my-8 border-b" />
      <div className="space-y-3">
        <SubTitle title="Best Project" icon={<Award />} />
        {/*<Podium />*/}
      </div>
      <div className="space-y-3">
        <SubTitle title="Recent Projects" icon={<Clock />} />
        <div className="grid grid-cols-4 gap-6">
          {dummyProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
