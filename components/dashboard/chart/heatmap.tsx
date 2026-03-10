'use client';

import { useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getHeatmapColor } from '@/lib/metric-helpers';
import { MetricRow } from '@/scripts/transform';

import { type ChartProps } from '../shell';

interface SessionMetrics {
  session: string;
  date: string;
  avgEfficiency: number;
  avgForce: number;
  avgArea: number;
  avgSparc: number;
}

interface HeatmapCell {
  value: number;
  normalized: number;
  session: string;
  date: string;
  metric: string;
}

const METRICS = [
  { key: 'avgEfficiency' as const, label: 'Path Efficiency' },
  { key: 'avgForce' as const, label: 'Force' },
  { key: 'avgArea' as const, label: 'Range of Motion' },
  { key: 'avgSparc' as const, label: 'SPARC' },
];

export function HeatmapView({ data }: ChartProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const { sessions, grid } = useMemo(() => {
    if (data.length === 0) return { sessions: [], grid: [] };

    // Group by session
    const sessionMap = new Map<string, MetricRow[]>();
    for (const row of data) {
      const key = row.session;
      if (!sessionMap.has(key)) sessionMap.set(key, []);
      sessionMap.get(key)!.push(row);
    }

    // Compute per-session averages
    const sessionData: SessionMetrics[] = [];
    for (const [session, rows] of sessionMap) {
      const sorted = [...rows].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      sessionData.push({
        session,
        date: new Date(sorted[0].timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        avgEfficiency:
          rows.reduce((s, r) => s + r.avg_efficiency, 0) / rows.length,
        avgForce:
          rows.reduce((s, r) => s + r.avg_f_patient, 0) / rows.length,
        avgArea: rows.reduce((s, r) => s + r.area, 0) / rows.length,
        avgSparc: rows.reduce((s, r) => s + r.avg_sparc, 0) / rows.length,
      });
    }

    // Sort sessions chronologically
    sessionData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Compute min/max per metric for normalization
    const ranges: Record<string, { min: number; max: number }> = {};
    for (const m of METRICS) {
      let min = Infinity;
      let max = -Infinity;
      for (const s of sessionData) {
        const v = s[m.key];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      ranges[m.key] = { min, max };
    }

    const normalize = (value: number, key: string) => {
      const { min, max } = ranges[key];
      if (max === min) return 50;
      return ((value - min) / (max - min)) * 100;
    };

    // Build grid: rows = metrics, columns = sessions
    const grid = METRICS.map((m) =>
      sessionData.map((s) => ({
        value: s[m.key],
        normalized: normalize(s[m.key], m.key),
        session: s.session,
        date: s.date,
        metric: m.label,
      }))
    );

    return { sessions: sessionData, grid };
  }, [data]);

  if (sessions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session Comparison</CardTitle>
          <CardDescription>
            How do metrics compare across sessions?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Comparison</CardTitle>
        <CardDescription>
          How do metrics compare across sessions?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${sessions.length}, minmax(48px, 1fr))`,
            }}
          >
            {/* Header row — session labels */}
            <div />
            {sessions.map((s) => (
              <div
                key={s.session}
                className="text-muted-foreground truncate text-center text-xs"
                title={s.session}
              >
                {s.date}
              </div>
            ))}

            {/* Data rows */}
            {grid.map((row, ri) => (
              <>
                <div
                  key={`label-${ri}`}
                  className="text-muted-foreground flex items-center text-xs font-medium"
                >
                  {METRICS[ri].label}
                </div>
                {row.map((cell, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className="relative flex aspect-square items-center justify-center rounded-sm text-xs font-medium text-white"
                    style={{ backgroundColor: getHeatmapColor(cell.normalized) }}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hoveredCell === cell && (
                      <div className="bg-popover text-popover-foreground border-border absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md border px-3 py-2 text-xs whitespace-nowrap shadow-md">
                        <div className="font-semibold">{cell.metric}</div>
                        <div>
                          {cell.session} ({cell.date})
                        </div>
                        <div>Value: {cell.value.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ))}
          </div>

          {/* Color scale legend */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Worse</span>
            <div className="flex h-3 flex-1 overflow-hidden rounded-full">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    backgroundColor: getHeatmapColor((i / 19) * 100),
                  }}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-xs">Better</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
