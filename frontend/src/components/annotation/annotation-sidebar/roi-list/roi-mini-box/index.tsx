'use client';

import { RoiResponseDto } from '@/generated-api';

export default function MiniBox({ roi }: { roi: RoiResponseDto }) {
  if (
    roi.width === undefined ||
    roi.height === undefined ||
    roi.width === 0 ||
    roi.height === 0
  ) {
    return null; // 아무것도 렌더링하지 않음
  }

  const aspectRatio = roi.width / roi.height;
  const boxSize = 40;

  let displayWidth = boxSize;
  let displayHeight = boxSize;

  if (aspectRatio > 1) {
    // 가로로 더 긴 ROI → width 기준 맞추고 height 줄임
    displayHeight = boxSize / aspectRatio;
  } else {
    // 세로로 더 긴 ROI → height 기준 맞추고 width 줄임
    displayWidth = boxSize * aspectRatio;
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center">
      <div
        className="border border-black bg-black/20"
        style={{
          width: displayWidth,
          height: displayHeight,
        }}
      />
    </div>
  );
}
