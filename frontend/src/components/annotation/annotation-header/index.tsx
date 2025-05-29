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
  ModelsDtoWrapper,
  ModelServerAPIApi,
  ProjectAnnotationAPIApi,
  RoiSaveRequestDto,
} from '@/generated-api';
import { convertViewportToImageROIs } from '@/utils/canvas-roi-utils';
import { toast } from 'sonner';
import SplashScreen from '@/components/splash-screen';
import { formatModelType } from '@/utils/model-type-label';
import { createPortal } from 'react-dom';

export default function AnnotationHeader() {
  const ProjectAnnotationApi = useMemo(() => new ProjectAnnotationAPIApi(), []);
  const modelApi = useMemo(() => new ModelServerAPIApi(), []);

  const router = useRouter();
  const { id } = useParams();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [project, setProject] =
    useState<GetProjectAnnotationResponseDto | null>(null);
  const [selectedModelName, setSelectedModelName] = useState('none');
  const { selectedSubProject } = useAnnotationSharedStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const projectId = Number(id);

        const projectRes = await ProjectAnnotationApi.getProject({ projectId });
        setProject(projectRes);

        const modelsDto = projectRes.modelsDto as ModelsDtoWrapper;
        const lastModelName = modelsDto?.projectModels?.at(-1)?.name ?? 'none';

        setSelectedModelName(lastModelName);
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

  // 가장 최근 버전 기록 찾기
  const latestHistory =
    selectedSubProject?.latestAnnotationHistoryId?.toString();

  const transformROIs = (
    loadedROIs: any[],
    userDefinedROIs: any[],
    imageNameMap: Map<number, string[]>,
  ): RoiSaveRequestDto[] => {
    const allROIs = [...loadedROIs, ...userDefinedROIs];

    return allROIs.map((roi, index) => {
      const isLoaded = roi.detail !== undefined;
      const base = isLoaded ? roi.detail : roi;

      return {
        roiId: base.id,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        displayOrder: index,
        imageNames: imageNameMap.get(base.id) ?? [],
        cells:
          roi.cell?.map((cell: any) => ({
            labelId: cell.labelId,
            polygon: Array.isArray(cell.polygon)
              ? cell.polygon
              : [cell.polygon],
          })) ?? [],
      };
    });
  };

  const handleSave = async () => {
    const start = Date.now();
    setIsSaving(true);

    const { viewer, canvas, loadedROIs, userDefinedROIs, labels } =
      useAnnotationSharedStore.getState();

    if (!viewer || !canvas || !selectedSubProject || !project) {
      toast.error('Insufficient information to save.');
      const elapsed = Date.now() - start;
      if (elapsed < 2500)
        await new Promise((r) => setTimeout(r, 2500 - elapsed));
      setIsSaving(false);
      return;
    }

    let isError = false;

    try {
      // 1. 이미지 export
      const exportedImages = await exportROIAsPNG(
        viewer,
        canvas,
        loadedROIs,
        userDefinedROIs,
      );

      // 2. 이미지 이름 매핑
      const imageNameMap = new Map<number, string[]>();
      const formData = new FormData();

      exportedImages.forEach(({ roiId, filename, blob }) => {
        if (!imageNameMap.has(roiId)) {
          imageNameMap.set(roiId, []);
        }
        imageNameMap.get(roiId)!.push(filename);

        formData.append('images', blob, filename); // 이미지 추가
      });

      // 3. ROI 변환
      const imageUserDefinedROIs = convertViewportToImageROIs(
        viewer,
        userDefinedROIs,
      );

      const rois = transformROIs(
        loadedROIs,
        imageUserDefinedROIs,
        imageNameMap,
      );

      // 4. Label 변환 (원하는 구조로)
      const transformedLabels = (labels ?? []).map(
        (label: any, index: number) => ({
          id: label.labelId,
          name: label.name,
          color: label.color,
          displayOrder: label.displayOrder ?? index + 1, // 없으면 index+1로 fallback
          createdAt: label.createdAt ?? new Date().toISOString(), // 없으면 현재 시각으로
        }),
      );

      const requestDto = {
        rois: rois?.length ? rois : [],
        labels: transformedLabels,
      };

      // 5. JSON 파트 FormData에 추가
      formData.append(
        'requestDto',
        new Blob([JSON.stringify(requestDto)], {
          type: 'application/json',
        }),
      );

      exportedImages.forEach(({ filename, blob }) => {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // 저장될 파일명
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click(); // 자동 다운로드 실행
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // 메모리 누수 방지
      });

      // 6. API 호출 (openapi generator의 직렬화 오류로 인해 직접 호출하였습니다.)
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/annotation/sub-projects/${selectedSubProject.subProjectId}/histories/${selectedSubProject.latestAnnotationHistoryId}/save`,
        {
          method: 'POST',
          body: formData,
        },
      );

      await router.refresh();
    } catch (error) {
      console.error('저장 오류:', error);
      isError = true;
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < 2500) {
        await new Promise((r) => setTimeout(r, 2500 - elapsed));
      }
      setIsSaving(false);

      if (isError) {
        toast.error('Failed to save ROIs and upload images.');
      } else {
        toast.success('ROIs and images saved successfully.');
      }
    }
  };

  const handleTrain = async (modelName: string) => {
    if (!project || !selectedSubProject) {
      toast.error('Missing information for training request.');
      return;
    }

    const toastId = toast.loading('Submitting training request...');

    try {
      await modelApi.requestTraining({
        projectId: Number(id),
        trainingRequestDto: {
          modelName,
        },
      });

      toast.success('Training request submitted successfully!', {
        id: toastId,
      });
    } catch (err) {
      console.error('모델 학습 요청 오류:', err);
      toast.error('Failed to submit training request.', { id: toastId });
    }
  };

  if (isSaving) {
    return <SavingOverlay />;
  }

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
        <Select
          value={latestHistory}
          onValueChange={(val) => {
            const historyId = parseInt(val, 10);
            useAnnotationSharedStore
              .getState()
              .setSelectedAnnotationHistoryId(historyId);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Version Select">
              {(() => {
                const latest = selectedSubProject?.annotationHistories?.find(
                  (h) => h.id === selectedSubProject?.latestAnnotationHistoryId,
                );
                if (!latest) return 'Version Select';
                const { full, time } = formatDateTime(
                  (latest?.startedAt as Date).toISOString(),
                );
                return (
                  <div className="flex flex-row items-center gap-2">
                    <span>Version {latest.id}</span>
                    <span className="text-muted-foreground text-xs">
                      {full} {time}
                    </span>
                  </div>
                );
              })()}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {(selectedSubProject?.annotationHistories ?? [])
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.startedAt!).getTime() -
                  new Date(a.startedAt!).getTime(),
              )
              .map((history) => {
                const { full, time } = formatDateTime(
                  (history?.startedAt as Date).toISOString(),
                );
                return (
                  <SelectItem key={history.id} value={history.id!.toString()}>
                    <div className="flex flex-col">
                      <span>Version {history.id}</span>
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
        <div className="flex h-9 w-40 items-center whitespace-nowrap rounded-md border px-3 py-2">
          {formatModelType(selectedSubProject?.modelType)}
        </div>

        {/* 모델 이름 */}
        <div className="flex h-9 w-40 items-center whitespace-nowrap rounded-md border px-3 py-2">
          {selectedModelName}
        </div>

        {/* 버튼 */}
        <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
          Train
        </Button>
        <Button variant="secondary">Run</Button>
        <Button variant="secondary" onClick={handleSave}>
          Save
        </Button>

        <AnnotationModelExportModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onSave={(modelName) => {
            setIsExportModalOpen(false);
            handleTrain(modelName);
          }}
        />
      </div>
    </div>
  );
}

function SavingOverlay() {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80">
      <SplashScreen
        useNavigate={false}
        text="Saving your changes... please wait."
      />
    </div>,
    document.body,
  );
}
