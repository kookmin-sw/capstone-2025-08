'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { dummyProjects } from '@/data/dummy';

export default function AnnotationHeader() {
  const router = useRouter();
  const { id } = useParams(); // 현재 프로젝트 ID 가져오기

  if (!id) return null; // ID가 없으면 렌더링하지 않음

  // dummyProjects 배열에서 현재 id와 일치하는 프로젝트 찾기
  const project = dummyProjects.find((proj) => proj.id === Number(id));

  return (
    <div className="bg-primary fixed right-0 top-0 w-full border-b border-white p-4 text-white">
      <div className="flex flex-row items-center gap-4">
        <button onClick={() => router.push('/main/projects')}>
          <ArrowLeft className="text-white" />
        </button>
        <h3 className="text-lg font-semibold">
          {project ? project.title : 'Project Title'}
        </h3>
      </div>
    </div>
  );
}
