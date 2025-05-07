import { ROI, LoadedROI } from '@/types/annotation';

/**
 * ROI 전용 캔버스에 실선을 그리는 함수
 */
export const drawROIs = (
  viewerInstance: any,
  roiCanvas: HTMLCanvasElement | null,
  roi: ROI | null,
  userDefinedROIs: ROI[],
  loadedROIs: LoadedROI[],
  isSelectingROI: boolean,
  isEditingROI: boolean,
) => {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OpenSeadragon = require('openseadragon');

  if (!viewerInstance || !roiCanvas) return;

  const ctx = roiCanvas.getContext('2d');
  if (!ctx) return;

  const ratio = window.devicePixelRatio || 1;
  const rect = viewerInstance.container.getBoundingClientRect();

  roiCanvas.width = rect.width * ratio;
  roiCanvas.height = rect.height * ratio;
  roiCanvas.style.width = `${rect.width}px`;
  roiCanvas.style.height = `${rect.height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, roiCanvas.width, roiCanvas.height);

  const tiledImage = viewerInstance.world.getItemAt(0);
  if (!tiledImage) return;

  // 핸들 사이즈
  const HANDLE_SIZE = 8;

  // 선택된 ROI에 모서리 핸들 그리기
  const drawResizeHandles = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => {
    const handlePoints = [
      { x: p1.x, y: p1.y }, // top-left
      { x: p2.x, y: p1.y }, // top-right
      { x: p2.x, y: p2.y }, // bottom-right
      { x: p1.x, y: p2.y }, // bottom-left
    ];

    ctx.save();
    ctx.fillStyle = '#007BFF';
    handlePoints.forEach(({ x, y }) => {
      ctx.fillRect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE,
      );
    });
    ctx.restore();
  };

  // 1. 모델 ROI
  loadedROIs.forEach(({ bbox }) => {
    const vpTL = tiledImage.imageToViewportCoordinates(
      new OpenSeadragon.Point(bbox.x, bbox.y),
    );
    const vpBR = tiledImage.imageToViewportCoordinates(
      new OpenSeadragon.Point(bbox.x + bbox.w, bbox.y + bbox.h),
    );
    const p1 = viewerInstance.viewport.pixelFromPoint(vpTL);
    const p2 = viewerInstance.viewport.pixelFromPoint(vpBR);

    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();
  });

  // 2. 유저 ROI
  userDefinedROIs.forEach((roi) => {
    const p1 = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x, roi.y),
    );
    const p2 = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height),
    );

    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();
  });

  // 3. 선택 중인 ROI
  if (roi) {
    const p1 = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x, roi.y),
    );
    const p2 = viewerInstance.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height),
    );

    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    if (isSelectingROI) {
      ctx.setLineDash([6, 6]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();

    if (isEditingROI) {
      drawResizeHandles(ctx, p1, p2);
    }
  }
};

/**
 * inferenceResult에서 받은 ROI(bbox)를 viewport 좌표계로 변환
 */
export const getAllViewportROIs = (
  viewer: any,
  loadedROIs: LoadedROI[],
): ROI[] => {
  if (typeof window === 'undefined') return [];

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OpenSeadragon = require('openseadragon');

  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) return [];

  return loadedROIs.map((r) => {
    const tlImg = new OpenSeadragon.Point(r.bbox.x, r.bbox.y);
    const brImg = new OpenSeadragon.Point(
      r.bbox.x + r.bbox.w,
      r.bbox.y + r.bbox.h,
    );
    const vpTL = tiledImage.imageToViewportCoordinates(tlImg);
    const vpBR = tiledImage.imageToViewportCoordinates(brImg);
    return {
      x: vpTL.x,
      y: vpTL.y,
      width: vpBR.x - vpTL.x,
      height: vpBR.y - vpTL.y,
    };
  });
};

/**
 * 특정 Point가 ROI 리스트 중 하나에 포함되는지 여부
 */
export const isPointInsideROIs = (
  pt: { x: number; y: number },
  rois: ROI[],
): boolean => {
  const padding = 0.0001;
  return rois.some((roi) => {
    return (
      pt.x >= roi.x - padding &&
      pt.x <= roi.x + roi.width + padding &&
      pt.y >= roi.y - padding &&
      pt.y <= roi.y + roi.height + padding
    );
  });
};
