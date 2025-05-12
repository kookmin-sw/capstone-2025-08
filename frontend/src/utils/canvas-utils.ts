import OpenSeadragon from 'openseadragon';
import React from 'react';
import { LoadedROI, Polygon, Point, RenderItem } from '@/types/annotation';
import { drawStroke } from '@/utils/canvas-drawing-utils';
import { drawCellPolygons, drawPolygon } from '@/utils/canvas-ploygon-utils';

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
  renderQueue: RenderItem[],
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

  /* ========= 2. 드로잉, 폴리곤, 지우개를 하나의 큐로 렌더링 ========= */
  renderQueue.forEach((item) => {
    ctx.save();
    if (item.type === 'polygon') {
      ctx.globalCompositeOperation = 'source-over';
      drawPolygon(
        viewerInstance,
        ctx,
        item.polygon.points,
        null,
        item.polygon.color,
        true,
      );
    } else {
      ctx.globalCompositeOperation = item.stroke.isEraser
        ? 'destination-out'
        : 'source-over';
      drawStroke(item.stroke, viewerInstance, ctx);
    }
    ctx.restore();
  });

  /* ========= 3. 지금 그리는 중인 일반 폴리곤 ========= */
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

/**
 * 캔버스 다시 그리기 (Cell 전용)
 */
export const redrawCellCanvas = (
  viewer: OpenSeadragon.Viewer,
  canvas: HTMLCanvasElement,
  cellPolygons: Polygon[],
  current: Polygon | null,
  mouse: Point | null,
  isInsideAnyROI: (point: Point) => boolean,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const ratio = window.devicePixelRatio || 1;
  const rect = viewer.container.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCellPolygons(viewer, ctx, cellPolygons, current, mouse, isInsideAnyROI);
};
