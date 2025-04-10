import OpenSeadragon from 'openseadragon';
import React from 'react';

const OSD: any = OpenSeadragon;

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

export interface Polygon {
  points: Point[];
  closed: boolean;
  color: string;
}

export const processPNGImage = (
  img: HTMLImageElement,
  pngImageRef: React.MutableRefObject<HTMLImageElement | null>,
  redrawCanvas: () => void,
) => {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;
  const offCtx = offscreenCanvas.getContext('2d');
  if (!offCtx) return;
  offCtx.drawImage(img, 0, 0);
  const imageData = offCtx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;
  // 임계값(threshold): R, G, B 모두 20 미만이면 투명하게 처리
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 20 && data[i + 1] < 20 && data[i + 2] < 20) {
      data[i + 3] = 0;
    }
  }
  offCtx.putImageData(imageData, 0, 0);
  const processedImg = new Image();
  processedImg.src = offscreenCanvas.toDataURL();
  processedImg.onload = () => {
    pngImageRef.current = processedImg;
    redrawCanvas();
  };
};

export const syncCanvasWithOSD = (
  viewerInstance: any, // 타입을 any로 지정하여 TS가 내부 멤버를 검사하지 않게 함
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

export const redrawCanvas = (
  viewerInstance: any,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  pngImageRef: React.MutableRefObject<HTMLImageElement | null>,
  strokes: Stroke[],
  currentStroke: Stroke | null,
  roi: ROI | null,
  isSelectingROI: boolean,
  polygons: Polygon[],
  currentPolygon: Polygon | null,
  mousePosition?: Point | null,
) => {
  if (!canvasRef.current || !viewerInstance) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 디바이스 해상도 대응
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = viewerInstance.container.getBoundingClientRect();
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);

  // 스타일 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.globalAlpha = 1.0;

  const tiledImage = viewerInstance.world.getItemAt(0);
  if (!tiledImage) {
    console.warn('tiledImage가 아직 준비되지 않음');
  }

  // PNG 오버레이 이미지
  if (
    pngImageRef.current &&
    tiledImage &&
    typeof tiledImage.getBounds === 'function'
  ) {
    const imageViewportRect = tiledImage.getBounds();
    const topLeft = viewerInstance.viewport.pixelFromPoint(
      imageViewportRect.getTopLeft(),
    );
    const bottomRight = viewerInstance.viewport.pixelFromPoint(
      imageViewportRect.getBottomRight(),
    );
    const overlayX = topLeft.x;
    const overlayY = topLeft.y;
    const overlayWidth = bottomRight.x - topLeft.x;
    const overlayHeight = bottomRight.y - topLeft.y;

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(
      pngImageRef.current,
      overlayX,
      overlayY,
      overlayWidth,
      overlayHeight,
    );
    ctx.restore();
  }

  // ROI가 있다면 클립
  if (roi) {
    // 뷰포트 좌표로 저장된 ROI 값을 캔버스 좌표로 변환
    const topLeft = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x, roi.y),
    );
    const bottomRight = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height),
    );
    const clipX = topLeft.x;
    const clipY = topLeft.y;
    const clipWidth = bottomRight.x - topLeft.x;
    const clipHeight = bottomRight.y - topLeft.y;

    ctx.save();
    ctx.beginPath();
    ctx.rect(clipX, clipY, clipWidth, clipHeight);
    ctx.clip();
  }

  // 그리기 (보간 포함)
  [...strokes, ...(currentStroke ? [currentStroke] : [])].forEach((stroke) => {
    drawStrokeSmooth(stroke, viewerInstance, ctx);
  });

  // 완성된 폴리곤들 먼저 그리기
  polygons.forEach((polygon) => {
    if (polygon.closed) {
      drawPolygon(viewerInstance, ctx, polygon.points, null, polygon.color);
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
    );
  }

  if (roi) {
    ctx.restore();
  }

  // ROI 테두리
  if (roi) {
    const topLeft = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x, roi.y),
    );
    const bottomRight = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height),
    );
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;

    ctx.save();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    if (isSelectingROI) ctx.setLineDash([6, 6]);
    else ctx.setLineDash([]);
    ctx.strokeRect(topLeft.x, topLeft.y, width, height);
    ctx.restore();
  }
};

const drawStrokeSmooth = (
  stroke: Stroke,
  viewer: any,
  ctx: CanvasRenderingContext2D,
) => {
  if (stroke.points.length < 2) return;

  const pixelPoints = stroke.points.map((pt) =>
    viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;

  ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);

  for (let i = 1; i < pixelPoints.length; i++) {
    const prev = pixelPoints[i - 1];
    const curr = pixelPoints[i];

    const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const minDist = 3; // 최소 보간 거리 (너무 빽빽하지 않게 조절)

    if (dist < minDist) {
      ctx.lineTo(curr.x, curr.y); // 가까우면 그냥 이어줌
    } else {
      const steps = Math.floor(dist / minDist);
      for (let j = 1; j <= steps; j++) {
        const t = j / steps;
        const x = prev.x + (curr.x - prev.x) * t;
        const y = prev.y + (curr.y - prev.y) * t;
        ctx.lineTo(x, y);
      }
    }
  }

  ctx.stroke();
};

export const drawStroke = (
  stroke: Stroke,
  viewerInstance: any,
  ctx: CanvasRenderingContext2D,
) => {
  if (stroke.points.length === 0) return;

  const canvas = viewerInstance.container;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  const pixelPoints = stroke.points.map((pt) =>
    viewerInstance.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ✅ 확대 비율과 무관하게 고정된 굵기
  ctx.lineWidth = stroke.size;
  ctx.strokeStyle = stroke.color;

  if (stroke.isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  const p0 = pixelPoints[0];

  if (stroke.points.length === 1) {
    // ✅ 정확한 penSize만큼 점 찍기
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
  } else {
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < pixelPoints.length; i++) {
      ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';
};

export const drawPolygon = (
  viewerInstance: any,
  ctx: CanvasRenderingContext2D,
  points: Point[],
  mousePosition: Point | null | undefined,
  color: string,
) => {
  if (points.length === 0) return;

  const pixelPoints = points.map((pt) =>
    viewerInstance.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
  for (let i = 1; i < pixelPoints.length; i++) {
    ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
  }

  // 폴리곤이 완성 되었을 때 내부 색깔 채우기
  if (
    points.length > 2 &&
    points[0].x === points[points.length - 1].x &&
    points[0].y === points[points.length - 1].y
  ) {
    ctx.fillStyle = color;
    ctx.fill();
  }

  // 점을 그릴 때 마우스를 따라다니는 선
  if (mousePosition) {
    const mousePixel = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(mousePosition.x, mousePosition.y),
    );
    ctx.lineTo(mousePixel.x, mousePixel.y);
  }

  ctx.stroke();
  ctx.restore();
};
