import OpenSeadragon from 'openseadragon';
import { Point } from '@/types/annotation';

export const drawPolygon = (
  viewerInstance: any,
  ctx: CanvasRenderingContext2D,
  points: Point[],
  mousePosition: Point | null | undefined,
  color: string,
  isClosed = false,
) => {
  if (points.length === 0) return;

  const pixelPoints = points.map((pt) =>
    viewerInstance.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // 메인 폴리라인
  ctx.beginPath();
  ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
  for (let i = 1; i < pixelPoints.length; i++) {
    ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
  }

  // 점을 그릴 때 마우스를 따라다니는 선
  if (mousePosition) {
    const mousePixel = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(mousePosition.x, mousePosition.y),
    );
    ctx.lineTo(mousePixel.x, mousePixel.y);
  }

  ctx.stroke();

  // 폴리곤이 완성 되었을 때 내부 색깔 채우기
  if (
    points.length > 2 &&
    points[0].x === points[points.length - 1].x &&
    points[0].y === points[points.length - 1].y
  ) {
    ctx.fillStyle = color;
    ctx.fill();
  }

  // 모든 점 그리기 (isClosed가 아닐 때만)
  if (!isClosed && points.length > 0) {
    pixelPoints.forEach((pt, index) => {
      const isFirst = index === 0;

      // 첫 점 강조 (마우스 근처면 더 크게)
      if (isFirst && mousePosition) {
        const mousePixel = viewerInstance.viewport.pixelFromPoint(
          new OpenSeadragon.Point(mousePosition.x, mousePosition.y),
        );
        const dist = Math.hypot(pt.x - mousePixel.x, pt.y - mousePixel.y);

        if (dist < 10) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          return;
        }
      }

      // 일반 점 그리기
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  ctx.restore();
};
