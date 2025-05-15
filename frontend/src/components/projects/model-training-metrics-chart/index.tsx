'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { AnalyticsDto } from '@/generated-api';

interface ModelTrainingMetricsChartProps {
  data: AnalyticsDto;
  f1Score: number;
}

function prepareChartData(analytics: AnalyticsDto) {
  const { epochs = [], loss = [], iou = [] } = analytics;
  return epochs.map((epoch, index) => ({
    epoch,
    loss: loss[index] ?? null,
    iou: iou[index] ?? null,
  }));
}

export default function ModelTrainingMetricsChart({
  data,
  f1Score,
}: ModelTrainingMetricsChartProps) {
  const chartData = prepareChartData(data);

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Loss */}
      <div className="flex flex-col gap-2">
        <div>
          <Label className="text-md font-semibold">Loss</Label>
          <p className="text-muted-foreground text-sm">
            Indicates the model’s training loss, which should decrease over time
            as the model learns.
          </p>
        </div>
        <Card>
          <CardContent className="h-60 pt-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No loss data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. IoU */}
      <div className="flex flex-col gap-2">
        <div>
          <Label className="text-md font-semibold">IoU</Label>
          <p className="text-muted-foreground text-sm">
            Shows the Intersection over Union (IoU) score for each epoch,
            representing how well predictions overlap with the ground truth.
          </p>
        </div>
        <Card>
          <CardContent className="h-60 pt-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="epoch" />
                  <YAxis domain={[0, 1]} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="iou"
                    stroke="#3b82f6"
                    fill="#dbeafe"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No IoU data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. F1 Score */}
      <div className="flex flex-col gap-2">
        <div>
          <Label className="text-md font-semibold">F1 Score</Label>
          <p className="text-muted-foreground text-sm">
            Displays the model’s current F1 Score — the harmonic mean of
            precision and recall — as an indicator of overall performance.
          </p>
        </div>
        <Card>
          <CardContent className="h-60 pt-6">
            {f1Score > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="90%"
                  barSize={12}
                  data={[{ name: 'F1 Score', value: f1Score, fill: '#10b981' }]}
                  startAngle={180}
                  endAngle={-180}
                >
                  <RadialBar background dataKey="value" cornerRadius={5} />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="center"
                    formatter={() => `F1: ${(f1Score * 100).toFixed(1)}%`}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No F1 score available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
