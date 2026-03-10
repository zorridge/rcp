'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { type ChartProps } from '../shell';
import { chartConfig, ChartMetricKey, ChartWrapper } from './chart-wrapper';

const THRESHOLD_LINES: Partial<
  Record<ChartMetricKey, { value: number; label: string }>
> = {
  pathEfficiency: { value: 85, label: 'Good (85%)' },
  sparc: { value: -2, label: 'Good (-2)' },
};

export function LineChartView({ data }: ChartProps) {
  return (
    <ChartWrapper data={data}>
      {(activeChart, chartData, averages) => (
        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            {/* Average reference line */}
            <ReferenceLine
              y={averages[activeChart]}
              stroke="var(--muted-foreground)"
              strokeDasharray="6 4"
              strokeWidth={1}
              label={{
                value: `Avg: ${averages[activeChart].toFixed(1)}`,
                position: 'insideTopRight',
                fill: 'var(--muted-foreground)',
                fontSize: 11,
              }}
            />
            {/* Clinical threshold line */}
            {THRESHOLD_LINES[activeChart] && (
              <ReferenceLine
                y={THRESHOLD_LINES[activeChart].value}
                stroke="var(--chart-3)"
                strokeDasharray="4 2"
                strokeWidth={1}
                label={{
                  value: THRESHOLD_LINES[activeChart].label,
                  position: 'insideBottomRight',
                  fill: 'var(--chart-3)',
                  fontSize: 11,
                }}
              />
            )}
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </ChartWrapper>
  );
}
