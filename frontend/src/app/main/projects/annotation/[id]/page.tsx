'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AnnotationHistoryResponseDto,
  GetProjectAnnotationResponseDto,
  LabelDto,
  ProjectAnnotationAPIApi,
  SubProjectSummaryDto,
} from '@/generated-api';

const AnnotationViewer = dynamic(
  () => import('@/components/annotation/annotation-viewer'),
  { ssr: false },
) as unknown as React.FC<{
  subProject: SubProjectSummaryDto | null;
  setSubProject: (sp: SubProjectSummaryDto) => void;
  subProjects: SubProjectSummaryDto[];
  inferenceResult: AnnotationHistoryResponseDto | null;
  modelType: string;
  initialLabels?: LabelDto[];
}>;

export default function ProjectAnnotationPage() {
  const ProjectAnnotationApi = useMemo(() => new ProjectAnnotationAPIApi(), []);
  const { id } = useParams<{ id: string }>();

  const [project, setProject] =
    useState<GetProjectAnnotationResponseDto | null>(null);
  const [subProjects, setSubProjects] = useState<SubProjectSummaryDto[]>([]);
  const [selected, setSelected] = useState<SubProjectSummaryDto | null>(null);
  const [inferenceResult, setInferenceResult] =
    useState<AnnotationHistoryResponseDto | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const projectId = Number(id);

        // 1. 프로젝트 및 서브프로젝트 목록 가져오기
        const projectRes = await ProjectAnnotationApi.getProject({ projectId });
        setProject(projectRes);
        const subProjectList = projectRes.subProjects ?? [];
        setSubProjects(subProjectList);

        const firstSubProject = subProjectList[0];
        if (!firstSubProject) {
          setReady(true);
          return;
        }

        // 2. 첫 번째 서브프로젝트의 상세 정보 가져오기
        const subProjectRes = await ProjectAnnotationApi.getSubProject({
          subProjectId: firstSubProject.subProjectId!,
        });
        const latestAnnotationHistoryId =
          subProjectRes.latestAnnotationHistoryId;

        if (!latestAnnotationHistoryId) {
          setReady(true);
          return;
        }

        // 3. 해당 히스토리 ID로 어노테이션 히스토리 조회
        const annotationHistory =
          await ProjectAnnotationApi.getAnnotationHistory({
            annotationHistoryId: latestAnnotationHistoryId,
          });

        setSelected(firstSubProject);
        setInferenceResult(annotationHistory);
      } catch (error) {
        console.error('프로젝트 정보를 불러오는 중 오류 발생:', error);
      } finally {
        setReady(true);
      }
    };

    fetchData();
  }, [id]);

  if (!ready) return <p>Loading…</p>;
  if (!project) return <p>잘못된 프로젝트 ID입니다.</p>;
  if (subProjects.length === 0)
    return <p>이 프로젝트에는 서브프로젝트가 없습니다.</p>;

  return (
    <div className="h-full">
      {selected ? (
        <AnnotationViewer
          subProject={selected}
          setSubProject={setSelected}
          subProjects={subProjects}
          inferenceResult={inferenceResult}
          modelType={project.modelsDto?.modelType || ''}
          initialLabels={project.labels}
        />
      ) : (
        <p>서브프로젝트를 선택하세요.</p>
      )}
    </div>
  );
}
