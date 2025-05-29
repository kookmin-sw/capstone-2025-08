import OpenSeadragon from 'openseadragon';
import { RoiResponseDto } from '@/generated-api';

/**
 * ROI(Viewport 기준)를 이미지 좌표계로 변환
 */
export const convertViewportROIToImageROI = (
  viewer: any,
  roi: RoiResponseDto,
): RoiResponseDto => {
  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) throw new Error('Tiled image not found.');

  const topLeftImage = tiledImage.viewportToImageCoordinates(
    new OpenSeadragon.Point(roi.x, roi.y),
  );
  const bottomRightImage = tiledImage.viewportToImageCoordinates(
    new OpenSeadragon.Point(roi.x! + roi.width!, roi.y! + roi.height!),
  );

  return {
    id: roi.id,
    x: Math.round(topLeftImage.x),
    y: Math.round(topLeftImage.y),
    width: Math.round(bottomRightImage.x - topLeftImage.x),
    height: Math.round(bottomRightImage.y - topLeftImage.y),
  };
};
