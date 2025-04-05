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

  // 캔버스 전체 클리어
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tiledImage = viewerInstance.world.getItemAt(0);
  if (!tiledImage) {
    console.warn('tiledImage가 아직 준비되지 않음');
  }

  // PNG 오버레이 이미지 그리기 (50% 투명도 적용)
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

  // ROI 클리핑 (ROI가 있을 경우)
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

  // 저장된 stroke들과 현재 stroke 그리기
  strokes.forEach((stroke) => {
    drawStroke(stroke, viewerInstance, ctx);
  });
  if (currentStroke) {
    drawStroke(currentStroke, viewerInstance, ctx);
  }

  if (roi) {
    ctx.restore();
  }

  // ROI 영역 테두리: 선택 중이면 점선, 선택 완료면 실선으로 표시
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
    if (isSelectingROI) {
      ctx.setLineDash([6, 6]); // 선택 중: 점선
    } else {
      ctx.setLineDash([]); // 선택 완료: 실선
    }
    ctx.strokeRect(topLeft.x, topLeft.y, width, height);
    ctx.restore();
  }
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
