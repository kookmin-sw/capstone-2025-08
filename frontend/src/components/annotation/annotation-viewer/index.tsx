'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import { useOsdviewer } from '@/hooks/use-osdviewer';
import AnnotationTool from '@/components/annotation/annotation-tool';
import AnnotationControlPanel from '@/components/annotation/annotation-control-panel';
import {
  processPNGImage,
  syncCanvasWithOSD,
  redrawCanvas,
} from '@/utils/canvas-utils';
import { Stroke, ROI } from '@/utils/canvas-utils';
import { Button } from '@/components/ui/button';

// ROI 선 두께 상수
const BORDER_THICKNESS = 2;

const AnnotationViewer: React.FC<{ modelType: string }> = ({ modelType }) => {
  /* ================================
     Ref 및 State 선언
  ================================== */
  // 뷰어 및 캔버스 참조
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerInstance = useOsdviewer(viewerRef);

  // PNG 오버레이 이미지 참조
  const pngImageRef = useRef<HTMLImageElement | null>(null);

  // 드로잉/어노테이션 관련
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penSize, setPenSize] = useState<number>(0.5);

  // ROI 관련 상태
  const [isSelectingROI, setIsSelectingROI] = useState<boolean>(false);
  const [roi, setROI] = useState<ROI | null>(null);
  const roiStartRef = useRef<{ x: number; y: number } | null>(null);

  // Undo / Redo 스택
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const isRedoingRef = useRef(false);

  // helper: 깊은 복사를 위한 함수 (JSON 방식)
  const deepCopyStrokes = (strokes: Stroke[]): Stroke[] =>
    JSON.parse(JSON.stringify(strokes));

  /* ================================
     캔버스 및 뷰어 동기화
  ================================== */
  const redraw = useCallback(() => {
    if (!viewerInstance.current) return;
    redrawCanvas(
      viewerInstance.current,
      canvasRef,
      pngImageRef,
      strokesRef.current,
      currentStrokeRef.current,
      roi,
      isSelectingROI,
    );
  }, [viewerInstance, canvasRef, pngImageRef, roi, isSelectingROI]);

  const syncCanvas = useCallback(() => {
    if (!viewerInstance.current || !canvasRef.current) return;
    syncCanvasWithOSD(viewerInstance.current, canvasRef, redraw);
  }, [viewerInstance, canvasRef, redraw]);

  useEffect(() => {
    if (!viewerInstance.current) return;
    const updateHandler = () => syncCanvas();
    viewerInstance.current.addHandler('animation', updateHandler);
    viewerInstance.current.addHandler('zoom', updateHandler);
    viewerInstance.current.addHandler('pan', updateHandler);
    // 초기 동기화
    syncCanvas();

    window.addEventListener('resize', syncCanvas);
    return () => window.removeEventListener('resize', syncCanvas);
  }, [viewerInstance, syncCanvas]);

  /* ================================
     타일 소스 및 PNG 오버레이 이미지 로드
  ================================== */
  useEffect(() => {
    if (!viewerInstance.current) return;
    const loadTileSource = async () => {
      try {
        const tiffTileSources =
          await OpenSeadragon.GeoTIFFTileSource.getAllTileSources(
            '/svs_example.svs',
          );
        if (tiffTileSources.length > 0) {
          viewerInstance.current.addTiledImage({
            tileSource: tiffTileSources[0],
          });
          console.log('타일 소스 추가 완료');
        }
      } catch (error) {
        console.error('타일 소스 로드 실패:', error);
      }
    };
    loadTileSource();
  }, [viewerInstance]);

  useEffect(() => {
    if (!canvasRef.current) return;
    // const img = new Image();
    // img.src = "/roopy.png"; // public 폴더 내 파일
    // img.onload = () => processPNGImage(img, pngImageRef, redraw);
    // img.onerror = () => console.error("PNG 오버레이 이미지 로드 실패");
  }, [canvasRef, redraw]);

  /* ================================
     마우스 이벤트 핸들러
  ================================== */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isSelectingROI) {
      roiStartRef.current = { x, y };
      setROI({ x, y, width: 0, height: 0 });
    } else if (isDrawingMode) {
      const viewportPoint = viewerInstance.current.viewport.pointFromPixel(
        new OpenSeadragon.Point(x, y),
      );
      currentStrokeRef.current = {
        points: [{ x: viewportPoint.x, y: viewportPoint.y }],
        color: isEraserMode ? 'rgba(0,0,0,0)' : penColor,
        size: penSize,
        isEraser: isEraserMode,
      };
    }
    redraw();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isSelectingROI && roiStartRef.current) {
      const start = roiStartRef.current;
      setROI({
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        width: Math.abs(x - start.x),
        height: Math.abs(y - start.y),
      });
    } else if (isDrawingMode && currentStrokeRef.current) {
      const viewportPoint = viewerInstance.current.viewport.pointFromPixel(
        new OpenSeadragon.Point(x, y),
      );
      currentStrokeRef.current.points.push({
        x: viewportPoint.x,
        y: viewportPoint.y,
      });
    }
    redraw();
  };

  const handleMouseUp = () => {
    if (!canvasRef.current || !viewerInstance.current) return;
    const tiledImage = viewerInstance.current.world.getItemAt(0);
    if (!tiledImage) return;

    if (isSelectingROI) {
      roiStartRef.current = null;
      setIsSelectingROI(false);
      if (roi) {
        // 조정된 ROI: 테두리 제외
        const adjustedROI = {
          x: roi.x + BORDER_THICKNESS,
          y: roi.y + BORDER_THICKNESS,
          width: roi.width - 2 * BORDER_THICKNESS,
          height: roi.height - 2 * BORDER_THICKNESS,
        };
        const topLeftViewport = viewerInstance.current.viewport.pointFromPixel(
          new OpenSeadragon.Point(adjustedROI.x, adjustedROI.y),
        );
        const bottomRightViewport =
          viewerInstance.current.viewport.pointFromPixel(
            new OpenSeadragon.Point(
              adjustedROI.x + adjustedROI.width,
              adjustedROI.y + adjustedROI.height,
            ),
          );
        const topLeftImage =
          tiledImage.viewportToImageCoordinates(topLeftViewport);
        const bottomRightImage =
          tiledImage.viewportToImageCoordinates(bottomRightViewport);
        const imageROI = {
          x: Math.round(topLeftImage.x),
          y: Math.round(topLeftImage.y),
          width: Math.round(bottomRightImage.x - topLeftImage.x),
          height: Math.round(bottomRightImage.y - topLeftImage.y),
        };
        console.log('ROI (이미지 좌표):', imageROI);
      }
    }

    // 드로잉 모드: stroke 저장 및 undo/redo 스택 업데이트
    if (isDrawingMode && currentStrokeRef.current) {
      const prevStrokes = deepCopyStrokes(strokesRef.current);
      setUndoStack((prev) => [...prev, prevStrokes]);
      setRedoStack([]);
      strokesRef.current.push(currentStrokeRef.current);
      currentStrokeRef.current = null;
    }
    redraw();
  };

  const handleSetMove = () => {
    setIsDrawingMode(false);
    setIsSelectingROI(false);
    viewerInstance.current?.setMouseNavEnabled(true);
  };

  const handleToggleEraser = () => setIsEraserMode((prev) => !prev);
  const handleSelectPen = () => setIsEraserMode(false);

  // 드로잉 모드 토글 (활성화 시 스택 초기화)
  const handleToggleAnnotationMode = (): boolean => {
    if (!isDrawingMode && !roi) {
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

  /* ================================
     동적 분할 개수 계산 및 ROI Export
  ================================== */
  const getDivisionCountDynamic = (dimension: number): number => {
    if (dimension <= 20000) return 1;
    else if (dimension <= 30000) return 2;
    else if (dimension <= 40000) return 3;
    else {
      return 3 + Math.ceil((dimension - 40000) / 10000);
    }
  };

  const exportROIAsPNG = () => {
    if (!roi || !canvasRef.current || !viewerInstance.current) return;
    const tiledImage = viewerInstance.current.world.getItemAt(0);
    if (!tiledImage) return;

    // 조정된 ROI (실선 제외)
    const adjustedROI = {
      x: roi.x + BORDER_THICKNESS,
      y: roi.y + BORDER_THICKNESS,
      width: roi.width - 2 * BORDER_THICKNESS,
      height: roi.height - 2 * BORDER_THICKNESS,
    };

    // 컨테이너 좌표(adjustedROI)를 이미지 좌표로 변환
    const topLeftViewport = viewerInstance.current.viewport.pointFromPixel(
      new OpenSeadragon.Point(adjustedROI.x, adjustedROI.y),
    );
    const bottomRightViewport = viewerInstance.current.viewport.pointFromPixel(
      new OpenSeadragon.Point(
        adjustedROI.x + adjustedROI.width,
        adjustedROI.y + adjustedROI.height,
      ),
    );
    const topLeftImage = tiledImage.viewportToImageCoordinates(topLeftViewport);
    const bottomRightImage =
      tiledImage.viewportToImageCoordinates(bottomRightViewport);
    const imageROI = {
      x: Math.round(topLeftImage.x),
      y: Math.round(topLeftImage.y),
      width: Math.round(bottomRightImage.x - topLeftImage.x),
      height: Math.round(bottomRightImage.y - topLeftImage.y),
    };
    console.log('Export ROI (이미지 좌표):', imageROI);

    // 전체 export 크기 (이미지 좌표 기준)
    const totalExportWidth = imageROI.width;
    const totalExportHeight = imageROI.height;

    // 동적 분할 개수 계산
    const cols = getDivisionCountDynamic(totalExportWidth);
    const rows = getDivisionCountDynamic(totalExportHeight);

    // devicePixelRatio 적용
    const ratio = window.devicePixelRatio || 1;

    // canvas 상의 ROI 영역 (adjustedROI 사용)
    const sourceROI_X = adjustedROI.x * ratio;
    const sourceROI_Y = adjustedROI.y * ratio;
    const sourceROI_W = adjustedROI.width * ratio;
    const sourceROI_H = adjustedROI.height * ratio;

    // 타일당 출력 크기 (균등 분할)
    const tileTargetWidth = totalExportWidth / cols;
    const tileTargetHeight = totalExportHeight / rows;

    // 타일당 canvas 상의 영역 크기 (균등 분할)
    const sourceTileWidth = sourceROI_W / cols;
    const sourceTileHeight = sourceROI_H / rows;

    // 각 타일별 이미지 추출 및 저장
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sourceX = sourceROI_X + c * sourceTileWidth;
        const sourceY = sourceROI_Y + r * sourceTileHeight;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = Math.round(tileTargetWidth);
        offscreenCanvas.height = Math.round(tileTargetHeight);
        const offCtx = offscreenCanvas.getContext('2d');
        if (!offCtx) continue;

        offCtx.drawImage(
          canvasRef.current,
          sourceX,
          sourceY,
          sourceTileWidth,
          sourceTileHeight,
          0,
          0,
          offscreenCanvas.width,
          offscreenCanvas.height,
        );

        offscreenCanvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${r}_${c}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      }
    }
  };

  /* ================================
     Render
  ================================== */
  return (
    <div className="flex w-full flex-row items-center justify-between space-x-3 p-10">
      {isDrawingMode ? (
        <AnnotationTool
          modelType={modelType}
          isActive={isDrawingMode}
          penColor={penColor}
          penSize={penSize}
          onToggleEraser={handleToggleEraser}
          onSelectPen={handleSelectPen}
          onChangePenColor={setPenColor}
          onChangePenSize={setPenSize}
        />
      ) : (
        <div className="flex w-14 flex-col items-center justify-center" />
      )}

      <div className="relative h-[600px] w-[1000px] bg-white">
        <div ref={viewerRef} className="h-full w-full" />
        <canvas
          ref={canvasRef}
          className={`absolute left-0 top-0 z-10 ${
            isDrawingMode || isSelectingROI
              ? 'pointer-events-auto'
              : 'pointer-events-none'
          }`}
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

      <Button onClick={exportROIAsPNG}>export</Button>
    </div>
  );
};

export default AnnotationViewer;
