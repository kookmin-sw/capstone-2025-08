'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { dummyProjects } from '@/data/dummy';
import { Project } from '@/types/project-schema';

// 프로젝트에 modelType을 추가한 타입 (필요한 경우 확장)
type ProjectWithModel = Project & {
  modelType?: string;
};

const AnnotationViewer = dynamic(
  () => import('@/components/annotation/annotation-viewer'),
  {
    ssr: false,
  },
) as unknown as React.FC<{ annotations: any[]; modelType: string }>;

export default function Annotation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null,
  );
  const [project, setProject] = useState<ProjectWithModel | null>(null);

  // URL 파라미터의 id와 일치하는 프로젝트를 dummyProjects 배열에서 찾고, modelType을 추가합니다.
  useEffect(() => {
    params.then((p) => {
      setResolvedParams(p);
      const found = dummyProjects.find((proj) => proj.id === Number(p.id));
      if (found) {
        const extendedProject: ProjectWithModel = {
          ...found,
          modelType: 'MULTI', // 필요에 따라 다른 값으로 설정 가능
        };
        setProject(extendedProject);
      } else {
        console.error('해당 id의 데이터가 없습니다.');
      }
    });
  }, [params]);

  useEffect(() => {
    console.log('Resolved Params:', resolvedParams);
  }, [resolvedParams]);

  return (
    <div>
      <div>
        {/* OSDViewer에 어노테이션 데이터 대신 빈 배열과 modelType 전달 */}
        <AnnotationViewer
          annotations={[]}
          modelType={project?.modelType || 'MULTI'}
        />
      </div>
    </div>
  );
}
