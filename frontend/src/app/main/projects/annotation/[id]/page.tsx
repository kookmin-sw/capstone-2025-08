'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AnnotationHistoryResponseDto,
  GetProjectAnnotationResponseDto,
  ProjectAnnotationAPIApi,
  ProjectLabelDto,
  SubProjectSummaryDto,
} from '@/generated-api';
import { useAnnotationSharedStore } from '@/stores/annotation-shared';

const AnnotationViewer = dynamic(
  () => import('@/components/annotation/annotation-viewer'),
  { ssr: false },
) as unknown as React.FC<{
  projectId: string;
  subProject: SubProjectSummaryDto | null;
  setSubProject: (sp: SubProjectSummaryDto) => void;
  subProjects: SubProjectSummaryDto[];
  inferenceResult: AnnotationHistoryResponseDto | null;
  modelType: string;
  initialLabels?: ProjectLabelDto[];
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
  const selectedAnnotationHistoryId = useAnnotationSharedStore(
    (s) => s.selectedAnnotationHistoryId,
  );
  const { selectedSubProject } = useAnnotationSharedStore();

  // 최초 1회 - 프로젝트 전체 정보와 첫 서브프로젝트 선택
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const projectId = Number(id);
        const projectRes = await ProjectAnnotationApi.getProject({ projectId });
        setProject(projectRes);

        useAnnotationSharedStore.getState().setProject(projectRes);

        const subProjectList = projectRes.subProjects ?? [];
        setSubProjects(subProjectList);
        const firstSubProject = subProjectList[0];
        if (!firstSubProject) {
          setReady(true);
          return;
        }
        setSelected(firstSubProject); // 최초 서브프로젝트 선택
      } catch (error) {
        console.error('프로젝트 정보를 불러오는 중 오류 발생:', error);
      } finally {
        setReady(true);
      }
    };

    fetchData();
  }, [id]);

  // 서브프로젝트가 바뀔 때마다 inferenceResult도 불러오기
  useEffect(() => {
    const fetchInference = async () => {
      if (!selected) return;
      try {
        const subProjectRes = await ProjectAnnotationApi.getSubProject({
          subProjectId: selected.subProjectId!,
        });

        useAnnotationSharedStore
          .getState()
          .setSelectedSubProject(subProjectRes);

        const latestAnnotationHistoryId =
          subProjectRes.latestAnnotationHistoryId;
        if (!latestAnnotationHistoryId) {
          setInferenceResult(null);
          return;
        }

        const annotationHistory =
          await ProjectAnnotationApi.getAnnotationHistory({
            annotationHistoryId: latestAnnotationHistoryId,
          });
        setInferenceResult(annotationHistory);
      } catch (err) {
        console.error('서브프로젝트 변경 후 inference 불러오기 실패:', err);
      }
    };

    fetchInference();
  }, [selected]);

  useEffect(() => {
    const fetchSelectedHistory = async () => {
      if (!selectedAnnotationHistoryId) return;

      try {
        const annotationHistory =
          await ProjectAnnotationApi.getAnnotationHistory({
            annotationHistoryId: selectedAnnotationHistoryId,
          });
        setInferenceResult(annotationHistory);
      } catch (err) {
        console.error('선택한 히스토리 불러오기 실패:', err);
      }
    };

    fetchSelectedHistory();
  }, [selectedAnnotationHistoryId]);

  if (!ready) return <p>Loading…</p>;
  if (!project) return <p>잘못된 프로젝트 ID입니다.</p>;
  if (subProjects.length === 0)
    return <p>이 프로젝트에는 서브프로젝트가 없습니다.</p>;

  return (
    <div className="h-full">
      {selected ? (
        <AnnotationViewer
          projectId={id}
          subProject={selected}
          setSubProject={setSelected}
          subProjects={subProjects}
          inferenceResult={inferenceResult}
          modelType={selectedSubProject?.modelType || ''}
          initialLabels={project.labels}
        />
      ) : (
        <p>서브프로젝트를 선택하세요.</p>
      )}
    </div>
  );
}
