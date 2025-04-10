import OpenSeadragon from 'openseadragon';
import { Stroke, Point } from '@/types/annotation';

/**
 * Stroke 배열을 깊은 복사하여 반환
 */
export const deepCopyStrokes = (strokes: Stroke[]): Stroke[] =>
  JSON.parse(JSON.stringify(strokes));

/**
 * 펜 stroke 그리기
 */
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

/**
 * 지우개 stroke와 겹치는 펜 stroke를 제거하여 새로운 stroke 배열을 반환
 */
export const subtractStroke = (
  pencilStroke: Stroke,
  eraserStroke: Stroke,
  viewerInstance: any,
  canvas: HTMLCanvasElement,
): Stroke[] => {
  if (pencilStroke.points.length === 0) return [pencilStroke];

  const result: Stroke[] = [];
  let currentSegment: Point[] = [];

  const ratio = window.devicePixelRatio || 1;

  const eraserCanvas = document.createElement('canvas');
  eraserCanvas.width = canvas.width;
  eraserCanvas.height = canvas.height;

  const ctx = eraserCanvas.getContext('2d');
  if (!ctx) return [pencilStroke];

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = eraserStroke.size * ratio;
  ctx.beginPath();

  const toCanvasPoint = (pt: Point) => {
    const pixel = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(pt.x, pt.y),
    );
    return {
      x: pixel.x * ratio,
      y: pixel.y * ratio,
    };
  };

  // 지우개 stroke를 canvas 위에 그림
  const first = toCanvasPoint(eraserStroke.points[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < eraserStroke.points.length; i++) {
    const pt = toCanvasPoint(eraserStroke.points[i]);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // 펜 stroke의 각 점이 지우개 stroke에 닿는지 확인
  for (const pt of pencilStroke.points) {
    const canvasPt = toCanvasPoint(pt);
    const erased = ctx.isPointInStroke?.(canvasPt.x, canvasPt.y) ?? false;

    if (!erased) {
      currentSegment.push(pt);
    } else {
      if (currentSegment.length > 0) {
        result.push({
          ...pencilStroke,
          points: [...currentSegment],
          isEraser: false,
        });
        currentSegment = [];
      }
    }
  }

  // 마지막 segment 추가
  if (currentSegment.length > 0) {
    result.push({
      ...pencilStroke,
      points: [...currentSegment],
      isEraser: false,
    });
  }

  return result.length > 0 ? result : [pencilStroke];
};
