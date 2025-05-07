import ModelTrainingMetricsChart from '@/components/projects/model-training-metrics-chart';

const dummyMetrics = [
  { epoch: 1, loss: 0.9, iou: 0.45, f1: 0.52 },
  { epoch: 2, loss: 0.7, iou: 0.55, f1: 0.6 },
  { epoch: 3, loss: 0.5, iou: 0.62, f1: 0.68 },
  { epoch: 4, loss: 0.42, iou: 0.68, f1: 0.75 },
  { epoch: 5, loss: 0.35, iou: 0.73, f1: 0.81 },
];

export default function Performance() {
  return (
    <ModelTrainingMetricsChart
      data={dummyMetrics}
      f1Score={dummyMetrics.at(-1)?.f1 ?? 0}
    />
  );
}
