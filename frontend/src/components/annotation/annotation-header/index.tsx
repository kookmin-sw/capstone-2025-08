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
  ModelServerAPIApi,
  ProjectAnnotationAPIApi,
  RoiSaveRequestDto,
} from '@/generated-api';
import { convertViewportToImageROIs } from '@/utils/canvas-roi-utils';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const projectId = Number(id);

        const projectRes = await ProjectAnnotationApi.getProject({ projectId });
        setProject(projectRes);

        // 모델 이름 설정
        const firstModelName = projectRes.modelsDto?.modelName ?? 'none';
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
    const { viewer, canvas, loadedROIs, userDefinedROIs, labels } =
      useAnnotationSharedStore.getState();

    if (!viewer || !canvas || !selectedSubProject || !project) {
      alert('저장할 수 있는 정보가 부족합니다.');
      return;
    }

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

      // requestDto 내용을 콘솔로 확인
      console.log('📦 requestDto:', JSON.stringify(requestDto, null, 2));

      // formData 내용을 출력
      console.log('📦 FormData 내용:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob) {
          console.log(
            ` 🖼️ ${key}:`,
            value.name,
            value.type,
            value.size + ' bytes',
          );
          if (key === 'requestDto') {
            value.text().then((text) => {
              console.log('📝 requestDto JSON:', JSON.parse(text));
            });
          }
        } else {
          console.log(`🔹 ${key}:`, value);
        }
      }

      console.log('🖼️ FormData 이미지 확인용 링크 ↓');

      exportedImages.forEach(({ filename, blob }) => {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // 저장될 파일명
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click(); // ✅ 자동 다운로드 실행
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

      alert('ROI 저장 및 이미지 업로드가 완료되었습니다.');

      window.location.reload(); // 저장 완료 후 새로고침
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleTrain = async (modelName: string) => {
    if (!project || !selectedSubProject) {
      alert('학습 요청에 필요한 정보가 없습니다.');
      return;
    }

    try {
      await modelApi.requestTraining({
        projectId: Number(id),
        trainingRequestDto: {
          modelName,
        },
      });

      alert('모델 학습 요청이 완료되었습니다.');
    } catch (err) {
      console.error('모델 학습 요청 오류:', err);
      alert('모델 학습 요청 중 오류가 발생했습니다.');
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
          {selectedSubProject?.modelType?.toLowerCase()}
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
