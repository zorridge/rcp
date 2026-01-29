'use client';

import { CircleUserIcon, TrendingUpIcon } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MetricRow } from '@/scripts/transform';

import { Chart } from './components/chart/main';
import { Chat } from './components/chat/main';

export default function Page() {
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
        efficiency: null,
        force: null,
        area: null,
        sparc: null,
      };
    }

    const avg = (key: keyof MetricRow) =>
      filteredMetrics.reduce((sum, m) => sum + Number(m[key]), 0) /
      filteredMetrics.length;

    return {
      efficiency: avg('avg_efficiency'),
      force: avg('avg_f_patient'),
      area: avg('area'),
      sparc: avg('avg_sparc'),
    };
  }, [filteredMetrics]);

  // *** Effects ***
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

  return (
    <div className="h-screen w-full p-6">
      <div className="grid h-full grid-rows-[auto_auto_1fr] gap-6">
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

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>Path Efficiency</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpis.efficiency !== null
                    ? `${kpis.efficiency.toFixed(1)}%`
                    : '—'}
                </CardTitle>
                {/* <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction> */}
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">Directness of path</div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>Force</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpis.force !== null ? `${kpis.force.toFixed(1)} N` : '—'}
                </CardTitle>
                {/* <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction> */}
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Force produced / assistance provided
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>Range of Motion</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpis.area !== null
                    ? `${(kpis.area * 100 * 100).toFixed(2)} cm²`
                    : '—'}
                </CardTitle>
                {/* <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction> */}
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Maximum movement achieved
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>SPARC</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpis.sparc !== null ? kpis.sparc.toFixed(2) : '—'}
                </CardTitle>
                {/* <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction> */}
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Smoothness of movement
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="grid h-full min-h-0 grid-cols-12 gap-6">
          <div className="col-span-4 h-full min-h-0 overflow-y-auto">
            <Chat />
          </div>

          <div className="col-span-8 min-h-0">
            <Chart
              data={filteredMetrics}
              patientId={patientId}
              gameId={gameId}
              dateRange={dateRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
