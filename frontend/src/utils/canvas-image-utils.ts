import { MaskTile } from '@/types/annotation';
import { RoiResponseDto, RoiResponsePayload } from '@/generated-api';

/**
 * 타일 이미지의 URL을 받아서 해당 타일을 처리하여 MaskTile 객체를 반환하는 함수
 */
export const processMaskTile = async (
  base: { x: number; y: number; width: number; height: number },
  url: string,
  showRedMask = true,
): Promise<MaskTile> =>
  new Promise((res, rej) => {
    if (typeof window === 'undefined') {
      rej(new Error('processMaskTile must be run in a browser environment.'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const filename = url.split('/').pop();
      if (!filename) {
        rej(new Error('Invalid URL, filename not found'));
        return;
      }

      const [row, col] = filename.replace('.png', '').split('_').map(Number);

      const cols = Math.round(base.width / img.width);
      const rows = Math.round(base.height / img.height);

      const tileW = base.width / cols;
      const tileH = base.height / rows;

      const off = document.createElement('canvas');
      off.width = img.width;
      off.height = img.height;

      const ctx = off.getContext('2d');
      if (!ctx) {
        rej(new Error('Failed to get 2D context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const d = ctx.getImageData(0, 0, off.width, off.height);

      for (let i = 0; i < d.data.length; i += 4) {
        const [r, g, b] = [d.data[i], d.data[i + 1], d.data[i + 2]];

        // 1) 항상: 검은색 픽셀은 투명
        if (r < 20 && g < 20 && b < 20) {
          d.data[i + 3] = 0;
          continue;
        }

        // 2) showRedMask===false일 때만: 빨간색 픽셀 숨김
        if (!showRedMask && r > 200 && g < 50 && b < 50) {
          d.data[i + 3] = 0;
        }
      }

      ctx.putImageData(d, 0, 0);

      const processed = new Image();
      processed.src = off.toDataURL();

      res({
        img: processed,
        x: base.x + col * tileW,
        y: base.y + row * tileH,
        w: tileW,
        h: tileH,
      });
    };

    img.onerror = rej;
  });

/**
 * 이미지 ROI를 동적으로 나누는 함수
 */
const getDivisionCountDynamic = (dimension: number): number => {
  if (dimension <= 20000) return 1;
  else if (dimension <= 30000) return 2;
  else if (dimension <= 40000) return 3;
  else {
    return 3 + Math.ceil((dimension - 40000) / 10000);
  }
};

/**
 * 어노테이션을 PNG로 내보내는 함수
 */
type ExportedImage = {
  roiId: number;
  filename: string;
  blob: Blob;
};

export const exportROIAsPNG = async (
  viewer: any,
  canvas: HTMLCanvasElement,
  loadedROIs: RoiResponsePayload[],
  userDefinedROIs: RoiResponseDto[],
  borderThickness = 2,
): Promise<ExportedImage[]> => {
  if (typeof window === 'undefined') return [];

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OpenSeadragon = require('openseadragon');
  if (!viewer || !canvas) return [];

  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) return [];

  const convertedLoadedROIs = loadedROIs.map((roi) => {
    const viewportRect = viewer.viewport.imageToViewportRectangle(
      new OpenSeadragon.Rect(
        roi.detail!.x,
        roi.detail!.y,
        roi.detail!.width,
        roi.detail!.height,
      ),
    );
    return {
      x: viewportRect.x,
      y: viewportRect.y,
      width: viewportRect.width,
      height: viewportRect.height,
      id: roi.detail?.id ?? -Math.floor(Math.random() * 1000000), // fallback ID
      ...roi,
    };
  });

  const convertedUserROIs = userDefinedROIs.map((roi) => ({
    ...roi,
    id: roi.id ?? -Math.floor(Math.random() * 1000000),
  }));

  const allROIs = [...convertedLoadedROIs, ...convertedUserROIs];

  const results: ExportedImage[] = [];
  const ratio = window.devicePixelRatio || 1;

  for (const roi of allROIs) {
    if (
      roi.x === undefined ||
      roi.y === undefined ||
      roi.width === undefined ||
      roi.height === undefined ||
      roi.id === undefined
    ) {
      continue;
    }

    const topLeftCanvas = viewer.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x, roi.y),
    );
    const bottomRightCanvas = viewer.viewport.pixelFromPoint(
      new OpenSeadragon.Point(roi.x + roi.width, roi.y + roi.height),
    );

    const canvasROI = {
      x: topLeftCanvas.x,
      y: topLeftCanvas.y,
      width: bottomRightCanvas.x - topLeftCanvas.x,
      height: bottomRightCanvas.y - topLeftCanvas.y,
    };

    const adjustedROI = {
      x: canvasROI.x + borderThickness,
      y: canvasROI.y + borderThickness,
      width: canvasROI.width - 2 * borderThickness,
      height: canvasROI.height - 2 * borderThickness,
    };

    const topLeftViewport = viewer.viewport.pointFromPixel(
      new OpenSeadragon.Point(adjustedROI.x, adjustedROI.y),
    );
    const bottomRightViewport = viewer.viewport.pointFromPixel(
      new OpenSeadragon.Point(
        adjustedROI.x + adjustedROI.width,
        adjustedROI.y + adjustedROI.height,
      ),
    );

    const topLeftImage = tiledImage.viewportToImageCoordinates(topLeftViewport);
    const bottomRightImage =
      tiledImage.viewportToImageCoordinates(bottomRightViewport);

    const totalExportWidth = Math.round(bottomRightImage.x - topLeftImage.x);
    const totalExportHeight = Math.round(bottomRightImage.y - topLeftImage.y);

    const cols = getDivisionCountDynamic(totalExportWidth);
    const rows = getDivisionCountDynamic(totalExportHeight);

    const sourceROI_X = adjustedROI.x * ratio;
    const sourceROI_Y = adjustedROI.y * ratio;
    const sourceROI_W = adjustedROI.width * ratio;
    const sourceROI_H = adjustedROI.height * ratio;

    const tileTargetWidth = totalExportWidth / cols;
    const tileTargetHeight = totalExportHeight / rows;
    const sourceTileWidth = sourceROI_W / cols;
    const sourceTileHeight = sourceROI_H / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sourceX = sourceROI_X + c * sourceTileWidth;
        const sourceY = sourceROI_Y + r * sourceTileHeight;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = Math.round(tileTargetWidth);
        offscreenCanvas.height = Math.round(tileTargetHeight);
        const offCtx = offscreenCanvas.getContext('2d');
        if (!offCtx) continue;

        offCtx.drawImage(
          canvas,
          sourceX,
          sourceY,
          sourceTileWidth,
          sourceTileHeight,
          0,
          0,
          offscreenCanvas.width,
          offscreenCanvas.height,
        );

        const imageData = offCtx.getImageData(
          0,
          0,
          offscreenCanvas.width,
          offscreenCanvas.height,
        );
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0 && data[i + 3] < 255) {
            data[i + 3] = 255;
          }
        }
        offCtx.putImageData(imageData, 0, 0);

        const filename = `${roi.id}_${r}_${c}.png`;

        const blob = await new Promise<Blob | null>((resolve) => {
          offscreenCanvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (blob) {
          results.push({
            roiId: roi.id,
            filename,
            blob,
          });
        }
      }
    }
  }

  return results;
};
