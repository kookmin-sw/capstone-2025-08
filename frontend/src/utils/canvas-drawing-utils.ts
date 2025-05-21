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

  // 뷰포트 → 픽셀 좌표
  const pixelPoints = stroke.points.map((pt) =>
    viewerInstance.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  // 이미지 좌표계에서 정의된 stroke.size를 픽셀 단위로 변환
  const imageCenter = new OpenSeadragon.Point(
    stroke.points[0].x,
    stroke.points[0].y,
  );
  const imageRight = new OpenSeadragon.Point(
    stroke.points[0].x + stroke.size,
    stroke.points[0].y,
  );

  // 이미지 → 뷰포트 → 픽셀 좌표 변환
  const vpCenter =
    viewerInstance.viewport.imageToViewportCoordinates(imageCenter);
  const vpRight =
    viewerInstance.viewport.imageToViewportCoordinates(imageRight);

  const pxCenter = viewerInstance.viewport.pixelFromPoint(vpCenter);
  const pxRight = viewerInstance.viewport.pixelFromPoint(vpRight);

  // css기준 픽셀과 동적으로 스케일링되는 stroke의 차이 때문에 약 5배를 곱하여 사용
  const pixelStrokeWidth = Math.abs(pxRight.x - pxCenter.x) * 5;

  ctx.save();
  ctx.beginPath();

  const first = pixelPoints[0];
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < pixelPoints.length; i++) {
    const pt = pixelPoints[i];
    ctx.lineTo(pt.x, pt.y);
  }

  ctx.lineWidth = pixelStrokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
  }

  if (stroke.points.length === 1) {
    ctx.arc(first.x, first.y, pixelStrokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.stroke();
  }

  ctx.restore();
};
