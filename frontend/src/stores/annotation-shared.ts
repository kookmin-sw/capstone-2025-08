import { create } from 'zustand';
import { Polygon } from '@/types/annotation';
import {
  GetProjectAnnotationResponseDto,
  ProjectLabelDto,
  RoiResponseDto,
  RoiResponsePayload,
  SubProjectResponseDto,
} from '@/generated-api';

interface AnnotationSharedState {
  viewer: OpenSeadragon.Viewer | null;
  canvas: HTMLCanvasElement | null;
  loadedROIs: RoiResponsePayload[];
  userDefinedROIs: RoiResponseDto[];
  cellPolygons: Polygon[];
  labels: ProjectLabelDto[];
  selectedSubProject: SubProjectResponseDto | null;
  selectedAnnotationHistoryId: number | null;
  project: GetProjectAnnotationResponseDto | null;

  setViewer: (viewer: OpenSeadragon.Viewer | null) => void;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  setLoadedROIs: (rois: RoiResponsePayload[]) => void;
  setUserDefinedROIs: (rois: RoiResponseDto[]) => void;
  setCellPolygons: (polygons: Polygon[]) => void;
  setLabels: (labels: ProjectLabelDto[]) => void;
  setSelectedSubProject: (subProject: SubProjectResponseDto | null) => void;
  setSelectedAnnotationHistoryId: (id: number | null) => void;
  setProject: (project: GetProjectAnnotationResponseDto | null) => void;
}

export const useAnnotationSharedStore = create<AnnotationSharedState>(
  (set) => ({
    viewer: null,
    canvas: null,
    loadedROIs: [],
    userDefinedROIs: [],
    cellPolygons: [],
    labels: [],
    selectedSubProject: [],
    selectedAnnotationHistoryId: null,
    project: [],

    setViewer: (viewer) => set({ viewer }),
    setCanvas: (canvas) => set({ canvas }),
    setLoadedROIs: (rois) => set({ loadedROIs: rois }),
    setUserDefinedROIs: (rois) => set({ userDefinedROIs: rois }),
    setCellPolygons: (polygons) => set({ cellPolygons: polygons }),
    setLabels: (labels) => set({ labels }),
    setSelectedSubProject: (subProject) =>
      set({ selectedSubProject: subProject }),
    setSelectedAnnotationHistoryId: (id) =>
      set({ selectedAnnotationHistoryId: id }),
    setProject: (project) => set({ project: project }),
  }),
);
