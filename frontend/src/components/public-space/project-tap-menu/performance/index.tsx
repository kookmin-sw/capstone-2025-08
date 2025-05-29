import ModelTrainingMetricsChart from '@/components/projects/model-training-metrics-chart';
import { AnalyticsDto } from '@/generated-api';

const dummyMetricsArray = [
  { loss: 0.9, iou: 0.45 },
  { loss: 0.7, iou: 0.55 },
  { loss: 0.5, iou: 0.62 },
  { loss: 0.42, iou: 0.68 },
  { loss: 0.35, iou: 0.73 },
];

const analyticsDto: AnalyticsDto = {
  loss: dummyMetricsArray.map((d) => d.loss),
  iou: dummyMetricsArray.map((d) => d.iou),
  f1Score: 0.81,
};

export default function Performance() {
  return (
    <ModelTrainingMetricsChart
      data={analyticsDto}
      f1Score={analyticsDto.f1Score ?? 0}
    />
  );
}
