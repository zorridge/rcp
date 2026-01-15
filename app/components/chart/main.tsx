'use client';

import * as React from 'react';
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

export const description = 'An interactive line chart';

const chartData = [
  { date: '2025-11-01', desktop: 222, mobile: 150 },
  { date: '2025-11-02', desktop: 97, mobile: 180 },
  { date: '2025-11-03', desktop: 167, mobile: 120 },
  { date: '2025-11-04', desktop: 242, mobile: 260 },
  { date: '2025-11-05', desktop: 373, mobile: 290 },
  { date: '2025-11-06', desktop: 301, mobile: 340 },
  { date: '2025-11-07', desktop: 245, mobile: 180 },
  { date: '2025-11-08', desktop: 409, mobile: 320 },
  { date: '2025-11-09', desktop: 59, mobile: 110 },
  { date: '2025-11-10', desktop: 261, mobile: 190 },
  { date: '2025-11-11', desktop: 327, mobile: 350 },
  { date: '2025-11-12', desktop: 292, mobile: 210 },
  { date: '2025-11-13', desktop: 342, mobile: 380 },
  { date: '2025-11-14', desktop: 137, mobile: 220 },
  { date: '2025-11-15', desktop: 120, mobile: 170 },
  { date: '2025-11-16', desktop: 138, mobile: 190 },
  { date: '2025-11-17', desktop: 446, mobile: 360 },
  { date: '2025-11-18', desktop: 364, mobile: 410 },
  { date: '2025-11-19', desktop: 243, mobile: 180 },
  { date: '2025-11-20', desktop: 89, mobile: 150 },
  { date: '2025-11-21', desktop: 137, mobile: 200 },
  { date: '2025-11-22', desktop: 224, mobile: 170 },
  { date: '2025-11-23', desktop: 138, mobile: 230 },
  { date: '2025-11-24', desktop: 387, mobile: 290 },
  { date: '2025-11-25', desktop: 215, mobile: 250 },
  { date: '2025-11-26', desktop: 75, mobile: 130 },
  { date: '2025-11-27', desktop: 383, mobile: 420 },
  { date: '2025-11-28', desktop: 122, mobile: 180 },
  { date: '2025-11-29', desktop: 315, mobile: 240 },
  { date: '2025-11-30', desktop: 454, mobile: 380 },
  { date: '2025-12-01', desktop: 165, mobile: 220 },
  { date: '2025-12-02', desktop: 293, mobile: 310 },
  { date: '2025-12-03', desktop: 247, mobile: 190 },
  { date: '2025-12-04', desktop: 385, mobile: 420 },
  { date: '2025-12-05', desktop: 481, mobile: 390 },
  { date: '2025-12-06', desktop: 498, mobile: 520 },
  { date: '2025-12-07', desktop: 388, mobile: 300 },
  { date: '2025-12-08', desktop: 149, mobile: 210 },
  { date: '2025-12-09', desktop: 227, mobile: 180 },
  { date: '2025-12-10', desktop: 293, mobile: 330 },
  { date: '2025-12-11', desktop: 335, mobile: 270 },
  { date: '2025-12-12', desktop: 197, mobile: 240 },
  { date: '2025-12-13', desktop: 197, mobile: 160 },
  { date: '2025-12-14', desktop: 448, mobile: 490 },
  { date: '2025-12-15', desktop: 473, mobile: 380 },
  { date: '2025-12-16', desktop: 338, mobile: 400 },
  { date: '2025-12-17', desktop: 499, mobile: 420 },
  { date: '2025-12-18', desktop: 315, mobile: 350 },
  { date: '2025-12-19', desktop: 235, mobile: 180 },
  { date: '2025-12-20', desktop: 177, mobile: 230 },
  { date: '2025-12-21', desktop: 82, mobile: 140 },
  { date: '2025-12-22', desktop: 81, mobile: 120 },
  { date: '2025-12-23', desktop: 252, mobile: 290 },
  { date: '2025-12-24', desktop: 294, mobile: 220 },
  { date: '2025-12-25', desktop: 201, mobile: 250 },
  { date: '2025-12-26', desktop: 213, mobile: 170 },
  { date: '2025-12-27', desktop: 420, mobile: 460 },
  { date: '2025-12-28', desktop: 233, mobile: 190 },
  { date: '2025-12-29', desktop: 78, mobile: 130 },
  { date: '2025-12-30', desktop: 340, mobile: 280 },
  { date: '2025-12-31', desktop: 178, mobile: 230 },
  { date: '2026-01-01', desktop: 178, mobile: 200 },
  { date: '2026-01-02', desktop: 470, mobile: 410 },
  { date: '2026-01-03', desktop: 103, mobile: 160 },
  { date: '2026-01-04', desktop: 439, mobile: 380 },
  { date: '2026-01-05', desktop: 88, mobile: 140 },
  { date: '2026-01-06', desktop: 294, mobile: 250 },
  { date: '2026-01-07', desktop: 323, mobile: 370 },
  { date: '2026-01-08', desktop: 385, mobile: 320 },
  { date: '2026-01-09', desktop: 438, mobile: 480 },
  { date: '2026-01-10', desktop: 155, mobile: 200 },
  { date: '2026-01-11', desktop: 92, mobile: 150 },
  { date: '2026-01-12', desktop: 492, mobile: 420 },
  { date: '2026-01-13', desktop: 81, mobile: 130 },
  { date: '2026-01-14', desktop: 426, mobile: 380 },
  { date: '2026-01-15', desktop: 307, mobile: 350 },
  { date: '2026-01-16', desktop: 371, mobile: 310 },
  { date: '2026-01-17', desktop: 475, mobile: 520 },
  { date: '2026-01-18', desktop: 107, mobile: 170 },
  { date: '2026-01-19', desktop: 341, mobile: 290 },
  { date: '2026-01-20', desktop: 408, mobile: 450 },
  { date: '2026-01-21', desktop: 169, mobile: 210 },
  { date: '2026-01-22', desktop: 317, mobile: 270 },
  { date: '2026-01-23', desktop: 480, mobile: 530 },
  { date: '2026-01-24', desktop: 132, mobile: 180 },
  { date: '2026-01-25', desktop: 141, mobile: 190 },
  { date: '2026-01-26', desktop: 434, mobile: 380 },
  { date: '2026-01-27', desktop: 448, mobile: 490 },
  { date: '2026-01-28', desktop: 149, mobile: 200 },
  { date: '2026-01-29', desktop: 103, mobile: 160 },
  { date: '2026-01-30', desktop: 446, mobile: 400 },
];

const chartConfig = {
  views: {
    label: 'Page Views',
  },
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function Chart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('desktop');

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  );

  return (
    <Card className="size-full">
      {/* <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Line Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {['desktop', 'mobile'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader> */}
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
              dataKey="date"
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
                  className="w-[150px]"
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
