'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import { useOsdviewer } from '@/hooks/use-osdviewer';
import AnnotationTool from '@/components/annotation/annotation-tool';
import AnnotationControlPanel from '@/components/annotation/annotation-control-panel';
import { syncCanvasWithOSD, redrawCanvas } from '@/utils/canvas-utils';
import { processMaskTile, exportROIAsPNG } from '@/utils/canvas-image-utils';
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
import { Button } from '@/components/ui/button';
import { SubProject } from '@/types/project-schema';
import { dummyInferenceResult } from '@/data/dummy';
import AnnotationSidebar from '@/components/annotation/annotation-sidebar';
import AnnotationSubProjectSlider from '@/components/annotation/annotation-subproject-slider';

// ROI 선 두께 상수
const BORDER_THICKNESS = 2;

type Tool = 'circle' | 'polygon' | 'paintbrush' | 'eraser' | null;

const AnnotationViewer: React.FC<{
  subProject: SubProject;
  inferenceResult: typeof dummyInferenceResult;
  modelType?: string;
}> = ({ subProject, inferenceResult, modelType = 'MULTI' }) => {
  /* ================================
     Ref 및 State 선언
  ================================== */
  // 뷰어 및 캔버스 참조
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerInstance = useOsdviewer(viewerRef);

  // 드로잉/어노테이션 관련
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#FF0000');
  const [penSize, setPenSize] = useState<number>(10);

  // Polygon 관련 상태
  const polygonsRef = useRef<Polygon[]>([]);
  const currentPolygonRef = useRef<Polygon | null>(null);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

  // ROI 관련 상태
  const roiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSelectingROI, setIsSelectingROI] = useState<boolean>(false);
  const [roi, setROI] = useState<ROI | null>(null);
  const [userDefinedROIs, setUserDefinedROIs] = useState<ROI[]>([]);
  const [loadedROIs, setLoadedROIs] = useState<LoadedROI[]>([]);
  const roiStartRef = useRef<{ x: number; y: number } | null>(null);

  // Undo / Redo 스택
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const isRedoingRef = useRef(false);

  // 모델 타입별 디폴트 어노테이션 도구 (셀/멀티 -> circle, 티슈 -> ploygon)
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

  // 사용할 어노테이션 도구
  const [activeTool, setActiveTool] = useState<Tool>(() =>
    getDefaultToolByModel(modelType),
  );

  /* ================================
      초기화 및 타일소스 로딩
  ================================== */
  useEffect(() => {
    const load = async () => {
      const roiPromises = inferenceResult.results.map(async (res) => {
        const tiles = await Promise.all(
          res.maskUrl.map((u) => processMaskTile(res, u)),
        );
        return {
          bbox: { x: res.x, y: res.y, w: res.width, h: res.height },
          tiles,
        };
      });
      setLoadedROIs(await Promise.all(roiPromises));
    };
    load();
  }, [inferenceResult]);

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
    if (!tiledImage) {
      const retry = setTimeout(() => {
        const newTiledImage = viewer.world.getItemAt(0);
        if (!newTiledImage?.imageToViewportCoordinates) return;

        const bbox = loadedROIs[0].bbox;
        const tlImg = new OpenSeadragon.Point(bbox.x, bbox.y);
        const brImg = new OpenSeadragon.Point(bbox.x + bbox.w, bbox.y + bbox.h);
        const tlVp = newTiledImage.imageToViewportCoordinates(tlImg);
        const brVp = newTiledImage.imageToViewportCoordinates(brImg);
        const viewportROI = {
          x: tlVp.x,
          y: tlVp.y,
          width: brVp.x - tlVp.x,
          height: brVp.y - tlVp.y,
        };
        setROI(viewportROI);
      }, 500);

      return () => clearTimeout(retry);
    }

    const bbox = loadedROIs[0].bbox;
    const tlImg = new OpenSeadragon.Point(bbox.x, bbox.y);
    const brImg = new OpenSeadragon.Point(bbox.x + bbox.w, bbox.y + bbox.h);
    const tlVp = viewer.viewport.imageToViewportCoordinates(tlImg);
    const brVp = viewer.viewport.imageToViewportCoordinates(brImg);
    const viewportROI = {
      x: tlVp.x,
      y: tlVp.y,
      width: brVp.x - tlVp.x,
      height: brVp.y - tlVp.y,
    };
    setROI(viewportROI);
  }, [viewerInstance, loadedROIs]);

  /* ================================
     핸들러 및 헬퍼 함수
  ================================== */
  const isInsideAnyROI = (pt: Point): boolean => {
    if (!viewerInstance.current) return false;
    const allROIs = [
      ...getAllViewportROIs(viewerInstance.current, loadedROIs),
      ...userDefinedROIs,
    ];
    return isPointInsideROIs(pt, allROIs);
  };

  /* ================================
     캔버스 및 뷰어 동기화
  ================================== */
  const redraw = useCallback(() => {
    if (!viewerInstance.current) return;
    redrawCanvas(
      viewerInstance.current,
      canvasRef,
      loadedROIs,
      strokesRef.current,
      currentStrokeRef.current,
      polygonsRef.current,
      currentPolygonRef.current,
      mousePosition,
    );
  }, [viewerInstance, canvasRef, loadedROIs, mousePosition]);

  const syncCanvas = useCallback(() => {
    if (!viewerInstance.current || !canvasRef.current) return;
    syncCanvasWithOSD(viewerInstance.current, canvasRef, redraw);
  }, [viewerInstance, canvasRef, redraw]);

  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer) return;

    const updateHandler = () => {
      syncCanvas(); // 드로잉 캔버스 위치/크기 맞추기
      drawROIs(
        // ROI 실선 다시 그리기
        viewerInstance.current,
        roiCanvasRef.current,
        roi,
        userDefinedROIs,
        loadedROIs,
        isSelectingROI,
      );
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
  }, [
    viewerInstance,
    syncCanvas,
    roi,
    userDefinedROIs,
    loadedROIs,
    isSelectingROI,
  ]);

  /* ===========================================
   타일소스 로딩 useEffect – param 기반으로 수정
  =========================================== */
  useEffect(() => {
    if (!viewerInstance.current || !subProject) return;

    const loadTileSource = async () => {
      try {
        const tiffTileSources =
          await OpenSeadragon.GeoTIFFTileSource.getAllTileSources(
            subProject.svsPath,
          );

        if (tiffTileSources.length > 0) {
          viewerInstance.current.addTiledImage({
            tileSource: tiffTileSources[0],
          });
          console.log('타일 소스 추가 완료');
        } else {
          console.warn('SVS 파일을 읽었지만 타일소스가 없습니다.');
        }
      } catch (error) {
        console.error('타일 소스 로드 실패:', error);
      }
    };

    loadTileSource();
  }, [viewerInstance, subProject]);

  /* ================================
     마우스 이벤트 핸들러
  ================================== */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const viewportPoint = viewerInstance.current.viewport.pointFromPixel(
      new OpenSeadragon.Point(x, y),
    );

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
          redraw();
          break;

        case 'polygon':
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
              polygonsRef.current.push(currentPolygonRef.current);
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
    }
  };

  const handleMouseUp = () => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const tiledImage = viewerInstance.current.world.getItemAt(0);
    if (!tiledImage) return;

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

        setUserDefinedROIs((prev) => [...prev, adjustedROI]);
        setROI(null);
      }

      return;
    }

    if (isDrawingMode && currentStrokeRef.current) {
      const isEraser = currentStrokeRef.current.isEraser;
      const prevStrokes = deepCopyStrokes(strokesRef.current);
      setUndoStack((prev) => [...prev, prevStrokes]);
      setRedoStack([]);

      if (isEraser) {
        const eraserStroke = currentStrokeRef.current;

        const pencilStrokes = strokesRef.current.filter((s) => !s.isEraser);
        const oldEraserStrokes = strokesRef.current.filter((s) => s.isEraser);

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

        strokesRef.current = [
          ...updatedStrokes,
          ...oldEraserStrokes,
          eraserStroke,
        ];
      } else {
        strokesRef.current.push(currentStrokeRef.current);
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

  /* ================================
     어노테이션 도구 및 핸들러
  ================================== */
  // 어노테이션 도구 선택 함수
  const handleSelectTool = (tool: Tool) => {
    setActiveTool(tool);
    console.log('어노테이션 도구: ', activeTool);
  };

  const handleToggleAnnotationMode = (): boolean => {
    if (!isDrawingMode && !roi && loadedROIs.length === 0) {
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

  const handleDeleteROI = () => {
    setUndoStack((prev) => [...prev, deepCopyStrokes(strokesRef.current)]);
    setRedoStack([]);
    setROI(null);
    redraw();
  };

  const handleReset = () => {
    setUndoStack((prev) => [...prev, deepCopyStrokes(strokesRef.current)]);
    setRedoStack([]);
    strokesRef.current = [];
    currentStrokeRef.current = null;
    polygonsRef.current = [];
    currentPolygonRef.current = null;
    setROI(null);
    redraw();
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, deepCopyStrokes(strokesRef.current)]);
    strokesRef.current = deepCopyStrokes(lastState);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    redraw();
  };

  const handleRedo = () => {
    if (isRedoingRef.current) return;
    if (redoStack.length === 0) return;
    isRedoingRef.current = true;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, deepCopyStrokes(strokesRef.current)]);
    strokesRef.current = deepCopyStrokes(nextState);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
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

  /* ================================
     Render
  ================================== */
  return (
    <div className="flex h-screen w-full flex-row">
      <AnnotationSidebar />

      <div className="flex w-full flex-col">
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
          {/*<Button*/}
          {/*  onClick={() => {*/}
          {/*    if (!viewerInstance.current || !canvasRef.current || !roi) return;*/}
          {/*    exportROIAsPNG(viewerInstance.current, canvasRef.current, roi);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Export*/}
          {/*</Button>{' '}*/}
        </div>

        <AnnotationSubProjectSlider />
      </div>
    </div>
  );
};

export default AnnotationViewer;
