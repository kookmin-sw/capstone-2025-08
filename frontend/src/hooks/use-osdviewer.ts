import { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { enableGeoTIFFTileSource } from 'geotiff-tilesource';

enableGeoTIFFTileSource(OpenSeadragon);

export const useOsdviewer = (
  viewerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    viewerInstance.current = new OpenSeadragon.Viewer({
      element: viewerRef.current,
      showNavigator: false,
      animationTime: 0,
      showNavigationControl: false,
      gestureSettingsMouse: { dragToPan: true },
    });

    return () => {
      viewerInstance.current?.destroy();
    };
  }, [viewerRef]);

  return viewerInstance;
};
