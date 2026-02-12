'use client';

import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { type ChartProps } from '../shell';

const chartConfig = {
  first: {
    label: 'First Session',
    color: 'var(--chart-1)',
  },
  latest: {
    label: 'Latest Session',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface RadarDataPoint {
  metric: string;
  first: number;
  latest: number;
}

export function RadarChartView({ data }: ChartProps) {
  const radarData = useMemo<RadarDataPoint[]>(() => {
    if (data.length === 0) return [];

    const sorted = [...data].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    // Compute min/max across all data for normalization
    const ranges = {
      avg_efficiency: { min: Infinity, max: -Infinity },
      avg_f_patient: { min: Infinity, max: -Infinity },
      area: { min: Infinity, max: -Infinity },
      avg_sparc: { min: Infinity, max: -Infinity },
    } as const;

    const stats = { ...ranges } as Record<
      keyof typeof ranges,
      { min: number; max: number }
    >;

    for (const row of data) {
      for (const key of Object.keys(stats) as Array<keyof typeof stats>) {
        if (row[key] < stats[key].min) stats[key].min = row[key];
        if (row[key] > stats[key].max) stats[key].max = row[key];
      }
    }

    const normalize = (value: number, key: keyof typeof stats) => {
      const { min, max } = stats[key];
      if (max === min) return 50;
      return ((value - min) / (max - min)) * 100;
    };

    return [
      {
        metric: 'Path Efficiency',
        first: normalize(first.avg_efficiency, 'avg_efficiency'),
        latest: normalize(latest.avg_efficiency, 'avg_efficiency'),
      },
      {
        metric: 'Force',
        first: normalize(first.avg_f_patient, 'avg_f_patient'),
        latest: normalize(latest.avg_f_patient, 'avg_f_patient'),
      },
      {
        metric: 'Range of Motion',
        first: normalize(first.area, 'area'),
        latest: normalize(latest.area, 'area'),
      },
      {
        metric: 'SPARC',
        first: normalize(first.avg_sparc, 'avg_sparc'),
        latest: normalize(latest.avg_sparc, 'avg_sparc'),
      },
    ];
  }, [data]);

  const sessionCount = data.length;

  return (
    <Card className="size-full pt-0">
      <CardHeader className="gap-1 border-b px-6 py-6">
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          Comparing first vs. latest session across {sessionCount} session
          {sessionCount !== 1 ? 's' : ''} (normalized 0 - 100)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        {radarData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full min-h-[250px] w-full"
          >
            <RechartsRadarChart data={radarData}>
              <ChartTooltip
                content={<ChartTooltipContent className="w-[200px]" />}
              />
              <PolarAngleAxis dataKey="metric" />
              <PolarGrid />
              <Radar
                name="First Session"
                dataKey="first"
                fill="var(--color-first)"
                fillOpacity={0.2}
                stroke="var(--color-first)"
                strokeWidth={2}
              />
              <Radar
                name="Latest Session"
                dataKey="latest"
                fill="var(--color-latest)"
                fillOpacity={0.2}
                stroke="var(--color-latest)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </RechartsRadarChart>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground text-sm">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}
