import OpenSeadragon from 'openseadragon';
import React from 'react';
import { Stroke, LoadedROI, Polygon, Point } from '@/types/annotation';
import { drawStroke } from '@/utils/canvas-drawing-utils';
import { drawPolygon } from '@/utils/canvas-ploygon-utils';

/**
 * 뷰어와 캔버스 동기화
 */
export const syncCanvasWithOSD = (
  viewerInstance: any,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redrawCanvas: () => void,
) => {
  if (!viewerInstance || !canvasRef.current) return;
  const container = viewerInstance.container;
  const rect = container.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const canvas = canvasRef.current;
  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.resetTransform();
    ctx.scale(ratio, ratio);
  }
  redrawCanvas();
};

/**
 * 캔버스 다시 그리기
 */
export const redrawCanvas = (
  viewerInstance: any,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  loadedROIs: LoadedROI[],
  strokes: Stroke[],
  currentStroke: Stroke | null,
  polygons: Polygon[],
  currentPolygon: Polygon | null,
  mousePosition?: Point | null,
) => {
  if (!canvasRef.current || !viewerInstance) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const ratio = window.devicePixelRatio || 1;
  const { width, height } = viewerInstance.container.getBoundingClientRect();
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const tiledImage = viewerInstance.world.getItemAt(0);
  if (!tiledImage) {
    console.warn('tiledImage가 아직 준비되지 않음');
    return;
  }

  /* ========= 1. 모든 ROI의 PNG 타일만 표시 ========= */
  loadedROIs.forEach(({ tiles }) =>
    tiles.forEach(({ img, x, y, w, h }) => {
      const tlImg = new OpenSeadragon.Point(x, y);
      const brImg = new OpenSeadragon.Point(x + w, y + h);
      const tlVp = tiledImage.imageToViewportCoordinates(tlImg);
      const brVp = tiledImage.imageToViewportCoordinates(brImg);
      const p1 = viewerInstance.viewport.pixelFromPoint(tlVp);
      const p2 = viewerInstance.viewport.pixelFromPoint(brVp);

      ctx.save();
      ctx.drawImage(img, p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.restore();
    }),
  );

  /* ========= 2. 지우개 stroke로 PNG에 구멍 내기 ========= */
  [...strokes, ...(currentStroke ? [currentStroke] : [])]
    .filter((s) => s.isEraser)
    .forEach((stroke) => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      drawStroke(stroke, viewerInstance, ctx);
      ctx.restore();
    });

  /* ========= 3. 일반 펜 stroke ========= */
  [...strokes, ...(currentStroke ? [currentStroke] : [])]
    .filter((s) => !s.isEraser)
    .forEach((stroke) => {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      drawStroke(stroke, viewerInstance, ctx);
      ctx.restore();
    });

  // 완성된 폴리곤들 먼저 그리기
  polygons.forEach((polygon) => {
    if (polygon.closed) {
      drawPolygon(
        viewerInstance,
        ctx,
        polygon.points,
        null,
        polygon.color,
        true,
      );
    }
  });

  // 지금 그리는 중인 미완성 폴리곤 그리기
  if (currentPolygon) {
    drawPolygon(
      viewerInstance,
      ctx,
      currentPolygon.points,
      mousePosition,
      currentPolygon.color,
      false,
    );
  }
};
