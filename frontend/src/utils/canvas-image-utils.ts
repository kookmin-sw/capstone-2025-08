import { ROI, LoadedROI, MaskTile } from '@/types/annotation';
import { getAllViewportROIs } from '@/utils/canvas-roi-utils';

/**
 * 타일 이미지의 URL을 받아서 해당 타일을 처리하여 MaskTile 객체를 반환하는 함수
 */
export const processMaskTile = async (
  base: { x: number; y: number; width: number; height: number },
  url: string,
): Promise<MaskTile> =>
  new Promise((res, rej) => {
    if (typeof window === 'undefined') {
      rej(new Error('processMaskTile must be run in a browser environment.'));
      return;
    }

    const img = new Image();
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
        const r = d.data[i];
        const g = d.data[i + 1];
        const b = d.data[i + 2];

        if (r < 20 && g < 20 && b < 20) {
          d.data[i + 3] = 0;
        } else {
          d.data[i + 3] = 255;
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
export const exportROIAsPNG = async (
  viewer: any,
  canvas: HTMLCanvasElement,
  loadedROIs: LoadedROI[],
  userDefinedROIs: ROI[],
  borderThickness = 2,
) => {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OpenSeadragon = require('openseadragon');
  if (!viewer || !canvas) return;

  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) return;

  const allROIs: ROI[] = [
    ...getAllViewportROIs(viewer, loadedROIs),
    ...userDefinedROIs,
  ];

  for (let i = 0; i < allROIs.length; i++) {
    const roi = allROIs[i];

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

    const imageROI = {
      x: Math.round(topLeftImage.x),
      y: Math.round(bottomRightImage.y),
      width: Math.round(bottomRightImage.x - topLeftImage.x),
      height: Math.round(bottomRightImage.y - topLeftImage.y),
    };

    const totalExportWidth = imageROI.width;
    const totalExportHeight = imageROI.height;
    const cols = getDivisionCountDynamic(totalExportWidth);
    const rows = getDivisionCountDynamic(totalExportHeight);

    const ratio = window.devicePixelRatio || 1;

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

        await new Promise<void>((resolve) => {
          offscreenCanvas.toBlob((blob) => {
            if (!blob) return resolve();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${i}_${r}_${c}.png`; // TODO: (현진) 실제 백엔드 연결 시 r_c 로 변경
            a.click();
            URL.revokeObjectURL(url);
            setTimeout(resolve, 200);
          }, 'image/png');
        });
      }
    }
  }
};
