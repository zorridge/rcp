'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { MetricRow } from '@/scripts/transform';

export const description = 'An interactive line chart';

const chartConfig = {
  pathEfficiency: {
    label: 'Path Efficiency',
    color: 'var(--chart-1)',
  },
  force: {
    label: 'Force',
    color: 'var(--chart-2)',
  },
  rangeOfMotion: {
    label: 'Range of Motion',
    color: 'var(--chart-3)',
  },
  sparc: {
    label: 'SPARC',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

interface ChartProps {
  data: MetricRow[];
  patientId: string;
  gameId: string;
  dateRange: DateRange | undefined;
}

export function Chart({ data, patientId, gameId, dateRange }: ChartProps) {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>('pathEfficiency');

  const chartData = useMemo(() => {
    return data.map((row) => ({
      timestamp: row.timestamp,
      pathEfficiency: row.avg_efficiency,
      force: row.avg_f_patient,
      rangeOfMotion: row.area * 10000, // Convert m^2 to cm^2
      sparc: row.avg_sparc,
    }));
  }, [data]);

  const averages = useMemo(() => {
    if (chartData.length === 0) {
      return {
        pathEfficiency: 0,
        force: 0,
        rangeOfMotion: 0,
        sparc: 0,
      };
    }

    return {
      pathEfficiency:
        chartData.reduce((acc, curr) => acc + curr.pathEfficiency, 0) /
        chartData.length,
      force:
        chartData.reduce((acc, curr) => acc + curr.force, 0) / chartData.length,
      rangeOfMotion:
        chartData.reduce((acc, curr) => acc + curr.rangeOfMotion, 0) /
        chartData.length,
      sparc:
        chartData.reduce((acc, curr) => acc + curr.sparc, 0) / chartData.length,
    };
  }, [chartData]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <Card className="size-full pt-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Showing average metrics across {chartData.length} session
            {chartData.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <div className="flex flex-wrap">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (key) => {
              return (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {averages[key].toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full min-h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
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
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
