import OpenSeadragon from 'openseadragon';
import React from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  size: number;
  isEraser?: boolean;
}

export interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MaskTile {
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LoadedROI {
  bbox: { x: number; y: number; w: number; h: number };
  tiles: MaskTile[];
}

// png 파일을 불러와서 투명도 처리 후 타일 좌표계로 변환하는 함수
export const processMaskTile = async (
  base: { x: number; y: number; width: number; height: number },
  url: string,
): Promise<MaskTile> =>
  new Promise((res, rej) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const [row, col] = url
        .split('/')
        .pop()!
        .replace('.png', '')
        .split('_')
        .map(Number);

      const cols = Math.round(base.width / img.width);
      const rows = Math.round(base.height / img.height);

      const tileW = base.width / cols;
      const tileH = base.height / rows;

      res({
        img: (() => {
          const off = document.createElement('canvas');
          off.width = img.width;
          off.height = img.height;
          const c = off.getContext('2d')!;
          c.drawImage(img, 0, 0);
          const d = c.getImageData(0, 0, off.width, off.height);
          for (let i = 0; i < d.data.length; i += 4)
            if (d.data[i] < 20 && d.data[i + 1] < 20 && d.data[i + 2] < 20)
              d.data[i + 3] = 0;
          c.putImageData(d, 0, 0);
          const processed = new Image();
          processed.src = off.toDataURL();
          return processed;
        })(),
        x: base.x + col * tileW,
        y: base.y + row * tileH,
        w: tileW,
        h: tileH,
      });
    };
    img.onerror = rej;
  });

// OpenSeadragon 뷰어와 캔버스 동기화
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

// 캔버스 다시 그리는 함수
export const redrawCanvas = (
  viewerInstance: any,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  loadedROIs: LoadedROI[],
  strokes: Stroke[],
  currentStroke: Stroke | null,
  roi: ROI | null,
  userDefinedROIs: ROI[],
  isSelectingROI: boolean,
) => {
  if (!canvasRef.current || !viewerInstance) return;

  /* ========= 기본 세팅 ========= */
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

  /* ========= 1. 모든 ROI의 PNG 타일 ========= */
  loadedROIs.forEach(({ tiles }) =>
    tiles.forEach(({ img, x, y, w, h }) => {
      const tlImg = new OpenSeadragon.Point(x, y);
      const brImg = new OpenSeadragon.Point(x + w, y + h);
      const tlVp = tiledImage.imageToViewportCoordinates(tlImg);
      const brVp = tiledImage.imageToViewportCoordinates(brImg);
      const p1 = viewerInstance.viewport.pixelFromPoint(tlVp);
      const p2 = viewerInstance.viewport.pixelFromPoint(brVp);

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.drawImage(img, p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.restore();
    }),
  );

  /* ========= 1‑b. 기존 ROI 테두리(파란색) ========= */
  loadedROIs.forEach(({ bbox }) => {
    const tlImg = new OpenSeadragon.Point(bbox.x, bbox.y);
    const brImg = new OpenSeadragon.Point(bbox.x + bbox.w, bbox.y + bbox.h);
    const tlVp = tiledImage.imageToViewportCoordinates(tlImg);
    const brVp = tiledImage.imageToViewportCoordinates(brImg);
    const p1 = viewerInstance.viewport.pixelFromPoint(tlVp);
    const p2 = viewerInstance.viewport.pixelFromPoint(brVp);

    ctx.save();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();
  });

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

  if (roi) ctx.restore();

  /* ========= 4. (사용자) ROI 테두리 ========= */
  if (roi) {
    const tlVp = new OpenSeadragon.Point(roi.x, roi.y);
    const brVp = new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height);
    const p1 = viewerInstance.viewport.pixelFromPoint(tlVp);
    const p2 = viewerInstance.viewport.pixelFromPoint(brVp);

    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.setLineDash(isSelectingROI ? [6, 6] : []);
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();
  }

  /* ========= 5. (사용자) ROI 테두리 유지 ========= */
  userDefinedROIs.forEach((r) => {
    const tlVp = new OpenSeadragon.Point(r.x, r.y);
    const brVp = new OpenSeadragon.Point(r.x + r.width, r.y + r.height);
    const p1 = viewerInstance.viewport.pixelFromPoint(tlVp);
    const p2 = viewerInstance.viewport.pixelFromPoint(brVp);

    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();
  });
};

// 펜 stroke 그리는 함수
export const drawStroke = (
  stroke: Stroke,
  viewerInstance: any,
  ctx: CanvasRenderingContext2D,
) => {
  if (stroke.points.length === 0) return;

  const pixelPoints = stroke.points.map((pt) =>
    viewerInstance.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  ctx.beginPath();
  const first = pixelPoints[0];
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < pixelPoints.length; i++) {
    const pt = pixelPoints[i];
    ctx.lineTo(pt.x, pt.y);
  }

  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
  }

  if (stroke.points.length === 1) {
    ctx.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
  } else {
    ctx.stroke();
  }

  // 복원
  ctx.globalCompositeOperation = 'source-over';
};
