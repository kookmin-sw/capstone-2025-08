'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { dummyProjects } from '@/data/dummy';
import { Project } from '@/types/project-schema';

export default function ProjectsPage() {
  const router = useRouter();

  return (
    <div>
      Projects
      {dummyProjects.map((project: Project) => (
        <Button
          key={project.id}
          onClick={() => router.push(`/main/projects/annotation/${project.id}`)}
        >
          {project.title} 열기
        </Button>
      ))}
      <Button>새로운 프로젝트 생성</Button>
    </div>
  );
}
