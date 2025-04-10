import OpenSeadragon from 'openseadragon';
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
) => {
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
    ctx.setLineDash(isSelectingROI ? [6, 6] : []);
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.restore();
  }
};

/**
 * inferenceResult에서 받은 ROI(bbox)를 viewport 좌표계로 변환
 */
export const getAllViewportROIs = (
  viewer: any,
  loadedROIs: LoadedROI[],
): ROI[] => {
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

/**
 * ROI(Viewport 기준)를 이미지 좌표계로 변환
 */
export const convertViewportROIToImageROI = (viewer: any, roi: ROI): ROI => {
  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) throw new Error('Tiled image not found.');

  const topLeftImage = tiledImage.viewportToImageCoordinates(
    new OpenSeadragon.Point(roi.x, roi.y),
  );
  const bottomRightImage = tiledImage.viewportToImageCoordinates(
    new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height),
  );

  return {
    x: Math.round(topLeftImage.x),
    y: Math.round(topLeftImage.y),
    width: Math.round(bottomRightImage.x - topLeftImage.x),
    height: Math.round(bottomRightImage.y - topLeftImage.y),
  };
};
