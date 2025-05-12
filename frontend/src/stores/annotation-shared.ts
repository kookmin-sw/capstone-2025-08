import { create } from 'zustand';
import { ROI, LoadedROI, Polygon } from '@/types/annotation';
import { Label } from '@/types/annotation-sidebar';

interface AnnotationSharedState {
  viewer: OpenSeadragon.Viewer | null;
  canvas: HTMLCanvasElement | null;
  loadedROIs: LoadedROI[];
  userDefinedROIs: ROI[];
  cellPolygons: Polygon[];
  labels: Label[];
  setViewer: (viewer: OpenSeadragon.Viewer | null) => void;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  setLoadedROIs: (rois: LoadedROI[]) => void;
  setUserDefinedROIs: (rois: ROI[]) => void;
  setCellPolygons: (polygons: Polygon[]) => void;
  setLabels: (labels: Label[]) => void;
}

export const useAnnotationSharedStore = create<AnnotationSharedState>(
  (set) => ({
    viewer: null,
    canvas: null,
    loadedROIs: [],
    userDefinedROIs: [],
    cellPolygons: [],
    labels: [],
    setViewer: (viewer) => set({ viewer }),
    setCanvas: (canvas) => set({ canvas }),
    setLoadedROIs: (rois) => set({ loadedROIs: rois }),
    setUserDefinedROIs: (rois) => set({ userDefinedROIs: rois }),
    setCellPolygons: (polygons) => set({ cellPolygons: polygons }),
    setLabels: (labels) => set({ labels }),
  }),
);
