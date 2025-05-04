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
import { syncCanvasWithOSD, redrawCanvas } from '@/utils/canvas-utils';
import { processMaskTile } from '@/utils/canvas-image-utils';
import {
  getAllViewportROIs,
  isPointInsideROIs,
  drawROIs,
} from '@/utils/canvas-roi-utils';
import {
  deepCopyStrokes,
  drawStroke,
  subtractStroke,
} from '@/utils/canvas-drawing-utils';
import { Point, Stroke, ROI, LoadedROI, Polygon } from '@/types/annotation';
import { SubProject } from '@/types/project-schema';
import { dummyInferenceResults } from '@/data/dummy';
import AnnotationSidebar from '@/components/annotation/annotation-sidebar';
import AnnotationSubProjectSlider from '@/components/annotation/annotation-subproject-slider';
import { convertViewportROIToImageROI } from '@/hooks/use-viewport-to-image';
import { Label } from '@/types/annotation-sidebar';

// ROI 선 두께 상수
const BORDER_THICKNESS = 2;

type Tool = 'circle' | 'polygon' | 'paintbrush' | 'eraser' | null;

const AnnotationViewer: React.FC<{
  subProject: SubProject | null;
  setSubProject: (sp: SubProject) => void;
  subProjects: SubProject[];
  inferenceResult: (typeof dummyInferenceResults)[number] | null;
  modelType?: string;
}> = ({
  subProject,
  setSubProject,
  subProjects,
  inferenceResult,
  modelType = 'MULTI',
}) => {
  /* =============================================
      Ref 및 State 선언
  ============================================== */
  // OpenSeadragon 뷰어 및 캔버스 Ref
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerInstance = useOsdviewer(viewerRef);

  // ROI/드로잉 도중의 마우스 상태 및 임시 객체들 Ref
  const roiStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const currentPolygonRef = useRef<Polygon | null>(null);
  const isRedoingRef = useRef(false);

  // 드로잉 도구 관련 상태
  const [penColor, setPenColor] = useState('#FF0000');
  const [penSize, setPenSize] = useState(10);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

  // 현재 선택 중인 ROI 및 모드 상태
  const [roi, setROI] = useState<ROI | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isSelectingROI, setIsSelectingROI] = useState(false);

  // 모델 추론으로부터 로딩된 ROI
  const [loadedROIs, setLoadedROIs] = useState<LoadedROI[]>([]);

  // 서브프로젝트 단위로 관리되는 상태들 (key = subProject.id)
  const [userDefinedROIsMap, setUserDefinedROIsMap] = useState<
    Record<number, ROI[]>
  >({});
  const [strokesMap, setStrokesMap] = useState<Record<number, Stroke[]>>({});
  const [polygonsMap, setPolygonsMap] = useState<Record<number, Polygon[]>>({});
  const [undoMap, setUndoMap] = useState<Record<number, Stroke[][]>>({});
  const [redoMap, setRedoMap] = useState<Record<number, Stroke[][]>>({});

  // 현재 서브프로젝트 ID 기준 상태 접근
  const subProjectId = subProject?.id ?? -1;

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
  const undoStack = useMemo(
    () => undoMap[subProjectId] || [],
    [undoMap, subProjectId],
  );
  const redoStack = useMemo(
    () => redoMap[subProjectId] || [],
    [redoMap, subProjectId],
  );

  // 현재 서브프로젝트 ID 기준 상태 업데이트 함수들
  const setUserDefinedROIs = (rois: ROI[]) => {
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

  const setUndoStack = (s: Stroke[][]) => {
    if (subProjectId == null) return;
    setUndoMap((prev) => ({ ...prev, [subProjectId]: s }));
  };

  const setRedoStack = (s: Stroke[][]) => {
    if (subProjectId == null) return;
    setRedoMap((prev) => ({ ...prev, [subProjectId]: s }));
  };

  // 1. allROIs : 불러온 ROI + 사용자 정의 ROI (viewport 기준)
  const allROIs = useMemo(() => {
    if (!viewerInstance.current) return userDefinedROIs;
    const inferredROIs = getAllViewportROIs(viewerInstance.current, loadedROIs);
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
  const [labels, setLabels] = useState<Label[]>([]);

  // label 이름 수정
  const handleRenameLabel = (id: string, newName: string) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, name: newName } : label,
      ),
    );
  };

  // label 이름 삭제
  const handleDeleteLabel = (id: string) => {
    setLabels((prev) => prev.filter((label) => label.id !== id));
  };

  // label 추가
  const ensureLabelForCurrentColor = () => {
    setLabels((prev) => {
      const exists = prev.find((l) => l.color === penColor);
      if (!exists) {
        const newLabel: Label = {
          id: crypto.randomUUID(),
          name: `Label ${prev.length + 1}`,
          color: penColor,
          createdAt: Date.now(),
          order: prev.length,
        };
        return [...prev, newLabel];
      }
      return prev;
    });
  };

  // label의 순서 변경
  const handleReorderLabels = (reordered: Label[]) => {
    setLabels(reordered);
  };

  // roi 수정
  // const currentROIRef = useRef<ROI | null>(null);
  // const isResizingRef = useRef(false);
  // const resizingHandleRef = useRef<
  //   'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null
  // >(null);
  //
  // const getResizeHandleUnderCursor = (
  //   mouse: { x: number; y: number },
  //   roi: ROI,
  //   viewportPixelFromPoint: (pt: { x: number; y: number }) => {
  //     x: number;
  //     y: number;
  //   },
  // ): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null => {
  //   const threshold = 10;
  //
  //   const corners = {
  //     'top-left': { x: roi.x, y: roi.y },
  //     'top-right': { x: roi.x + roi.width, y: roi.y },
  //     'bottom-left': { x: roi.x, y: roi.y + roi.height },
  //     'bottom-right': { x: roi.x + roi.width, y: roi.y + roi.height },
  //   };
  //
  //   for (const [handle, pt] of Object.entries(corners)) {
  //     const pixel = viewportPixelFromPoint(pt);
  //     const dist = Math.hypot(pixel.x - mouse.x, pixel.y - mouse.y);
  //     if (dist <= threshold) return handle as any;
  //   }
  //
  //   return null;
  // };

  /* =============================================
      모델 타입별 디폴트 어노테이션 도구
  ============================================== */
  const getDefaultToolByModel = (modelType: string): Tool => {
    switch (modelType) {
      case 'CELL':
      case 'MULTI':
        return 'circle';
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
      초기화 및 타일소스 로딩
  ============================================== */
  useEffect(() => {
    if (!inferenceResult) {
      setLoadedROIs([]);
      return;
    }
    const load = async () => {
      const roiData = await Promise.all(
        inferenceResult.results.map(async (res) => {
          const tiles = await Promise.all(
            res.maskUrl.map((u) => processMaskTile(res, u)),
          );
          return {
            bbox: { x: res.x, y: res.y, w: res.width, h: res.height },
            tiles,
          };
        }),
      );
      setLoadedROIs(roiData);
    };
    load();
  }, [inferenceResult]);

  /* =============================================
      subProject가 바뀌면 ROI 초기화
  ============================================== */
  useEffect(() => {
    setLoadedROIs([]);
    setROI(null);
  }, [subProject]);

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
    );
  }, [
    viewerInstance,
    roiCanvasRef,
    roi,
    userDefinedROIs,
    loadedROIs,
    isSelectingROI,
  ]);

  useEffect(() => {
    redrawROICanvas();
  }, [roi, userDefinedROIs, isSelectingROI, redrawROICanvas]);

  /* =============================================
      모델 ROI가 준비되면 첫 번째 ROI를 자동으로 선택
  ============================================== */
  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer || !loadedROIs.length) return;
    const tiledImage = viewer.world.getItemAt(0);
    const applyROI = (img: any) => {
      const bbox = loadedROIs[0].bbox;
      const tl = img.imageToViewportCoordinates(
        new OpenSeadragon.Point(bbox.x, bbox.y),
      );
      const br = img.imageToViewportCoordinates(
        new OpenSeadragon.Point(bbox.x + bbox.w, bbox.y + bbox.h),
      );
      setROI({ x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y });
    };
    if (!tiledImage) {
      const retry = setTimeout(() => {
        const newTiledImage = viewer.world.getItemAt(0);
        if (newTiledImage) applyROI(newTiledImage);
      }, 500);
      return () => clearTimeout(retry);
    } else applyROI(tiledImage);
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
      strokes,
      currentStrokeRef.current,
      polygons,
      currentPolygonRef.current,
      mousePosition,
    );
  }, [viewerInstance, canvasRef, loadedROIs, strokes, polygons, mousePosition]);

  const syncCanvas = useCallback(() => {
    if (!viewerInstance.current || !canvasRef.current) return;
    syncCanvasWithOSD(viewerInstance.current, canvasRef, redraw);
  }, [viewerInstance, canvasRef, redraw]);

  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer) return;
    const updateHandler = () => {
      syncCanvas();
      redrawROICanvas();
    };
    viewer.addHandler('animation', updateHandler);
    viewer.addHandler('zoom', updateHandler);
    viewer.addHandler('pan', updateHandler);
    window.addEventListener('resize', updateHandler);
    updateHandler();
    return () => {
      viewer.removeHandler('animation', updateHandler);
      viewer.removeHandler('zoom', updateHandler);
      viewer.removeHandler('pan', updateHandler);
      window.removeEventListener('resize', updateHandler);
    };
  }, [viewerInstance, syncCanvas, redrawROICanvas]);

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
    OpenSeadragon.GeoTIFFTileSource.getAllTileSources(subProject.svsPath).then(
      ([tileSource]: [any]) => {
        if (tileSource) {
          viewer.addTiledImage({ tileSource });
        }
      },
    );
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

    // if (roi && !isDrawingMode && !isSelectingROI) {
    //   const mousePixel = { x, y };
    //   const handle = getResizeHandleUnderCursor(mousePixel, roi, (pt) =>
    //     viewerInstance.current!.viewport.pixelFromPoint(
    //       new OpenSeadragon.Point(pt.x, pt.y),
    //     ),
    //   );
    //   if (handle) {
    //     isResizingRef.current = true;
    //     resizingHandleRef.current = handle;
    //     currentROIRef.current = { ...roi }; // 기준 ROI 보관
    //     e.preventDefault();
    //     return;
    //   }
    // }

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
              currentPolygonRef.current.points.push(first);
              currentPolygonRef.current.closed = true;
              polygons.push(currentPolygonRef.current);
              currentPolygonRef.current = null;
              setMousePosition(null);
              redraw();
              return;
            }
          }
          currentPolygonRef.current.points.push(viewportPoint);
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

    // if (
    //   isResizingRef.current &&
    //   resizingHandleRef.current &&
    //   currentROIRef.current
    // ) {
    //   const updatedROI = { ...currentROIRef.current };
    //   switch (resizingHandleRef.current) {
    //     case 'top-left':
    //       updatedROI.width += updatedROI.x - viewportPoint.x;
    //       updatedROI.height += updatedROI.y - viewportPoint.y;
    //       updatedROI.x = viewportPoint.x;
    //       updatedROI.y = viewportPoint.y;
    //       break;
    //     case 'top-right':
    //       updatedROI.width = viewportPoint.x - updatedROI.x;
    //       updatedROI.height += updatedROI.y - viewportPoint.y;
    //       updatedROI.y = viewportPoint.y;
    //       break;
    //     case 'bottom-left':
    //       updatedROI.width += updatedROI.x - viewportPoint.x;
    //       updatedROI.x = viewportPoint.x;
    //       updatedROI.height = viewportPoint.y - updatedROI.y;
    //       break;
    //     case 'bottom-right':
    //       updatedROI.width = viewportPoint.x - updatedROI.x;
    //       updatedROI.height = viewportPoint.y - updatedROI.y;
    //       break;
    //   }
    //   setROI(updatedROI);
    //   redrawROICanvas();
    //   return;
    // }

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

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      drawStroke(currentStrokeRef.current, viewerInstance.current, ctx);
      ctx.restore();
    } else if (activeTool === 'polygon') {
      setMousePosition(viewportPoint);
      redraw();
    }
  };

  const handleMouseUp = () => {
    if (!canvasRef.current || !viewerInstance.current || !subProjectId) return;

    const tiledImage = viewerInstance.current.world.getItemAt(0);
    if (!tiledImage) return;

    // if (isResizingRef.current && currentROIRef.current) {
    //   const originalROI = currentROIRef.current;
    //   const index = userDefinedROIs.findIndex(
    //     (r) =>
    //       r.x === originalROI.x &&
    //       r.y === originalROI.y &&
    //       r.width === originalROI.width &&
    //       r.height === originalROI.height,
    //   );
    //   if (index !== -1) {
    //     const newROIs = [...userDefinedROIs];
    //     newROIs[index] = roi!; // 현재 조정된 ROI로 저장
    //     setUserDefinedROIs(newROIs);
    //   }
    //   isResizingRef.current = false;
    //   resizingHandleRef.current = null;
    //   currentROIRef.current = null;
    //   return;
    // }

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

        const adjustedROI = {
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
      const isEraser = currentStrokeRef.current.isEraser;
      const prevStrokes = deepCopyStrokes(strokes);
      setUndoStack([...undoStack, prevStrokes]);
      setRedoStack([]);

      if (isEraser) {
        const eraserStroke = currentStrokeRef.current;

        const pencilStrokes = strokes.filter((s) => !s.isEraser);
        const oldEraserStrokes = strokes.filter((s) => s.isEraser);

        const updatedStrokes: Stroke[] = [];

        for (const pencilStroke of pencilStrokes) {
          const segs = subtractStroke(
            pencilStroke,
            eraserStroke,
            viewerInstance.current,
            canvasRef.current,
          );
          updatedStrokes.push(...segs);
        }

        const newStrokes = [
          ...updatedStrokes,
          ...oldEraserStrokes,
          eraserStroke,
        ];

        setStrokes(newStrokes);
      } else {
        setStrokes([...strokes, currentStrokeRef.current]);
      }

      currentStrokeRef.current = null;
      redraw();
    }
  };

  const handleSetMove = () => {
    setIsDrawingMode(false);
    setIsSelectingROI(false);
    viewerInstance.current?.setMouseNavEnabled(true);
  };

  /* =============================================
      어노테이션 도구 및 핸들러
  ============================================== */
  const handleSelectTool = (tool: Tool) => {
    setActiveTool(tool);
    console.log('어노테이션 도구: ', activeTool);
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
      setUndoStack([]);
      setRedoStack([]);
      setIsDrawingMode(true);
      setIsSelectingROI(false);
      viewerInstance.current?.setMouseNavEnabled(false);
    } else {
      setIsDrawingMode(false);
      viewerInstance.current?.setMouseNavEnabled(true);
    }
    return true;
  };

  const handleSelectROI = () => {
    setIsSelectingROI(true);
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

      setUndoStack([...undoStack, deepCopyStrokes(strokes)]);
      setRedoStack([]);
      setUserDefinedROIs(updatedROIs);
      setStrokes(filteredStrokes);
      setPolygons(filteredPolygons);
      setROI(null);
      redraw();
    }
  };

  const handleReset = () => {
    if (!subProjectId) return;

    setUndoStack([...undoStack, deepCopyStrokes(strokes)]);
    setRedoStack([]);
    setStrokes([]);
    currentStrokeRef.current = null;
    setPolygons([]);
    currentPolygonRef.current = null;
    setROI(null);
    redraw();
  };

  const handleUndo = () => {
    if (!subProjectId) return;
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, deepCopyStrokes(strokes)]);
    setStrokes(deepCopyStrokes(lastState));
    setUndoStack(undoStack.slice(0, undoStack.length - 1));
    redraw();
  };

  const handleRedo = () => {
    if (!subProjectId || isRedoingRef.current || redoStack.length === 0) return;

    isRedoingRef.current = true;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, deepCopyStrokes(strokes)]);
    setStrokes(deepCopyStrokes(nextState));
    setRedoStack(redoStack.slice(0, redoStack.length - 1));
    redraw();
    isRedoingRef.current = false;
  };

  // ESC로 polygon 모드 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        currentPolygonRef.current = null;
        setMousePosition(null);
        redraw();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [redraw]);

  /* =============================================
      렌더링
  ============================================== */
  return (
    <div className="flex h-full w-screen overflow-hidden">
      <AnnotationSidebar
        rois={imageAllROIs}
        onDeleteROI={handleDeleteROI}
        onEditROI={(index) => {
          // const inferredCount = getAllViewportROIs(
          //   viewerInstance.current,
          //   loadedROIs,
          // ).length;
          //
          // if (index < inferredCount) {
          //   // 모델 ROI는 현재 편집 비허용 상태라면 무시 (or alert)
          //   alert('모델 ROI는 수정할 수 없습니다.');
          //   return;
          // }
          // const adjustedIndex = index - inferredCount;
          // const selectedROI = userDefinedROIs[adjustedIndex];
          // if (selectedROI) {
          //   setROI(selectedROI); // ROI 선택 (모서리 조절용)
          // }
          console.log('roi 사이즈 수정');
        }}
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
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 z-10 ${
                isDrawingMode || isSelectingROI
                  ? 'pointer-events-auto'
                  : 'pointer-events-none'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseOut={handleMouseUp}
            />
            <canvas
              ref={roiCanvasRef}
              className="pointer-events-none absolute inset-0 z-20"
              // className={`absolute inset-0 z-20 ${
              //   roi ? 'pointer-events-auto' : 'pointer-events-none'
              // }`}
              // onMouseDown={handleMouseDown}
              // onMouseMove={handleMouseMove}
              // onMouseUp={handleMouseUp}
              // onMouseOut={handleMouseUp}
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
    </div>
  );
};

export default AnnotationViewer;
