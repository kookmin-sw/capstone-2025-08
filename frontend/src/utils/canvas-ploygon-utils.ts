import OpenSeadragon from 'openseadragon';
import { LoadedROI, Point, Polygon } from '@/types/annotation';

/**
 * 폴리곤 그리기
 */
export const drawPolygon = (
  viewerInstance: any,
  ctx: CanvasRenderingContext2D,
  points: Point[],
  mousePosition: Point | null | undefined,
  color: string,
  isClosed = false,
  dashed = false,
) => {
  if (points.length === 0) return;

  const pixelPoints = points.map((pt) =>
    viewerInstance.viewport.pixelFromPoint(new OpenSeadragon.Point(pt.x, pt.y)),
  );

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (dashed) ctx.setLineDash([2, 2]);

  // 메인 폴리라인
  ctx.beginPath();
  ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
  for (let i = 1; i < pixelPoints.length; i++) {
    ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
  }

  // 점을 그릴 때 마우스를 따라다니는 선 (닫히지 않았을 때만)
  if (!isClosed && mousePosition) {
    const mousePixel = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(mousePosition.x, mousePosition.y),
    );
    ctx.lineTo(mousePixel.x, mousePixel.y);
  }

  // 반드시 닫기 여부는 마지막에 처리
  if (isClosed) ctx.closePath();

  ctx.stroke();

  // 내부 색 채우기 (닫혀 있고 dashed 아님)
  if (isClosed && !dashed && points.length > 2) {
    ctx.save();

    // 폴리곤 경계 설정
    ctx.beginPath();
    ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
    for (let i = 1; i < pixelPoints.length; i++) {
      ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
    }
    ctx.closePath();

    // 폴리곤 경계 내에서만 작업
    ctx.clip();

    // 알파 무시하고 덮어쓰기
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;

    // fillRect 대신 다시 경계를 채움
    ctx.fill();

    ctx.restore();
  }

  // 모든 점 그리기 (dashed 라면 항상, 아니면 isClosed가 아닐 때만)
  if (dashed || (!isClosed && points.length > 0)) {
    pixelPoints.forEach((pt, index) => {
      const isFirst = index === 0;

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

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  ctx.restore();
};

/**
 * 셀 폴리곤 그리기
 */
export const drawCellPolygons = (
  viewer: OpenSeadragon.Viewer,
  ctx: CanvasRenderingContext2D,
  cellPolygons: Polygon[],
  current: Polygon | null,
  mouse?: Point | null,
  isInsideAnyROI?: (point: Point) => boolean,
) => {
  ctx.save();

  const allPolygons = [...cellPolygons];
  if (current) allPolygons.push(current);

  allPolygons.forEach((poly, idx) => {
    const isLast =
      idx === allPolygons.length - 1 && current != null && !poly.closed;

    const safeMouse = isLast && mouse && isInsideAnyROI?.(mouse) ? mouse : null;

    drawPolygon(
      viewer,
      ctx,
      poly.points,
      safeMouse,
      poly.color,
      poly.closed,
      true,
    );
  });

  ctx.restore();
};

export const drawCellInferencePoints = (
  viewer: OpenSeadragon.Viewer,
  ctx: CanvasRenderingContext2D,
  loadedROIs: LoadedROI[],
) => {
  loadedROIs.forEach((roi) => {
    if (roi.points && roi.points.length > 0) {
      // 기존 유틸 함수 재사용 (닫힌 폴리곤 + 점선 스타일 적용)
      drawPolygon(
        viewer,
        ctx,
        roi.points.map((pt) =>
          viewer.viewport.imageToViewportCoordinates(
            new OpenSeadragon.Point(pt.x, pt.y),
          ),
        ),
        null,
        roi.color || '#FF0000',
        true,
        true,
      );

      // 각 포인트에 원형 점 추가
      roi.points.forEach((pt) => {
        const viewportPt = viewer.viewport.imageToViewportCoordinates(
          new OpenSeadragon.Point(pt.x, pt.y),
        );
        const pixelPt = viewer.viewport.pixelFromPoint(viewportPt);

        ctx.beginPath();
        ctx.arc(pixelPt.x, pixelPt.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = roi.color || '#FF0000';
        ctx.fill();
      });
    }
  });
};
