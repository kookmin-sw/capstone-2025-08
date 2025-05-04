'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  dummyProjects,
  dummySubProject,
  dummyInferenceResults,
} from '@/data/dummy';
import { Project, SubProject } from '@/types/project-schema';

/* 뷰어는 동적 import */
const AnnotationViewer = dynamic(
  () => import('@/components/annotation/annotation-viewer'),
  { ssr: false },
) as unknown as React.FC<{
  subProject: SubProject | null;
  setSubProject: (sp: SubProject) => void;
  subProjects: SubProject[];
  inferenceResult: (typeof dummyInferenceResults)[number] | null;
}>;

export default function ProjectAnnotationPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [selected, setSelected] = useState<SubProject | null>(null);
  const [ready, setReady] = useState(false);

  // 더미 데이터 매칭
  useEffect(() => {
    if (!id) return;

    /* 1) 프로젝트 찾기 */
    const p = dummyProjects.find((d) => d.id === Number(id)) ?? null;
    setProject(p);

    /* 2) 서브프로젝트 목록 필터링 */
    const list = dummySubProject.filter((sp) => sp.projectId === id);
    setSubProjects(list);

    /* 3) 기본 선택(첫 번째) */
    setSelected(list[0] ?? null);

    setReady(true);
  }, [id]);

  const selectedInferenceResult = useMemo(() => {
    if (!selected) return null;

    return (
      dummyInferenceResults.find((res) => res.subProjectId === selected.id) ??
      null
    );
  }, [selected]);

  if (!ready) return <p>Loading…</p>;
  if (!project) return <p>잘못된 프로젝트 ID입니다.</p>;
  if (subProjects.length === 0)
    return <p>이 프로젝트에는 서브프로젝트가 없습니다.</p>;

  return (
    <div>
      {/* 선택된 서브프로젝트가 있을 때만 뷰어 표시 */}
      {selected ? (
        <AnnotationViewer
          subProject={selected}
          setSubProject={setSelected}
          subProjects={subProjects}
          inferenceResult={selectedInferenceResult}
        />
      ) : (
        <p>서브프로젝트를 선택하세요.</p>
      )}
    </div>
  );
}
