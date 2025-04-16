'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  dummyProjects,
  dummySubProject,
  dummyInferenceResult,
} from '@/data/dummy';
import { Project, SubProject } from '@/types/project-schema';

/* 뷰어는 동적 import */
const AnnotationViewer = dynamic(
  () => import('@/components/annotation/annotation-viewer'),
  { ssr: false },
) as unknown as React.FC<{
  subProject: SubProject | null; // ← 선택되지 않았을 땐 null
  inferenceResult: typeof dummyInferenceResult;
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
          inferenceResult={dummyInferenceResult}
        />
      ) : (
        <p>서브프로젝트를 선택하세요.</p>
      )}

      {/*/!* 서브프로젝트 선택 버튼 *!/*/}
      {/*<div className="mt-20 flex gap-2">*/}
      {/*  {subProjects.map((sp) => (*/}
      {/*    <button*/}
      {/*      key={sp.id}*/}
      {/*      className={`rounded border px-3 py-1 ${*/}
      {/*        selected?.id === sp.id ? 'bg-blue-600 text-white' : 'bg-white'*/}
      {/*      }`}*/}
      {/*      onClick={() => setSelected(sp)}*/}
      {/*    >*/}
      {/*      Sub #{sp.id}*/}
      {/*    </button>*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
}
