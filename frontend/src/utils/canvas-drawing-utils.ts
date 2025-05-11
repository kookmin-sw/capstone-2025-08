import OpenSeadragon from 'openseadragon';
import { Stroke, Polygon, RenderItem } from '@/types/annotation';

/**
 * 렌더링 큐, Stroke, Polygon 깊은 복사하여 반환
 */
export const deepCopyRenderQueue = (queue: RenderItem[]): RenderItem[] =>
  JSON.parse(JSON.stringify(queue));

export const deepCopyStrokes = (strokes: Stroke[]): Stroke[] =>
  JSON.parse(JSON.stringify(strokes));

export const deepCopyPolygons = (polygons: Polygon[]): Polygon[] =>
  JSON.parse(JSON.stringify(polygons));

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
