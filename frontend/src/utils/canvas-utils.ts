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
    ctx.save();
    ctx.beginPath();
    ctx.rect(roi.x, roi.y, roi.width, roi.height);
    ctx.clip();
  }

  // 그리기 (보간 포함)
  [...strokes, ...(currentStroke ? [currentStroke] : [])].forEach((stroke) => {
    drawStrokeSmooth(stroke, viewerInstance, ctx);
  });

  if (roi) {
    ctx.restore();
  }

  // ROI 테두리
  if (roi) {
    ctx.save();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    if (isSelectingROI) ctx.setLineDash([6, 6]);
    else ctx.setLineDash([]);
    ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
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
    const steps = Math.floor(dist / 1.5); // 보간 간격 조절 가능
    for (let j = 1; j <= steps; j++) {
      const t = j / steps;
      const x = prev.x + (curr.x - prev.x) * t;
      const y = prev.y + (curr.y - prev.y) * t;
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};

const drawStroke = (
  stroke: Stroke,
  viewerInstance: any,
  ctx: CanvasRenderingContext2D,
) => {
  if (stroke.points.length === 0) return;
  ctx.beginPath();
  const zoom = viewerInstance.viewport.getZoom();
  const firstPt = stroke.points[0];
  // 여기서 OpenSeadragon.Point 대신, import한 OSD를 사용합니다.
  const containerFirstPt = viewerInstance.viewport.pixelFromPoint(
    new OSD.Point(firstPt.x, firstPt.y),
  );
  ctx.moveTo(containerFirstPt.x, containerFirstPt.y);

  if (stroke.points.length === 1) {
    const radius = (stroke.size * zoom) / 2;
    ctx.arc(
      containerFirstPt.x,
      containerFirstPt.y,
      radius,
      0,
      Math.PI * 2,
      false,
    );
  } else {
    stroke.points.forEach((pt, idx) => {
      if (idx === 0) return;
      const containerPt = viewerInstance.viewport.pixelFromPoint(
        new OSD.Point(pt.x, pt.y),
      );
      ctx.lineTo(containerPt.x, containerPt.y);
    });
  }

  if (stroke.isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
  }
  ctx.lineWidth = stroke.size * zoom;
  ctx.lineCap = 'round';

  if (stroke.points.length === 1) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};
