'use client';

import {
  CircleUserIcon,
  HelpCircleIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { METRIC_CONFIG } from '@/lib/metric-config';
import {
  calculateAreaCoverage,
  getEfficiencyGrade,
  getForceInterpretation,
  getSparcGrade,
} from '@/lib/metric-helpers';
import { MetricRow } from '@/scripts/transform';

import { AreaVisualization } from './area-visualization';
import { HeatmapView } from './chart/heatmap';
import { LineChartView } from './chart/line-chart';
import { RadarChartView } from './chart/radar-chart';
import { Chat } from './chat/main';

function MetricInfoButton({
  metricKey,
  children,
}: {
  metricKey: keyof typeof METRIC_CONFIG;
  children?: React.ReactNode;
}) {
  const config = METRIC_CONFIG[metricKey];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-full transition-colors">
          <HelpCircleIcon className="size-3.5" />
          <span className="sr-only">Learn about {config.name}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.name}</DialogTitle>
          <DialogDescription>{config.why}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground mb-1 font-medium">
              How it&apos;s calculated
            </p>
            <p>{config.derivation}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 font-medium">
              Expected range
            </p>
            <p>{config.bounds.summary}</p>
          </div>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface ChartProps {
  data: MetricRow[];
  patientId: string;
  gameId: string;
  dateRange: DateRange | undefined;
}

export function DashboardShell() {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [patientOptions, setPatientOptions] = useState<string[]>([]);

  const [patientId, setPatientId] = useState<string>('');
  const [gameId, setGameId] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>();

  const gameOptions = useMemo(() => {
    if (!patientId) return [];

    return Array.from(
      new Set(
        metrics.filter((m) => m.patient_id === patientId).map((m) => m.game)
      )
    );
  }, [metrics, patientId]);

  const filteredMetrics = useMemo(() => {
    if (!patientId || !gameId) return [];

    return metrics.filter((m) => {
      if (m.patient_id !== patientId) return false;
      if (m.game !== gameId) return false;

      if (dateRange?.from || dateRange?.to) {
        const t = new Date(m.timestamp).getTime();

        if (dateRange.from && t < dateRange.from.getTime()) return false;
        if (dateRange.to && t > dateRange.to.getTime()) return false;
      }

      return true;
    });
  }, [metrics, patientId, gameId, dateRange]);

  const kpis = useMemo(() => {
    if (filteredMetrics.length === 0) {
      return {
        efficiency: { value: null, change: null, avg: null },
        force: { value: null, change: null, avg: null },
        area: { value: null, change: null, avg: null },
        sparc: { value: null, change: null, avg: null },
        sessionCount: 0,
      };
    }

    const sorted = [...filteredMetrics].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const latest = sorted[0];
    const previous = sorted[1] ?? null;

    const calcChange = (current: number, prev: number | null) =>
      prev !== null && prev !== 0
        ? ((current - prev) / Math.abs(prev)) * 100
        : null;

    const n = filteredMetrics.length;
    const avgEfficiency =
      filteredMetrics.reduce((s, r) => s + r.avg_efficiency, 0) / n;
    const avgForce =
      filteredMetrics.reduce((s, r) => s + r.avg_f_patient, 0) / n;
    const avgArea = filteredMetrics.reduce((s, r) => s + r.area, 0) / n;
    const avgSparc =
      filteredMetrics.reduce((s, r) => s + r.avg_sparc, 0) / n;

    return {
      efficiency: {
        value: latest.avg_efficiency,
        change: previous
          ? calcChange(latest.avg_efficiency, previous.avg_efficiency)
          : null,
        avg: avgEfficiency,
      },
      force: {
        value: latest.avg_f_patient,
        change: previous
          ? calcChange(latest.avg_f_patient, previous.avg_f_patient)
          : null,
        avg: avgForce,
      },
      area: {
        value: latest.area,
        change: previous ? calcChange(latest.area, previous.area) : null,
        avg: avgArea,
      },
      sparc: {
        value: latest.avg_sparc,
        change: previous
          ? calcChange(latest.avg_sparc, previous.avg_sparc)
          : null,
        avg: avgSparc,
      },
      sessionCount: n,
    };
  }, [filteredMetrics]);

  useEffect(() => {
    fetch('/data/metrics_filtered.json')
      .then((res) => res.json())
      .then((data: MetricRow[]) => {
        setMetrics(data);

        const patients = Array.from(new Set(data.map((d) => d.patient_id)));
        const gamesForPatient = Array.from(
          new Set(
            data.filter((d) => d.patient_id === patients[0]).map((d) => d.game)
          )
        );

        setPatientOptions(patients);
        setPatientId(patients[0] ?? '');
        setGameId(gamesForPatient[0] ?? '');
      });
  }, []);

  const chartProps: ChartProps = {
    data: filteredMetrics,
    patientId,
    gameId,
    dateRange,
  };

  return (
    <div className="flex h-screen w-full flex-col p-6">
      <div className="flex flex-1 flex-col gap-6 overflow-hidden">
        {/* Sticky filters row */}
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-3">
            <div className="flex flex-col gap-3">
              <Label htmlFor="PatientId">Patient ID</Label>
              <Select
                value={patientId}
                onValueChange={(value) => {
                  const gamesForPatient = Array.from(
                    new Set(
                      metrics
                        .filter((m) => m.patient_id === value)
                        .map((m) => m.game)
                    )
                  );

                  setPatientId(value);
                  setGameId(gamesForPatient[0] ?? '');
                }}
                disabled={patientOptions.length === 0}
              >
                <SelectTrigger className="w-full" id="PatientId">
                  <SelectValue placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {patientOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex flex-col gap-3">
              <Label htmlFor="GameId">Game ID</Label>
              <Select
                value={gameId}
                onValueChange={setGameId}
                disabled={gameOptions.length === 0}
              >
                <SelectTrigger className="w-full" id="GameId">
                  <SelectValue placeholder="Select Game" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {gameOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex flex-col gap-3">
              <Label htmlFor="TimeRange">Time Range</Label>
              <DateRangePicker
                initialDateFrom={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 5))
                }
                initialDateTo={new Date(new Date().setHours(0, 0, 0, 0))}
                onUpdate={(value) => setDateRange(value.range)}
              />
            </div>
          </div>
          <div className="col-span-3 flex justify-end">
            <div className="flex gap-3">
              <span className="font-medium">Dr Doe (Clinician)</span>
              <CircleUserIcon />
            </div>
          </div>
        </div>

        {/* KPI cards row */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardDescription className="flex items-center gap-1">
                  Path Efficiency
                  <MetricInfoButton metricKey="efficiency" />
                </CardDescription>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                  Latest reading
                </div>
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
                  {kpis.efficiency.value !== null
                    ? `${kpis.efficiency.value.toFixed(1)}%`
                    : '—'}
                  {kpis.efficiency.value !== null && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-sm font-bold ${getEfficiencyGrade(kpis.efficiency.value).color}`}
                        >
                          {getEfficiencyGrade(kpis.efficiency.value).grade}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getEfficiencyGrade(kpis.efficiency.value).description}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
                <CardAction>
                  {kpis.efficiency.change !== null && (
                    <Badge
                      variant="outline"
                      className={
                        kpis.efficiency.change >= 0
                          ? 'border-green-600 text-green-600'
                          : 'border-red-600 text-red-600'
                      }
                    >
                      {kpis.efficiency.change >= 0 ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )}
                      vs. prev {kpis.efficiency.change >= 0 ? '+' : ''}
                      {kpis.efficiency.change.toFixed(1)}%
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">Directness of path</div>
                {kpis.efficiency.value !== null && (
                  <div className="text-primary mt-1 text-xs">
                    {
                      getEfficiencyGrade(
                        kpis.efficiency.value
                      ).description.split(' - ')[0]
                    }
                  </div>
                )}
                {kpis.efficiency.avg !== null && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    Avg. across {kpis.sessionCount} sessions:{' '}
                    {kpis.efficiency.avg.toFixed(1)}%
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardDescription className="flex items-center gap-1">
                  Force
                  <MetricInfoButton metricKey="force" />
                </CardDescription>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                  Latest reading
                </div>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpis.force.value !== null
                    ? `${kpis.force.value.toFixed(1)} N`
                    : '—'}
                </CardTitle>
                <CardAction>
                  {kpis.force.change !== null && (
                    <Badge
                      variant="outline"
                      className={
                        kpis.force.change >= 0
                          ? 'border-green-600 text-green-600'
                          : 'border-red-600 text-red-600'
                      }
                    >
                      {kpis.force.change >= 0 ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )}
                      vs. prev {kpis.force.change >= 0 ? '+' : ''}
                      {kpis.force.change.toFixed(1)}%
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Force produced / assistance provided
                </div>
                {kpis.force.value !== null && (
                  <div className="text-primary mt-1 text-xs">
                    {getForceInterpretation(kpis.force.value).displayText}
                  </div>
                )}
                {kpis.force.avg !== null && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    Avg. across {kpis.sessionCount} sessions:{' '}
                    {kpis.force.avg.toFixed(1)} N
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardDescription className="flex items-center gap-1">
                  Range of Motion
                  <MetricInfoButton metricKey="area">
                    {kpis.area.value !== null && (
                      <AreaVisualization
                        {...calculateAreaCoverage(kpis.area.value)}
                      />
                    )}
                  </MetricInfoButton>
                </CardDescription>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                  Latest reading
                </div>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpis.area.value !== null
                    ? `${(kpis.area.value * 100 * 100).toFixed(2)} cm²`
                    : '—'}
                </CardTitle>
                <CardAction>
                  {kpis.area.change !== null && (
                    <Badge
                      variant="outline"
                      className={
                        kpis.area.change >= 0
                          ? 'border-green-600 text-green-600'
                          : 'border-red-600 text-red-600'
                      }
                    >
                      {kpis.area.change >= 0 ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )}
                      vs. prev {kpis.area.change >= 0 ? '+' : ''}
                      {kpis.area.change.toFixed(1)}%
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Maximum movement achieved
                </div>
                {kpis.area.value !== null && (
                  <div className="text-primary mt-1 text-xs">
                    {calculateAreaCoverage(kpis.area.value).percentage.toFixed(
                      1
                    )}
                    % of H-Man surface
                  </div>
                )}
                {kpis.area.avg !== null && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    Avg. across {kpis.sessionCount} sessions:{' '}
                    {(kpis.area.avg * 100 * 100).toFixed(2)} cm²
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardDescription className="flex items-center gap-1">
                  SPARC
                  <MetricInfoButton metricKey="sparc" />
                </CardDescription>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                  Latest reading
                </div>
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
                  {kpis.sparc.value !== null
                    ? kpis.sparc.value.toFixed(2)
                    : '—'}
                  {kpis.sparc.value !== null && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-sm font-bold ${getSparcGrade(kpis.sparc.value).color}`}
                        >
                          {getSparcGrade(kpis.sparc.value).grade}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getSparcGrade(kpis.sparc.value).description}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
                <CardAction>
                  {kpis.sparc.change !== null && (
                    <Badge
                      variant="outline"
                      className={
                        kpis.sparc.change >= 0
                          ? 'border-green-600 text-green-600'
                          : 'border-red-600 text-red-600'
                      }
                    >
                      {kpis.sparc.change >= 0 ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )}
                      vs. prev {kpis.sparc.change >= 0 ? '+' : ''}
                      {kpis.sparc.change.toFixed(1)}%
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Smoothness of movement
                </div>
                {kpis.sparc.value !== null && (
                  <div className="text-primary mt-1 text-xs">
                    {
                      getSparcGrade(kpis.sparc.value).description.split(
                        ' - '
                      )[0]
                    }
                  </div>
                )}
                {kpis.sparc.avg !== null && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    Avg. across {kpis.sessionCount} sessions:{' '}
                    {kpis.sparc.avg.toFixed(2)}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Scrollable content + Chat sidebar */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto">
            <section>
              <h2 className="text-lg font-semibold">Overall Progress</h2>
              <p className="text-muted-foreground mb-3 text-sm">
                At-a-glance comparison across all metrics
              </p>
              <RadarChartView {...chartProps} />
            </section>

            <section>
              <h2 className="text-lg font-semibold">Metric Trends</h2>
              <p className="text-muted-foreground mb-3 text-sm">
                How has each metric changed over time?
              </p>
              <LineChartView {...chartProps} />
            </section>

            <section>
              <h2 className="text-lg font-semibold">Session Comparison</h2>
              <p className="text-muted-foreground mb-3 text-sm">
                How do metrics compare across sessions?
              </p>
              <HeatmapView {...chartProps} />
            </section>
          </div>
          <div className="w-[350px] shrink-0">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
