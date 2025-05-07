'use client';

import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { useOsdviewer } from '@/hooks/use-osdviewer';

const AnnotationTestViewer: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewerInstance = useOsdviewer(viewerRef);

  useEffect(() => {
    const viewer = viewerInstance.current;
    if (!viewer) return;

    // 초기화
    viewer.world.removeAll();
    viewer.viewport.zoomTo(1);
    viewer.viewport.panTo(new OpenSeadragon.Point(0.5, 0.5));

    // 타일 소스 로딩
    OpenSeadragon.GeoTIFFTileSource.getAllTileSources('/svs_example.svs').then(
      ([tileSource]: [any]) => {
        if (tileSource) {
          viewer.addTiledImage({ tileSource });
        }
      },
    );
  }, [viewerInstance]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="relative h-[600px] w-[900px] border bg-white">
        <div ref={viewerRef} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default AnnotationTestViewer;
