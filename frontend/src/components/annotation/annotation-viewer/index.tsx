'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import OpenSeadragon from 'openseadragon';
import { useOsdviewer } from '@/hooks/use-osdviewer';
import AnnotationTool from '@/components/annotation/annotation-tool';
import AnnotationControlPanel from '@/components/annotation/annotation-control-panel';
import {
  syncCanvasWithOSD,
  redrawCanvas,
  redrawCellCanvas,
} from '@/utils/canvas-utils';
import { processMaskTile } from '@/utils/canvas-image-utils';
import {
  getAllViewportROIs,
  isPointInsideROIs,
  drawROIs,
} from '@/utils/canvas-roi-utils';
import {
  deepCopyRenderQueue,
  deepCopyStrokes,
  deepCopyPolygons,
  drawStroke,
} from '@/utils/canvas-drawing-utils';
import {
  Point,
  Stroke,
  ROI,
  Polygon,
  RenderItem,
  RenderSnapshot,
} from '@/types/annotation';
import AnnotationSidebar from '@/components/annotation/annotation-sidebar';
import AnnotationSubProjectSlider from '@/components/annotation/annotation-subproject-slider';
import { convertViewportROIToImageROI } from '@/hooks/use-viewport-to-image';
import { useAnnotationSharedStore } from '@/stores/annotation-shared';
import AnnotationCellDeleteModal from '@/components/annotation/annotation-cell-delete-modal';
import {
  AnnotationHistoryResponseDto,
  ProjectLabelDto,
  RoiResponseDto,
  RoiResponsePayload,
  SubProjectSummaryDto,
} from '@/generated-api';

// ROI 선 두께 상수
const BORDER_THICKNESS = 2;

type Tool = 'point' | 'polygon' | 'paintbrush' | 'eraser' | 'delete' | null;

