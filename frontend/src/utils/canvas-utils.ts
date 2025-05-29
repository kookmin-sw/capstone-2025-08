import OpenSeadragon from 'openseadragon';
import React from 'react';
import { Polygon, Point, RenderItem } from '@/types/annotation';
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
    return;
  }

  /* ========= 1. 모든 ROI의 PNG 타일만 표시 ========= */
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

    // 첫 이미지로 col/row 수 계산
    const firstUrl = tissuePath[0];
    const cachedFirstImg = tissueImageCache.get(firstUrl);

    const drawTissueTiles = (img: HTMLImageElement) => {
      const cols = Math.round(width / img.width);
      const rows = Math.round(height / img.height);
      const tileW = width / cols;
      const tileH = height / rows;

      tissuePath.forEach((url, idx) => {
        const cachedImg = tissueImageCache.get(url);

        if (cachedImg && cachedImg.complete) {
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

          ctx.drawImage(cachedImg, p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        } else if (!cachedImg) {
          const newImg = new Image();
          newImg.src = url;
          tissueImageCache.set(url, newImg);

          newImg.onload = () => {
            // 다음 redraw 시점에 자연스럽게 반영됨 (비동기)
          };
        }
      });
    };

    if (cachedFirstImg && cachedFirstImg.complete) {
      // 이미 캐시에 이미지가 있으면 그리기
      drawTissueTiles(cachedFirstImg);
    } else if (!cachedFirstImg) {
      // 캐시에 없으면 새로 만들고 저장만 함(그리지 않음)
      const img = new Image();
      img.src = firstUrl;
      tissueImageCache.set(firstUrl, img);

      img.onload = () => {
        drawTissueTiles(img);
      };
    }
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
