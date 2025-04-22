import {
  Project,
  SubProject,
  AnnotationHistory,
  InferenceHistory,
  Model,
  ModelType,
  ROI,
  TissueAnnotation,
  CellAnnotation,
} from '@/types/project-schema';

// 어노테이션 히스토리 더미 데이터 (배열로 변경)
export const dummyAnnotationHistory: AnnotationHistory[] = [
  {
    id: 88,
    subProjectId: 42,
    modelId: 5,
    startedAt: '2025-03-31T12:30:00Z',
    completeAt: '2025-04-01T03:00:00Z',
  },
  {
    id: 89,
    subProjectId: 43,
    modelId: 5,
    startedAt: '2025-04-01T13:00:00Z',
    completeAt: '2025-04-01T14:00:00Z',
  },
];

// 프로젝트 더미 데이터
export const dummyProjects: Project[] = [
  {
    id: 1,
    title: 'Example Project',
    description: 'This is an example project description.',
    thumbnail: 'thumbnail.png',
    userId: 1,
    modelId: 5,
    createdAt: '2025-03-31T12:00:00Z',
    updatedAt: '2025-03-31T12:00:00Z',
    history: dummyAnnotationHistory,
    modelType: 'TISSUE' as ModelType,
    modelName: 'Example Model',
  },
  {
    id: 2,
    title: 'Another Project',
    description: 'Another example description.',
    thumbnail: 'thumbnail2.png',
    userId: 2,
    modelId: 6,
    createdAt: '2025-04-01T12:00:00Z',
    updatedAt: '2025-04-01T12:00:00Z',
    history: dummyAnnotationHistory,
    modelType: 'MULTI' as ModelType,
    modelName: 'Example Model2',
  },
];

// 서브프로젝트 더미 데이터 (모델 추론 응답의 subProjectId와 일치)
export const dummySubProject: SubProject[] = [
  {
    id: 42,
    projectId: '1',
    svsPath: '/svs_example.svs',
    thumbnail: '/subproject-thumbnail.png',
  },
  {
    id: 43,
    projectId: '1',
    svsPath: '/svs_example.svs',
    thumbnail: '/subproject-thumbnail.png',
  },
  {
    id: 44,
    projectId: '1',
    svsPath: '/svs_example.svs',
    thumbnail: '/subproject-thumbnail.png',
  },
];

// 인퍼런스 히스토리 더미 데이터
export const dummyInferenceHistory: InferenceHistory = {
  id: 12,
  accuracy: 0.9375,
  loss: 0.1642,
  loopPerformance: 0.82,
};

// 모델 더미 데이터
export const dummyModel: Model = {
  id: 5,
  annotationHistoryId: 88,
  name: 'Example Model',
  modelType: 'CELL' as ModelType,
  modelVersion: 'v1.0',
  trainedAt: '2025-03-30T10:00:00Z',
};

// ROI 더미 데이터 (추후 어노테이션 및 export 기능에 활용)
export const dummyROI: ROI = {
  id: 101,
  annotationHistoryId: 88,
  x: 120,
  y: 85,
  width: 200,
  height: 200,
};

// Tissue Annotation 더미 데이터
export const dummyTissueAnnotation: TissueAnnotation = {
  id: 1,
  roiId: 101,
  imagePath: 'tissue_annotation_image.png',
};

// Cell Annotation 더미 데이터
export const dummyCellAnnotation: CellAnnotation = {
  id: 1,
  roiId: 101,
  x: 150,
  y: 100,
  radius: 15,
  color: '#ff0000',
  label: 'Cell A',
};

// 모델 추론 결과 응답 더미 데이터
export const dummyInferenceResults = [
  {
    inferenceId: 12,
    annotationHistoryId: 88,
    subProjectId: 42,
    modelId: 5,
    metrics: {
      accuracy: 0.9375,
      loss: 0.1642,
      loopPerformance: 0.82,
    },
    completedAt: '2025-04-01T03:14:00Z',
    results: [
      {
        roiId: 101,
        x: 63465,
        y: 11220,
        width: 31248,
        height: 27978,
        maskUrl: [
          '/0_0.png',
          '/0_1.png',
          '/0_2.png',
          '/1_0.png',
          '/1_1.png',
          '/1_2.png',
        ],
      },
    ],
  },
];