const AnnotationViewer: React.FC<{
  projectId: string;
  subProject: SubProjectSummaryDto | null;
  setSubProject: (sp: SubProjectSummaryDto) => void;
  subProjects: SubProjectSummaryDto[];
  inferenceResult: AnnotationHistoryResponseDto | null;
  modelType: string;
  initialLabels: ProjectLabelDto[];
}> = ({
  projectId,
  subProject,
  setSubProject,
  subProjects,
  inferenceResult,
  modelType,
  initialLabels,
}) => {
  /* =============================================
      Ref 및 State 선언
  ============================================== */
  // OpenSeadragon 뷰어 및 캔버스 Ref
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentDrawingROIRef = useRef<ROI | null>(null);
  const viewerInstance = useOsdviewer(viewerRef);

  // ROI/드로잉 도중의 마우스 상태 및 임시 객체들 Ref
  const roiStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const currentPolygonRef = useRef<Polygon | null>(null);
  const currentCellPolygonRef = useRef<Polygon | null>(null);
  const selectedCellPolygonPointRef = useRef<{
    polygonIndex: number;
    pointIndex: number;
  } | null>(null);

  // 드로잉 도구 관련 상태
  const [renderQueueVersion, setRenderQueueVersion] = useState(0);
  const [penColor, setPenColor] = useState('#FF0000');
  const [penSize, setPenSize] = useState(10);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

  // 현재 선택 중인 ROI 및 모드 상태
  const [roi, setROI] = useState<RoiResponseDto | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isSelectingROI, setIsSelectingROI] = useState(false);

  // 모델 추론으로부터 로딩된 ROI
  const [loadedROIs, setLoadedROIs] = useState<RoiResponsePayload[]>([]);

  // 서브프로젝트 단위로 관리되는 상태들 (key = subProject.id)
  const [userDefinedROIsMap, setUserDefinedROIsMap] = useState<
    Record<number, RoiResponseDto[]>
  >({});
  const [strokesMap, setStrokesMap] = useState<Record<number, Stroke[]>>({});
  const [polygonsMap, setPolygonsMap] = useState<Record<number, Polygon[]>>({});
  const [cellPolygonsMap, setCellPolygonsMap] = useState<
    Record<number, Polygon[]>
  >({});
  const [renderQueueMap, setRenderQueueMap] = useState<
    Record<number, RenderItem[]>
  >({});
  const [renderQueueUndoMap, setRenderQueueUndoMap] = useState<
    Record<number, RenderItem[][]>
  >({});
  const [renderQueueRedoMap, setRenderQueueRedoMap] = useState<
    Record<number, RenderItem[][]>
  >({});
  const [selectedPolygonForDeletion, setSelectedPolygonForDeletion] = useState<{
    source: 'new' | 'loaded'; // 새로 그린 건지, 불러온 건지 구분
    polygonIndex: number; // 폴리곤 인덱스
  } | null>(null);

  // 현재 서브프로젝트 ID 기준 상태 접근
  const subProjectId = subProject?.subProjectId ?? -1;

  const userDefinedROIs = useMemo(
    () => userDefinedROIsMap[subProjectId] || [],
    [userDefinedROIsMap, subProjectId],
  );
  const strokes = useMemo(
    () => strokesMap[subProjectId] || [],
    [strokesMap, subProjectId],
  );
  const polygons = useMemo(
    () => polygonsMap[subProjectId] || [],
    [polygonsMap, subProjectId],
  );
  const cellPolygons = useMemo(
    () => cellPolygonsMap[subProjectId] || [],
    [cellPolygonsMap, subProjectId],
  );
  const [renderSnapshotUndoMap, setRenderSnapshotUndoMap] = useState<
    Record<number, RenderSnapshot[]>
  >({});
  const [renderSnapshotRedoMap, setRenderSnapshotRedoMap] = useState<
    Record<number, RenderSnapshot[]>
  >({});

  // 현재 서브프로젝트 ID 기준 상태 업데이트 함수들
  const setUserDefinedROIs = (rois: RoiResponseDto[]) => {
    if (subProjectId == null) return;
    setUserDefinedROIsMap((prev) => ({ ...prev, [subProjectId]: rois }));
  };

  const setStrokes = (s: Stroke[]) => {
    if (subProjectId == null) return;
    setStrokesMap((prev) => ({ ...prev, [subProjectId]: s }));
  };

  const setPolygons = (p: Polygon[]) => {
    if (subProjectId == null) return;
    setPolygonsMap((prev) => ({ ...prev, [subProjectId]: p }));
  };

  const setCellPolygons = (polygons: Polygon[]) => {
    if (subProjectId == null) return;
    setCellPolygonsMap((prev) => ({ ...prev, [subProjectId]: polygons }));
  };

  // 스냅샷 저장 함수
  const pushRenderSnapshot = () => {
    const snapshot: RenderSnapshot = {
      renderQueue: deepCopyRenderQueue(renderQueueMap[subProjectId] || []),
      strokes: deepCopyStrokes(strokesMap[subProjectId] || []),
      polygons: deepCopyPolygons(polygonsMap[subProjectId] || []),
    };

    setRenderSnapshotUndoMap((prev) => ({
      ...prev,
      [subProjectId]: [...(prev[subProjectId] || []), snapshot],
    }));
    setRenderSnapshotRedoMap((prev) => ({
      ...prev,
      [subProjectId]: [],
    }));
  };

  // 스냅샷 복원 함수
  const restoreRenderSnapshot = (snapshot: RenderSnapshot) => {
    setRenderQueueMap((prev) => ({
      ...prev,
      [subProjectId]: snapshot.renderQueue,
    }));
    setStrokes(snapshot.strokes);
    setPolygons(snapshot.polygons);
    setRenderQueueVersion((v) => v + 1);
    redraw();
  };

  /* =============================================
    Zustand Store 등록 및 상태 관리
  ============================================== */
  useEffect(() => {
    if (viewerInstance.current) {
      useAnnotationSharedStore.getState().setViewer(viewerInstance.current);
    }
  }, [viewerInstance]);

  useEffect(() => {
    if (canvasRef.current) {
      useAnnotationSharedStore.getState().setCanvas(canvasRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    useAnnotationSharedStore.getState().setLoadedROIs(loadedROIs);
  }, [loadedROIs]);

  useEffect(() => {
    useAnnotationSharedStore.getState().setUserDefinedROIs(userDefinedROIs);
  }, [userDefinedROIs]);

  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer) return;

    const imagePolygons = cellPolygons.map((poly) => ({
      ...poly,
      points: poly.points.map((pt) => {
        const imagePt = viewer.viewport.viewportToImageCoordinates(
          new OpenSeadragon.Point(pt.x, pt.y),
        );
        return { x: imagePt.x, y: imagePt.y };
      }),
    }));

    useAnnotationSharedStore.getState().setCellPolygons(imagePolygons);
  }, [cellPolygons, viewerInstance]);

  // 1. allROIs : 불러온 ROI + 사용자 정의 ROI (viewport 기준)
  const allROIs = useMemo(() => {
    const inferredROIs = viewerInstance.current
      ? getAllViewportROIs(viewerInstance.current, loadedROIs)
      : loadedROIs.map((roi) => ({
          id: roi.detail?.id,
          x: roi.detail?.x,
          y: roi.detail?.y,
          width: roi.detail?.width,
          height: roi.detail?.height,
        }));
    return [...inferredROIs, ...userDefinedROIs];
  }, [viewerInstance, loadedROIs, userDefinedROIs]);

  // 2. imageAllROIs : viewport → image 변환
  const imageAllROIs = useMemo(() => {
    if (!viewerInstance.current) return allROIs;
    return allROIs.map((roi) =>
      convertViewportROIToImageROI(viewerInstance.current, roi),
    );
  }, [viewerInstance, allROIs]);

  // 사용한 label
  const labels = useAnnotationSharedStore((state) => state.labels);
  const setLabels = useAnnotationSharedStore((state) => state.setLabels);

  // 1. 최초 라벨 불러오기
  useEffect(() => {
    if (initialLabels && projectId) {
      setLabels(initialLabels);
    }
  }, [projectId]);

  // 2. 드로잉 시 새 색상이면 추가
  const ensureLabelForCurrentColor = () => {
    const exists = labels.find((l) => l.color === penColor);
    if (!exists) {
      const newLabel = {
        labelId: -Date.now(),
        name: `Label ${labels.length + 1}`,
        color: penColor,
        createdAt: new Date(),
        displayOrder: labels.length,
      };
      setLabels([...labels, newLabel]);
    }
  };

  // label 이름 수정
  const handleRenameLabel = (id: string, newName: string) => {
    const updated = labels.map((label) =>
      label.labelId?.toString() === id ? { ...label, name: newName } : label,
    );
    setLabels(updated);
  };

  // label 삭제
  const handleDeleteLabel = (id: string) => {
    const deletedLabel = labels.find(
      (label) => label.labelId?.toString() === id,
    );
    if (!deletedLabel) return;

    const targetColor = deletedLabel.color;

    // 1. label 삭제
    const updatedLabels = labels.filter(
      (label) => label.labelId?.toString() !== id,
    );
    setLabels(updatedLabels);

    // 2. 해당 색상의 stroke 제거
    const updatedStrokes = strokes.filter(
      (stroke) => stroke.color !== targetColor,
    );
    setStrokes(updatedStrokes);

    // 3. 해당 색상의 polygon 제거
    const updatedPolygons = polygons.filter(
      (polygon) => polygon.color !== targetColor,
    );
    setPolygons(updatedPolygons);

    // 4. 해당 색상의 셀 폴리곤 제거
    const updatedCellPolygons = cellPolygons.filter(
      (polygon) => polygon.color !== targetColor,
    );
    setCellPolygons(updatedCellPolygons);

    // 5. ROI 안의 불러온 셀들도 제거 (loadedROIs는 변경 불가능할 수 있으므로 복사)
    const updatedLoaded = loadedROIs.map((roi) => ({
      ...roi,
      cell: roi.cell?.filter((c) => c.color !== targetColor),
    }));
    setLoadedROIs(updatedLoaded);

    // 6. renderQueue도 정리
    const updatedQueue = (renderQueueMap[subProjectId] || []).filter((item) => {
      if (item.type === 'stroke') return item.stroke.color !== targetColor;
      if (item.type === 'polygon') return item.polygon.color !== targetColor;
      return true;
    });
    setRenderQueueMap((prev) => ({
      ...prev,
      [subProjectId]: updatedQueue,
    }));

    setRenderQueueVersion((v) => v + 1);
    redraw();
  };

  // label 순서 변경
  const handleReorderLabels = (reordered: ProjectLabelDto[]) => {
    setLabels(reordered);
  };

  // roi 수정
  const currentROIRef = useRef<RoiResponseDto | null>(null);
  const isResizingRef = useRef(false);
  const resizingHandleRef = useRef<
    'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null
  >(null);
  const [isEditingROI, setIsEditingROI] = useState(false);

  const getResizeHandleUnderCursor = (
    mouse: { x: number; y: number },
    roi: RoiResponseDto,
    viewportPixelFromPoint: (pt: { x: number; y: number }) => {
      x: number;
      y: number;
    },
  ): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null => {
    const threshold = 10;

    if (
      typeof roi.x !== 'number' ||
      typeof roi.y !== 'number' ||
      typeof roi.width !== 'number' ||
      typeof roi.height !== 'number'
    ) {
      return null;
    }

    const corners = {
      'top-left': { x: roi.x, y: roi.y },
      'top-right': { x: roi.x + roi.width, y: roi.y },
      'bottom-left': { x: roi.x, y: roi.y + roi.height },
      'bottom-right': { x: roi.x + roi.width, y: roi.y + roi.height },
    };

    for (const [handle, pt] of Object.entries(corners)) {
      const pixel = viewportPixelFromPoint(pt);
      const dist = Math.hypot(pixel.x - mouse.x, pixel.y - mouse.y);
      if (dist <= threshold)
        return handle as
          | 'top-left'
          | 'top-right'
          | 'bottom-left'
          | 'bottom-right';
    }

    return null;
  };

  const getClickedCellPolygonPoint = (x: number, y: number) => {
    if (!viewerInstance.current) return null;
    const threshold = 6;
    const allCellPolygons = [
      ...cellPolygons,
      ...loadedROIs.flatMap((roi) => roi.cell ?? []),
    ];

    for (let pi = 0; pi < allCellPolygons.length; pi++) {
      const poly = allCellPolygons[pi];
      if (!('points' in poly)) continue;
      for (let i = 0; i < poly.points.length; i++) {
        const pt = viewerInstance.current.viewport.pixelFromPoint(
          new OpenSeadragon.Point(poly.points[i].x, poly.points[i].y),
        );
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist <= threshold) return { polygonIndex: pi, pointIndex: i };
      }
    }
    return null;
  };

  /* =============================================
      모델 타입별 디폴트 어노테이션 도구
  ============================================== */
  const getDefaultToolByModel = (modelType: string): Tool => {
    switch (modelType) {
      case 'CELL':
        return 'point';
      case 'MULTI':
        return 'paintbrush';
      case 'TISSUE':
        return 'polygon';
      default:
        return null;
    }
  };

  const [activeTool, setActiveTool] = useState<Tool>(() =>
    getDefaultToolByModel(modelType),
  );

  /* =============================================
      펜 크기 변경 시 상태 업데이트
  ============================================== */
  const [showPreviewDot, setShowPreviewDot] = useState(false);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevPenSizeRef = useRef(penSize);

  useEffect(() => {
    if (prevPenSizeRef.current === penSize) return;
    if (activeTool !== 'paintbrush') return;

    setShowPreviewDot(true);

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      setShowPreviewDot(false);
    }, 3000);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penSize]);

  /* =============================================
      초기화 및 타일소스 로딩
  ============================================== */
  useEffect(() => {
    if (!inferenceResult || !viewerInstance.current) {
      setLoadedROIs([]);
      setCellPolygonsMap((prev) => ({ ...prev, [subProjectId]: [] }));
      return;
    }

    const viewer = viewerInstance.current;
    const tiledImage = viewer.world.getItemAt(0);

    if (!tiledImage) {
      // 타일이 올라올 때까지 기다렸다가 다시 실행
      const retry = setTimeout(() => {
        setRenderQueueVersion((v) => v + 1); // 강제 리렌더
      }, 500);
      return () => clearTimeout(retry);
    }

    const load = async () => {
      // TODO: 규원 Uncertain ROIs 구현
      const roiData: RoiResponsePayload[] = [];
      const polygonsToLoad: Polygon[] = [];

      if (!inferenceResult?.roiPayloads) return;

      for (const payload of inferenceResult?.roiPayloads) {
        if (!payload.detail) continue;

        const bbox = {
          id: payload.detail.id,
          x: payload.detail.x,
          y: payload.detail.y,
          width: payload.detail.width,
          height: payload.detail.height,
        };

        const roiItem: RoiResponsePayload = {
          detail: bbox,
          tissuePath: [],
          cell: [],
        };

        // Tissue 처리
        if (
          Array.isArray(payload?.tissuePath) &&
          payload.tissuePath.length > 0 &&
          payload.detail &&
          payload.detail.x !== undefined &&
          payload.detail.y !== undefined &&
          payload.detail.width !== undefined &&
          payload.detail.height !== undefined
        ) {
          const { x, y, width, height } = payload.detail;

          const tiles = await Promise.all(
            payload.tissuePath.map((url) =>
              processMaskTile({ x, y, width, height }, url),
            ),
          );

          roiItem.tissuePath = tiles.map((tile) => tile.img.src);
        }

        // Cell 처리
        if (Array.isArray(payload.cell) && payload.cell.length > 0) {
          const viewportPolygons = payload.cell.map((cellItem) => {
            const viewportPoints = (cellItem.polygon?.points ?? []).map(
              (pt) => {
                const vp = viewer.viewport.imageToViewportCoordinates(
                  new OpenSeadragon.Point(pt.x, pt.y),
                );
                return { x: vp.x, y: vp.y };
              },
            );

            return {
              points: viewportPoints,
              closed: true,
              color: cellItem.color || '#FF0000',
            };
          });

          roiItem.cell = viewportPolygons;
          polygonsToLoad.push(...viewportPolygons);
        }

        roiData.push(roiItem);
      }

      setLoadedROIs(roiData);
      setCellPolygonsMap((prev) => ({
        ...prev,
        [subProjectId]: polygonsToLoad,
      }));
    };

    load();
  }, [inferenceResult, subProjectId, viewerInstance, renderQueueVersion]);

  /* =============================================
      subProject가 바뀌면 ROI 초기화
  ============================================== */
  useEffect(() => {
    // Roi 잔상 에러를 해결하기 위해 조건 제거
    // if (!inferenceResult) {
    console.log('[subProject 변경 감지 - 초기화]', subProjectId);
    setLoadedROIs([]);
    setUserDefinedROIs([]);
    setROI(null);
    redrawROICanvas();
    // }
  }, [subProject?.subProjectId, inferenceResult?.annotationHistoryId]);

  /* =============================================
      ROI 캔버스 그리기
  ============================================== */
  const redrawROICanvas = useCallback(() => {
    if (!viewerInstance.current || !roiCanvasRef.current) return;
    drawROIs(
      viewerInstance.current,
      roiCanvasRef.current,
      roi,
      userDefinedROIs,
      loadedROIs,
      isSelectingROI,
      isEditingROI,
    );
  }, [
    viewerInstance,
    roiCanvasRef,
    roi,
    userDefinedROIs,
    loadedROIs,
    isSelectingROI,
    isEditingROI,
  ]);

  useEffect(() => {
    redrawROICanvas();
  }, [
    roi,
    loadedROIs,
    userDefinedROIs,
    isSelectingROI,
    isEditingROI,
    redrawROICanvas,
  ]);

  /* =============================================
      모델 ROI가 준비되면 첫 번째 ROI를 자동으로 선택
  ============================================== */
  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer || !loadedROIs.length) return;

    const tiledImage = viewer.world.getItemAt(0);

    const applyROI = (img: any) => {
      const bbox = loadedROIs[0].detail;
      if (
        !bbox ||
        typeof bbox.x !== 'number' ||
        typeof bbox.y !== 'number' ||
        typeof bbox.width !== 'number' ||
        typeof bbox.height !== 'number'
      ) {
        return;
      }

      const { x, y, width, height } = bbox;

      const tl = img.imageToViewportCoordinates(new OpenSeadragon.Point(x, y));
      const br = img.imageToViewportCoordinates(
        new OpenSeadragon.Point(x + width, y + height),
      );

      setROI({ x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y });
    };

    if (!tiledImage) {
      const retry = setTimeout(() => {
        const newTiledImage = viewer.world.getItemAt(0);
        if (newTiledImage) applyROI(newTiledImage);
      }, 500);
      return () => clearTimeout(retry);
    } else {
      applyROI(tiledImage);
    }
  }, [viewerInstance, loadedROIs]);

  /* =============================================
      ROI가 뷰어에 포함되어 있는지 확인
  ============================================== */
  const isInsideAnyROI = (pt: Point): boolean => {
    if (!viewerInstance.current) return false;
    const allROIs = [
      ...getAllViewportROIs(viewerInstance.current, loadedROIs),
      ...userDefinedROIs,
    ];
    return isPointInsideROIs(pt, allROIs);
  };

  /* =============================================
      캔버스 및 뷰어 동기화
  ============================================== */
  const redraw = useCallback(() => {
    if (!viewerInstance.current) return;

    redrawCanvas(
      viewerInstance.current,
      canvasRef,
      loadedROIs,
      renderQueueMap[subProjectId] || [],
      currentPolygonRef.current,
      mousePosition,
    );

    if (cellCanvasRef.current) {
      redrawCellCanvas(
        viewerInstance.current,
        cellCanvasRef.current,
        cellPolygons,
        currentCellPolygonRef.current,
        mousePosition,
        isInsideAnyROI,
        loadedROIs,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewerInstance,
    canvasRef,
    loadedROIs,
    strokes,
    polygons,
    cellPolygons,
    mousePosition,
  ]);

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderQueueMap, strokesMap, polygonsMap, subProjectId]);

  const syncAllCanvases = useCallback(() => {
    if (!viewerInstance.current) return;

    // 일반 드로잉 캔버스
    syncCanvasWithOSD(viewerInstance.current, canvasRef, redraw);

    // 셀 폴리곤 캔버스
    if (cellCanvasRef.current) {
      syncCanvasWithOSD(viewerInstance.current, cellCanvasRef, () => {
        redrawCellCanvas(
          viewerInstance.current!,
          cellCanvasRef.current!,
          cellPolygons,
          currentCellPolygonRef.current,
          mousePosition,
          isInsideAnyROI,
          loadedROIs,
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewerInstance,
    canvasRef,
    cellCanvasRef,
    redraw,
    cellPolygons,
    currentCellPolygonRef,
    mousePosition,
  ]);

  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer) return;

    const updateHandler = () => {
      syncAllCanvases();
      redrawROICanvas(); // ROI 캔버스는 따로 관리되고 있으므로 병렬 호출
    };

    viewer.addHandler('animation', updateHandler);
    viewer.addHandler('zoom', updateHandler);
    viewer.addHandler('pan', updateHandler);
    window.addEventListener('resize', updateHandler);

    // 초기 1회 호출
    updateHandler();

    return () => {
      viewer.removeHandler('animation', updateHandler);
      viewer.removeHandler('zoom', updateHandler);
      viewer.removeHandler('pan', updateHandler);
      window.removeEventListener('resize', updateHandler);
    };
  }, [viewerInstance, syncAllCanvases, redrawROICanvas]);

  /* =============================================
      타일소스 로딩
  ============================================== */
  useEffect(() => {
    if (!viewerInstance.current || !subProject) return;

    const viewer = viewerInstance.current;

    // 기존 이미지 제거
    viewer.world.removeAll();

    // 줌/팬 초기화
    viewer.viewport.zoomTo(1);
    viewer.viewport.panTo(new OpenSeadragon.Point(0.5, 0.5));

    // 새 타일 이미지 로딩
    viewer.addTiledImage({
      // tileSource: subProject.tileImageUrl,
      tileSource:
        'https://pathos-images.s3.ap-northeast-2.amazonaws.com/sub-project/25/tiles/output_slide.dzi',
      success: {
        'AnnotationTestViewer.useEffect': () => {
          console.log('DZI image loaded successfully');
        },
      }['AnnotationTestViewer.useEffect'],
    });
  }, [viewerInstance, subProject]);

  /* =============================================
      마우스 이벤트 핸들러
  ============================================== */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const viewportPoint = viewerInstance.current.viewport.pointFromPixel(
      new OpenSeadragon.Point(x, y),
    );

    if (roi && !isDrawingMode && !isSelectingROI) {
      const mousePixel = { x, y };
      const viewer = viewerInstance.current;
      if (!viewer) return;

      const handle = getResizeHandleUnderCursor(mousePixel, roi, (pt) =>
        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
      );

      if (handle) {
        isResizingRef.current = true;
        resizingHandleRef.current = handle;
        currentROIRef.current = { ...roi }; // 기준 ROI 보관
        e.preventDefault();
        return;
      }
    }

    if (isSelectingROI) {
      roiStartRef.current = viewportPoint;
      setROI({ x: viewportPoint.x, y: viewportPoint.y, width: 0, height: 0 });
      redraw();
      return;
    }

    if (isDrawingMode) {
      if (!isInsideAnyROI(viewportPoint)) return;

      switch (activeTool) {
        case 'paintbrush':
        case 'eraser':
          currentStrokeRef.current = {
            points: [{ x: viewportPoint.x, y: viewportPoint.y }],
            color: activeTool === 'eraser' ? 'rgba(0,0,0,0)' : penColor,
            size: penSize,
            isEraser: activeTool === 'eraser',
          };

          // label 추가
          if (!currentStrokeRef.current.isEraser) {
            ensureLabelForCurrentColor();
          }

          redraw();
          break;

        case 'polygon':
          // label 추가
          ensureLabelForCurrentColor();

          if (!currentPolygonRef.current) {
            if (!isInsideAnyROI(viewportPoint)) return;

            currentPolygonRef.current = {
              points: [],
              closed: false,
              color: penColor,
            };
          }

          const points = currentPolygonRef.current.points;
          if (points.length > 2) {
            const first = points[0];
            const firstPixel = viewerInstance.current.viewport.pixelFromPoint(
              new OpenSeadragon.Point(first.x, first.y),
            );
            const mousePixel = viewerInstance.current.viewport.pixelFromPoint(
              new OpenSeadragon.Point(viewportPoint.x, viewportPoint.y),
            );
            const dist = Math.hypot(
              firstPixel.x - mousePixel.x,
              firstPixel.y - mousePixel.y,
            );
            if (dist < 10) {
              const closedPolygon = {
                ...currentPolygonRef.current!,
                closed: true,
              };

              // 현재 상태 스냅샷 저장
              pushRenderSnapshot();

              const prevRenderQueue = renderQueueMap[subProjectId] || [];
              const updatedRenderQueue = [
                ...prevRenderQueue,
                { type: 'polygon', polygon: closedPolygon } as RenderItem,
              ];

              setRenderQueueMap((prev) => ({
                ...prev,
                [subProjectId]: updatedRenderQueue,
              }));

              setPolygons([...polygons, closedPolygon]);
              setRenderSnapshotRedoMap((prev) => ({
                ...prev,
                [subProjectId]: [],
              }));

              setRenderQueueVersion((v) => v + 1);
              redraw();

              // 상태 정리
              currentPolygonRef.current = null;
              currentDrawingROIRef.current = null;
              setMousePosition(null);

              return;
            }
          }

          currentPolygonRef.current.points.push(viewportPoint);
          redraw();
          break;

        case 'point':
          if (e.shiftKey && activeTool === 'point') {
            const clicked = getClickedCellPolygonPoint(x, y);
            if (clicked) {
              const { polygonIndex, pointIndex } = clicked;
              const point = cellPolygons[polygonIndex].points[pointIndex];

              if (!isInsideAnyROI(point)) return;

              selectedCellPolygonPointRef.current = clicked;
              return;
            }
          }
          if (!isInsideAnyROI(viewportPoint)) return;
          ensureLabelForCurrentColor();
          if (
            !currentCellPolygonRef.current ||
            currentCellPolygonRef.current.closed
          ) {
            if (!isInsideAnyROI(viewportPoint)) return;

            currentCellPolygonRef.current = {
              points: [],
              closed: false,
              color: penColor,
            };
          }

          if (currentCellPolygonRef.current?.points.length > 2) {
            const first = currentCellPolygonRef.current.points[0];
            const firstPixel = viewerInstance.current.viewport.pixelFromPoint(
              new OpenSeadragon.Point(first.x, first.y),
            );
            const mousePixel = viewerInstance.current.viewport.pixelFromPoint(
              new OpenSeadragon.Point(viewportPoint.x, viewportPoint.y),
            );

            if (
              Math.hypot(
                firstPixel.x - mousePixel.x,
                firstPixel.y - mousePixel.y,
              ) < 10
            ) {
              currentCellPolygonRef.current.closed = true;
              setCellPolygons([...cellPolygons, currentCellPolygonRef.current]);
              console.log(
                '셀 폴리곤 이미지 좌표:',
                currentCellPolygonRef.current.points.map((pt) =>
                  viewerInstance.current!.viewport.viewportToImageCoordinates(
                    new OpenSeadragon.Point(pt.x, pt.y),
                  ),
                ),
              );
              currentCellPolygonRef.current = null;
              setMousePosition(null);
              redraw();
              currentDrawingROIRef.current = null;
              return;
            }
          }

          currentCellPolygonRef.current.points.push(viewportPoint);
          redraw();
          break;
        default:
          break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const viewportPoint = viewerInstance.current.viewport.pointFromPixel(
      new OpenSeadragon.Point(x, y),
    );

    if (
      isResizingRef.current &&
      resizingHandleRef.current &&
      currentROIRef.current
    ) {
      const updatedROI = { ...currentROIRef.current };
      if (
        updatedROI?.x == null ||
        updatedROI?.y == null ||
        updatedROI?.width == null ||
        updatedROI?.height == null
      ) {
        return;
      }
      switch (resizingHandleRef.current) {
        case 'top-left':
          updatedROI.width += updatedROI.x - viewportPoint.x;
          updatedROI.height += updatedROI.y - viewportPoint.y;
          updatedROI.x = viewportPoint.x;
          updatedROI.y = viewportPoint.y;
          break;
        case 'top-right':
          updatedROI.width = viewportPoint.x - updatedROI.x;
          updatedROI.height += updatedROI.y - viewportPoint.y;
          updatedROI.y = viewportPoint.y;
          break;
        case 'bottom-left':
          updatedROI.width += updatedROI.x - viewportPoint.x;
          updatedROI.x = viewportPoint.x;
          updatedROI.height = viewportPoint.y - updatedROI.y;
          break;
        case 'bottom-right':
          updatedROI.width = viewportPoint.x - updatedROI.x;
          updatedROI.height = viewportPoint.y - updatedROI.y;
          break;
      }
      setROI(updatedROI);
      redrawROICanvas();
      return;
    }

    if (isSelectingROI && roiStartRef.current) {
      const start = roiStartRef.current;
      setROI({
        x: Math.min(start.x, viewportPoint.x),
        y: Math.min(start.y, viewportPoint.y),
        width: Math.abs(viewportPoint.x - start.x),
        height: Math.abs(viewportPoint.y - start.y),
      });
      redraw();
    } else if (isDrawingMode && currentStrokeRef.current) {
      const viewportPoint = viewerInstance.current.viewport.pointFromPixel(
        new OpenSeadragon.Point(x, y),
      );

      if (!isInsideAnyROI(viewportPoint)) return;

      currentStrokeRef.current.points.push({
        x: viewportPoint.x,
        y: viewportPoint.y,
      });

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.save();
      drawStroke(currentStrokeRef.current, viewerInstance.current, ctx);
      ctx.restore();
    } else if (activeTool === 'polygon') {
      setMousePosition(viewportPoint);
      redraw();
    } else if (activeTool === 'point' && currentCellPolygonRef.current) {
      if (!isInsideAnyROI(viewportPoint)) {
        setMousePosition(null);
        redraw();
        return;
      }

      setMousePosition(viewportPoint);
      redraw();
    } else if (
      selectedCellPolygonPointRef.current &&
      activeTool === 'point' &&
      e.shiftKey
    ) {
      if (!isInsideAnyROI(viewportPoint)) {
        setMousePosition(null);
        redraw();
        return;
      }

      const { polygonIndex, pointIndex } = selectedCellPolygonPointRef.current;

      // 새로 그린 폴리곤 수정
      if (polygonIndex < cellPolygons.length) {
        const updated = [...cellPolygons];
        updated[polygonIndex] = {
          ...updated[polygonIndex],
          points: [...updated[polygonIndex].points],
        };
        updated[polygonIndex].points[pointIndex] = viewportPoint;
        setCellPolygons(updated);
      }
      // 불러온 폴리곤 수정
      else {
        const adjustedIndex = polygonIndex - cellPolygons.length;
        const roiIndex = loadedROIs.findIndex(
          (roi) => roi.cell && adjustedIndex < roi.cell.length,
        );
        // if (roiIndex !== -1) {
        //   const updatedLoadedROIs = [...loadedROIs];
        //   const updatedCells = [...(updatedLoadedROIs[roiIndex].cell || [])];
        //   updatedCells[adjustedIndex] = {
        //     ...updatedCells[adjustedIndex],
        //     points: [...updatedCells[adjustedIndex].points],
        //   };
        //   updatedCells[adjustedIndex].points[pointIndex] = viewportPoint;
        //   updatedLoadedROIs[roiIndex].cell = updatedCells;
        //   setLoadedROIs(updatedLoadedROIs);
        // }
      }

      setMousePosition(viewportPoint);
      redraw();
      return;
    }
  };

  const handleMouseUp = () => {
    if (!canvasRef.current || !viewerInstance.current || !subProjectId) return;

    if (selectedCellPolygonPointRef.current) {
      selectedCellPolygonPointRef.current = null;
    }

    const tiledImage = viewerInstance.current.world.getItemAt(0);
    if (!tiledImage) return;

    // ROI 리사이징
    if (isResizingRef.current && currentROIRef.current) {
      const originalROI = currentROIRef.current;
      const index = userDefinedROIs.findIndex(
        (r) =>
          r.x === originalROI.x &&
          r.y === originalROI.y &&
          r.width === originalROI.width &&
          r.height === originalROI.height,
      );
      if (index !== -1 && roi) {
        const updatedROIs = [...userDefinedROIs];
        updatedROIs[index] = roi;
        setUserDefinedROIs(updatedROIs);

        // ROI 안쪽이 아닌 드로잉 제거 (전체 ROI 기준으로 유지)
        const isStrokeInsideAnyROI = (
          stroke: Stroke,
          rois: RoiResponseDto[],
        ) => {
          const validROIs = rois.filter(
            (roi) =>
              typeof roi.x === 'number' &&
              typeof roi.y === 'number' &&
              typeof roi.width === 'number' &&
              typeof roi.height === 'number',
          ) as Required<Pick<RoiResponseDto, 'x' | 'y' | 'width' | 'height'>>[];

          return validROIs.some((roi) =>
            stroke.points.every(
              (p) =>
                p.x >= roi.x &&
                p.x <= roi.x + roi.width &&
                p.y >= roi.y &&
                p.y <= roi.y + roi.height,
            ),
          );
        };

        const isPolygonInsideAnyROI = (
          polygon: Polygon,
          rois: RoiResponseDto[],
        ) => {
          const validROIs = rois.filter(
            (roi) =>
              typeof roi.x === 'number' &&
              typeof roi.y === 'number' &&
              typeof roi.width === 'number' &&
              typeof roi.height === 'number',
          ) as Required<Pick<RoiResponseDto, 'x' | 'y' | 'width' | 'height'>>[];

          return validROIs.some((roi) =>
            polygon.points.every(
              (p) =>
                p.x >= roi.x &&
                p.x <= roi.x + roi.width &&
                p.y >= roi.y &&
                p.y <= roi.y + roi.height,
            ),
          );
        };

        const filteredStrokes = strokes.filter((stroke) =>
          isStrokeInsideAnyROI(stroke, updatedROIs),
        );
        const filteredPolygons = polygons.filter((polygon) =>
          isPolygonInsideAnyROI(polygon, updatedROIs),
        );

        setStrokes(filteredStrokes);
        setPolygons(filteredPolygons);
      }

      isResizingRef.current = false;
      resizingHandleRef.current = null;
      currentROIRef.current = null;
      setIsEditingROI(false);
      return;
    }

    // ROI 생성 중일 때
    if (isSelectingROI) {
      roiStartRef.current = null;
      setIsSelectingROI(false);

      if (roi) {
        const borderOffset =
          viewerInstance.current.viewport.deltaPointsFromPixels(
            new OpenSeadragon.Point(BORDER_THICKNESS, BORDER_THICKNESS),
            true,
          );

        if (
          roi?.x == null ||
          roi?.y == null ||
          roi?.width == null ||
          roi?.height == null
        ) {
          return;
        }

        const adjustedROI = {
          id: -Date.now(),
          x: roi.x + borderOffset.x,
          y: roi.y + borderOffset.y,
          width: roi.width - 2 * borderOffset.x,
          height: roi.height - 2 * borderOffset.y,
        };

        setUserDefinedROIs([...userDefinedROIs, adjustedROI]);
        setROI(null);
      }

      return;
    }

    // 드로잉 모드일 때
    if (isDrawingMode && currentStrokeRef.current) {
      const newStroke = currentStrokeRef.current;

      // 현재 상태 스냅샷 저장
      pushRenderSnapshot();

      const updatedRenderQueue = [
        ...(renderQueueMap[subProjectId] || []),
        { type: 'stroke', stroke: newStroke } as RenderItem,
      ];

      setRenderQueueMap((prev) => ({
        ...prev,
        [subProjectId]: updatedRenderQueue,
      }));

      setStrokes([...strokes, newStroke]);
      setRenderSnapshotRedoMap((prev) => ({
        ...prev,
        [subProjectId]: [],
      }));

      setRenderQueueVersion((v) => v + 1);
      redraw();

      currentStrokeRef.current = null;

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.save();
        drawStroke(newStroke, viewerInstance.current, ctx);
        ctx.restore();
      }
    }
  };

  const handleSetMove = () => {
    setIsDrawingMode(false);
    setIsSelectingROI(false);
    setIsEditingROI(false);
    viewerInstance.current?.setMouseNavEnabled(true);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || activeTool !== 'delete') return;

    if (!viewerInstance.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const allCellPolygons = [
      ...cellPolygons,
      ...loadedROIs.flatMap((roi) => roi.cell ?? []),
    ];

    // for (let i = 0; i < allCellPolygons.length; i++) {
    //   const poly = allCellPolygons[i];
    //   for (const pt of poly.points) {
    //     const pixel = viewerInstance.current.viewport.pixelFromPoint(
    //       new OpenSeadragon.Point(pt.x, pt.y),
    //     );
    //     const dist = Math.hypot(pixel.x - x, pixel.y - y);
    //     if (dist <= 6) {
    //       const source = i < cellPolygons.length ? 'new' : 'loaded';
    //       const polygonIndex =
    //         i < cellPolygons.length ? i : i - cellPolygons.length;
    //       setSelectedPolygonForDeletion({ source, polygonIndex });
    //       return;
    //     }
    //   }
    // }
  };

  /* =============================================
      어노테이션 도구 및 핸들러
  ============================================== */
  const handleSelectTool = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleToggleAnnotationMode = (): boolean => {
    if (
      !isDrawingMode &&
      !roi &&
      loadedROIs.length === 0 &&
      userDefinedROIs.length === 0
    ) {
      alert('먼저 ROI를 선택하세요.');
      return false;
    }

    if (!isDrawingMode) {
      setRenderQueueUndoMap((prev) => ({ ...prev, [subProjectId]: [] }));
      setRenderQueueRedoMap((prev) => ({ ...prev, [subProjectId]: [] }));
      setIsDrawingMode(true);
      setIsSelectingROI(false);
      setIsEditingROI(false);
      viewerInstance.current?.setMouseNavEnabled(false);
    } else {
      setIsDrawingMode(false);
      viewerInstance.current?.setMouseNavEnabled(true);
    }
    return true;
  };

  const handleSelectROI = () => {
    setIsSelectingROI(true);
    setIsEditingROI(false);
    setIsDrawingMode(false);
    viewerInstance.current?.setMouseNavEnabled(true);
  };

  const handleDeleteROI = (index: number) => {
    if (!subProjectId || !viewerInstance.current) return;

    const inferredCount = getAllViewportROIs(
      viewerInstance.current,
      loadedROIs,
    ).length;

    if (index < inferredCount) {
      // 모델 ROI 삭제
      const newLoadedROIs = [...loadedROIs];
      newLoadedROIs.splice(index, 1);
      setLoadedROIs(newLoadedROIs);
    } else {
      const adjustedIndex = index - inferredCount;
      const deletedROI = userDefinedROIs[adjustedIndex];
      if (!deletedROI) return;

      const { x, y, width, height } = deletedROI;
      if (x == null || y == null || width == null || height == null) {
        return;
      }
      const xMin = x;
      const xMax = x + width;
      const yMin = y;
      const yMax = y + height;

      const filteredStrokes = strokes.filter((stroke) =>
        stroke.points.every(
          (p) => p.x < xMin || p.x > xMax || p.y < yMin || p.y > yMax,
        ),
      );

      const filteredPolygons = polygons.filter((polygon) =>
        polygon.points.every(
          (p) => p.x < xMin || p.x > xMax || p.y < yMin || p.y > yMax,
        ),
      );

      const updatedROIs = [...userDefinedROIs];
      updatedROIs.splice(adjustedIndex, 1);

      setRenderQueueUndoMap((prev) => ({
        ...prev,
        [subProjectId]: [
          ...(prev[subProjectId] || []),
          [...(renderQueueMap[subProjectId] || [])],
        ],
      }));
      setRenderQueueRedoMap((prev) => ({
        ...prev,
        [subProjectId]: [],
      }));
      setUserDefinedROIs(updatedROIs);
      setStrokes(filteredStrokes);
      setPolygons(filteredPolygons);
      setROI(null);
      redraw();
    }
  };

  const handleFocusROI = (index: number) => {
    if (!viewerInstance.current) return;

    const viewer = viewerInstance.current.viewport;
    const tiledImage = viewerInstance.current.world.getItemAt(0);
    if (!tiledImage) return;

    const roi = imageAllROIs[index];
    if (
      roi?.x == null ||
      roi?.y == null ||
      roi?.width == null ||
      roi?.height == null
    ) {
      return;
    }
    const imageCenter = new OpenSeadragon.Point(
      roi.x + roi.width / 2,
      roi.y + roi.height / 2,
    );

    const viewportPoint = tiledImage.imageToViewportCoordinates(imageCenter);
    viewer.panTo(viewportPoint);
  };

  const handleEditROI = (index: number) => {
    if (
      isDrawingMode ||
      currentStrokeRef.current ||
      currentPolygonRef.current
    ) {
      alert('어노테이션 중에는 ROI를 수정할 수 없습니다.');
      return;
    }

    const inferredCount = getAllViewportROIs(
      viewerInstance.current,
      loadedROIs,
    ).length;

    const adjustedIndex = index - inferredCount;
    const selectedROI = userDefinedROIs[adjustedIndex];
    if (selectedROI) {
      setROI(selectedROI);
      setIsEditingROI(true);
    }
  };

  const confirmDeletePolygon = () => {
    if (!selectedPolygonForDeletion) return;

    if (selectedPolygonForDeletion.source === 'new') {
      const updated = [...cellPolygons];
      updated.splice(selectedPolygonForDeletion.polygonIndex, 1);
      setCellPolygons(updated);
    } else {
      const updatedLoadedROIs = [...loadedROIs];
      const roiIndex = updatedLoadedROIs.findIndex(
        (roi) =>
          roi.cell && selectedPolygonForDeletion.polygonIndex < roi.cell.length,
      );
      if (roiIndex !== -1) {
        const updatedCells = [...(updatedLoadedROIs[roiIndex].cell || [])];
        updatedCells.splice(selectedPolygonForDeletion.polygonIndex, 1);
        updatedLoadedROIs[roiIndex].cell = updatedCells;
        setLoadedROIs(updatedLoadedROIs);
      }
    }

    setSelectedPolygonForDeletion(null);
    redraw();
  };

  const handleReset = () => {
    if (!subProjectId) return;

    // 현재 상태 스냅샷 저장
    pushRenderSnapshot();

    // 상태 초기화
    setRenderQueueMap((prev) => ({
      ...prev,
      [subProjectId]: [],
    }));

    setStrokes([]);
    setPolygons([]);
    setCellPolygons([]);
    setRenderSnapshotRedoMap((prev) => ({
      ...prev,
      [subProjectId]: [],
    }));

    currentStrokeRef.current = null;
    currentPolygonRef.current = null;
    currentCellPolygonRef.current = null;
    setROI(null);

    setRenderQueueVersion((v) => v + 1);
    redraw();
  };

  const handleUndo = () => {
    const undoStack = renderSnapshotUndoMap[subProjectId] || [];
    if (undoStack.length === 0) return;

    const lastSnapshot = undoStack[undoStack.length - 1];
    setRenderSnapshotRedoMap((prev) => ({
      ...prev,
      [subProjectId]: [
        ...(renderSnapshotRedoMap[subProjectId] || []),
        {
          renderQueue: deepCopyRenderQueue(renderQueueMap[subProjectId] || []),
          strokes: deepCopyStrokes(strokesMap[subProjectId] || []),
          polygons: deepCopyPolygons(polygonsMap[subProjectId] || []),
        },
      ],
    }));

    setRenderSnapshotUndoMap((prev) => ({
      ...prev,
      [subProjectId]: undoStack.slice(0, undoStack.length - 1),
    }));

    restoreRenderSnapshot(lastSnapshot);
  };

  const handleRedo = () => {
    const redoStack = renderSnapshotRedoMap[subProjectId] || [];
    if (redoStack.length === 0) return;

    const nextSnapshot = redoStack[redoStack.length - 1];
    setRenderSnapshotUndoMap((prev) => ({
      ...prev,
      [subProjectId]: [
        ...(renderSnapshotUndoMap[subProjectId] || []),
        {
          renderQueue: deepCopyRenderQueue(renderQueueMap[subProjectId] || []),
          strokes: deepCopyStrokes(strokesMap[subProjectId] || []),
          polygons: deepCopyPolygons(polygonsMap[subProjectId] || []),
        },
      ],
    }));

    setRenderSnapshotRedoMap((prev) => ({
      ...prev,
      [subProjectId]: redoStack.slice(0, redoStack.length - 1),
    }));

    restoreRenderSnapshot(nextSnapshot);
  };

  // ESC로 polygon 모드 취소 + ROI 리사이징 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isResizingRef.current && currentROIRef.current) {
          setROI(currentROIRef.current); // 복원
          currentROIRef.current = null;
          isResizingRef.current = false;
          resizingHandleRef.current = null;
          redrawROICanvas();
        }

        currentPolygonRef.current = null;
        setMousePosition(null);
        redraw();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redraw]);

  /* =============================================
      렌더링
  ============================================== */
  return (
    <div className="flex h-full w-screen overflow-hidden">
      <AnnotationSidebar
        rois={imageAllROIs}
        onClickROI={handleFocusROI}
        onDeleteROI={handleDeleteROI}
        onEditROI={handleEditROI}
        labels={labels}
        onRenameLabel={handleRenameLabel}
        onDeleteLabel={handleDeleteLabel}
        onSelectLabelColor={(color) => setPenColor(color)}
        onReorderLabels={handleReorderLabels}
      />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <div className="my-10 flex w-full flex-row items-center justify-between space-x-3 px-10">
          {isDrawingMode ? (
            <AnnotationTool
              modelType={modelType}
              isActive={isDrawingMode}
              activeTool={activeTool}
              onSelectTool={handleSelectTool}
              penColor={penColor}
              penSize={penSize}
              onChangePenColor={setPenColor}
              onChangePenSize={setPenSize}
            />
          ) : (
            <div className="flex w-14 flex-col items-center justify-center" />
          )}
          <div className="relative h-[550px] w-[900px] border bg-white">
            <div ref={viewerRef} className="absolute z-0 h-full w-full" />
            {showPreviewDot && (
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
                style={{
                  width: penSize,
                  height: penSize,
                  backgroundColor: penColor,
                }}
              />
            )}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 z-10 ${
                isDrawingMode || isSelectingROI
                  ? 'pointer-events-auto'
                  : 'pointer-events-none'
              }`}
              style={{
                opacity: 0.5,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseOut={handleMouseUp}
            />
            <canvas
              ref={cellCanvasRef}
              className={`absolute inset-0 z-10 ${
                isDrawingMode && activeTool === 'delete'
                  ? 'pointer-events-auto'
                  : 'pointer-events-none'
              }`}
              onDoubleClick={handleDoubleClick}
            />
            <canvas
              ref={roiCanvasRef}
              className={`absolute inset-0 z-20 ${
                isEditingROI ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              style={{
                cursor: isEditingROI ? 'crosshair' : 'default',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseOut={handleMouseUp}
            />
          </div>
          <AnnotationControlPanel
            onToggleAnnotationMode={handleToggleAnnotationMode}
            onSetMove={handleSetMove}
            onSelectROI={handleSelectROI}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
          />
        </div>

        <AnnotationSubProjectSlider
          subProjects={subProjects}
          selected={subProject}
          onSelect={setSubProject}
        />
      </div>

      <AnnotationCellDeleteModal
        open={selectedPolygonForDeletion !== null}
        onClose={() => setSelectedPolygonForDeletion(null)}
        onConfirmDelete={confirmDeletePolygon}
      />
    </div>
  );
};

export default AnnotationViewer;
