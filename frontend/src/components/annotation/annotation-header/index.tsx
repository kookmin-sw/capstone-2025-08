'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils';
import { exportROIAsPNG } from '@/utils/canvas-image-utils';
import { useAnnotationSharedStore } from '@/stores/annotation-shared';
import { useState, useEffect, useMemo } from 'react';
import AnnotationModelExportModal from '@/components/annotation/annotation-model-export-modal';
import {
  GetProjectAnnotationResponseDto,
  ProjectAnnotationAPIApi,
} from '@/generated-api';

export default function AnnotationHeader() {
  const ProjectAnnotationApi = useMemo(() => new ProjectAnnotationAPIApi(), []);
  const router = useRouter();
  const { id } = useParams();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [project, setProject] =
    useState<GetProjectAnnotationResponseDto | null>(null);
  const [selectedModelName, setSelectedModelName] = useState('none');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const projectId = Number(id);

        // 1. 프로젝트 및 서브프로젝트 목록 가져오기
        const projectRes = await ProjectAnnotationApi.getProject({ projectId });
        setProject(projectRes);

        // 2. 모델 이름 설정
        const firstModelName =
          projectRes.modelsDto?.projectModels?.[0]?.name ?? 'none';
        setSelectedModelName(firstModelName);
      } catch (error) {
        console.error('프로젝트 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchData();
  }, [id]);

  // project가 없으면 빈 UI 반환 (하지만 Hook 이후 실행됨)
  if (!project) {
    return <div className="p-4">Project not found</div>;
  }

  // 가장 최근 버전 기록 찾기 (startedAt 기준 내림차순 정렬 후 첫 번째)
  const latestHistory = project?.history
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )[0];

  const modelType = project?.modelType?.toLowerCase() as
    | 'cell'
    | 'tissue'
    | 'multi'
    | undefined;

  const handleSave = () => {
    const {
      viewer,
      canvas,
      loadedROIs,
      userDefinedROIs,
      cellPolygons,
      labels,
    } = useAnnotationSharedStore.getState();

    console.log('Viewer:', viewer);
    console.log('Canvas:', canvas);
    console.log('Loaded ROIs:', loadedROIs);
    console.log('User Defined ROIs:', userDefinedROIs);
    console.log('Cell Polygons:', cellPolygons);
    console.log('Labels:', labels);

    if (!viewer || !canvas || !loadedROIs || !userDefinedROIs) {
      alert('내보낼 수 있는 ROI가 없습니다.');
      return;
    }

    if (modelType === 'cell') {
      const exportData = cellPolygons.map((poly, index) => ({
        index,
        color: poly.color,
        points: poly.points,
      }));
      console.log('Exporting Cell Polygon Data:', exportData);
      // 필요 시 여기서 JSON.stringify(exportData) 등으로 처리
    } else if (modelType === 'tissue') {
      exportROIAsPNG(viewer, canvas, loadedROIs, userDefinedROIs);
    } else if (modelType === 'multi') {
      exportROIAsPNG(viewer, canvas, loadedROIs, userDefinedROIs);
      const exportData = cellPolygons.map((poly, index) => ({
        index,
        color: poly.color,
        points: poly.points,
      }));
      console.log('Exporting Cell Polygon Data:', exportData);
    }
  };

  return (
    <div className="bg-primary fixed right-0 top-0 flex w-full flex-row items-center justify-between p-4 text-white">
      {/* 왼쪽: 뒤로가기 + 프로젝트 제목 */}
      <div className="flex flex-row items-center gap-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="cursor-pointer text-white" />
        </button>
        <h3 className="text-lg font-semibold">
          {project ? project.title : 'Project Title'}
        </h3>
      </div>

      {/* 오른쪽: 모델 정보 */}
      <div className="flex flex-row items-center gap-4">
        {/* 모델 버전 기록 (가장 최근 히스토리) */}
        <Select value={latestHistory?.id.toString()} onValueChange={() => {}}>
          <SelectTrigger>
            <SelectValue>
              {latestHistory
                ? (() => {
                    const { full, time } = formatDateTime(
                      latestHistory.startedAt,
                    );
                    return (
                      <div className="flex flex-row items-center gap-2">
                        <span>Version {latestHistory.id}</span>
                        <span className="text-muted-foreground text-xs">
                          {full} {time}
                        </span>
                      </div>
                    );
                  })()
                : 'Version Select'}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {project?.history
              ?.slice() // 원본 보호
              .sort(
                (a, b) =>
                  new Date(b.startedAt).getTime() -
                  new Date(a.startedAt).getTime(),
              )
              .map((h) => {
                const { full, time } = formatDateTime(h.startedAt);
                return (
                  <SelectItem key={h.id} value={h.id.toString()}>
                    <div className="flex flex-col">
                      <span>Version {h.id}</span>
                      <span className="text-muted-foreground text-xs">
                        {full} {time}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
        {/* 모델 타입 */}
        <Select
          value={project.modelsDto?.modelType.toLowerCase()}
          onValueChange={() => {}}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="모델 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cell">Cell</SelectItem>
            <SelectItem value="tissue">Tissue</SelectItem>
            <SelectItem value="multi">Multi</SelectItem>
          </SelectContent>
        </Select>
        {/* 모델 이름 */}
        <Select
          value={selectedModelName}
          onValueChange={(value) => {
            console.log('선택된 모델 이름:', value);
            setSelectedModelName(value);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select Model Name" />
          </SelectTrigger>
          <SelectContent>
            {project?.modelNameList?.map((name: string) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}

            {/* 항상 고정으로 표시 */}
            <SelectItem value="none">Not Selected</SelectItem>
          </SelectContent>
        </Select>

        {/* 버튼 */}
        <Button variant="secondary">Train</Button>
        <Button variant="secondary">Run</Button>
        <Button variant="secondary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
          Export
        </Button>
        <AnnotationModelExportModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onSave={(modelName) => {
            console.log('Export with model name:', modelName);
            setIsExportModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
