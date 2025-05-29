import OpenSeadragon from 'openseadragon';
import React from 'react';
import { Polygon, Point, RenderItem, MaskTile } from '@/types/annotation';
import { drawStroke } from '@/utils/canvas-drawing-utils';
import {
  drawCellInferencePoints,
  drawCellPolygons,
  drawPolygon,
} from '@/utils/canvas-ploygon-utils';
import { RoiResponsePayload } from '@/generated-api';

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
const tissueImageCache: Map<string, HTMLImageElement> = new Map(); // 이미지를 매번 새로 로딩하지 않고 캐시에 저장한 다음 이미 로딩된 이미지만 drawImage()로 그리도록 제한

export const redrawCanvas = (
  viewerInstance: any,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  loadedROIs: RoiResponsePayload[],
  renderQueue: RenderItem[],
  currentPolygon: Polygon | null,
  redMaskVisibleMap: Record<number, boolean>,
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

  /* ========= 1. 모든 ROI의 PNG 타일만 표시 (빨간색 토글 제거 포함) ========= */
  loadedROIs.forEach(({ detail, tissuePath }) => {
    if (
      !tissuePath ||
      tissuePath.length === 0 ||
      !detail ||
      typeof detail.x !== 'number' ||
      typeof detail.y !== 'number' ||
      typeof detail.width !== 'number' ||
      typeof detail.height !== 'number'
    ) {
      return;
    }

    const { x: baseX, y: baseY, width, height } = detail;

    // 1) 모든 타일 URL을 미리 캐시에 로드
    tissuePath.forEach((url) => {
      if (!tissueImageCache.has(url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        tissueImageCache.set(url, img);
      }
    });

    // 2) 각 타일을 그린 뒤, 토글 상태에 따라 빨간 픽셀만 지우기
    //    (가장 첫 URL을 써서 cols/rows 계산)
    const sample = tissueImageCache.get(tissuePath[0]);
    if (!sample || !sample.complete) return;
    const cols = Math.round(width / sample.width);
    const rows = Math.round(height / sample.height);
    const tileW = width / cols;
    const tileH = height / rows;

    tissuePath.forEach((url, idx) => {
      const img = tissueImageCache.get(url);
      if (!img || !img.complete) return;

      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = baseX + col * tileW;
      const y = baseY + row * tileH;

      const tlVp = tiledImage.imageToViewportCoordinates(
        new OpenSeadragon.Point(x, y),
      );
      const brVp = tiledImage.imageToViewportCoordinates(
        new OpenSeadragon.Point(x + tileW, y + tileH),
      );
      const p1 = viewerInstance.viewport.pixelFromPoint(tlVp);
      const p2 = viewerInstance.viewport.pixelFromPoint(brVp);

      // (2-a) 원본 타일 그리기
      ctx.drawImage(img, p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

      // (2-b) 토글 상태가 false일 때만 빨간 픽셀 제거
      if (redMaskVisibleMap[detail.id!] === false) {
        const W = p2.x - p1.x;
        const H = p2.y - p1.y;
        const data = ctx.getImageData(p1.x, p1.y, W, H);
        for (let i = 0; i < data.data.length; i += 4) {
          const [r, g, b] = [data.data[i], data.data[i + 1], data.data[i + 2]];
          if (r > 200 && g < 50 && b < 50) {
            data.data[i + 3] = 0;
          }
        }
        ctx.putImageData(data, p1.x, p1.y);
      }
    });
  });

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
  loadedROIs: RoiResponsePayload[],
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

  drawCellInferencePoints(viewer, ctx, loadedROIs);
};

/**
 * 캔버스 클리어
 */
export const clearCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
