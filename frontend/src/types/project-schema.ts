export interface Project {
  id: number;
  title: string;
  description: string;
  userId: number;
  modelId: number;
  createdAt: string;
  updatedAt: string;
  history: AnnotationHistory[];
  modelType: ModelType;
  modelName: string;
}

export interface SubProject {
  id: number;
  projectId: string;
  svsPath: string;
  thumbnail: string;
  size: number;
  uploadedOn: string;
}

export interface AnnotationHistory {
  id: number;
  subProjectId: number;
  modelId: number;
  startedAt: string;
  completeAt: string;
}

export interface InferenceHistory {
  id: number;
  accuracy: number;
  loss: number;
  loopPerformance: number;
}

export interface Model {
  id: number;
  annotationHistoryId: number;
  name: string;
  modelType: ModelType;
  modelVersion: string;
  trainedAt: string;
}

export type ModelType = 'CELL' | 'TISSUE' | 'MULTI';

export interface ROI {
  id: number;
  annotationHistoryId: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TissueAnnotation {
  id: number;
  roiId: number;
  imagePath: string;
}

export interface CellAnnotation {
  id: number;
  roiId: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
}
