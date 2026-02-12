'use client';

import { RadarChartView } from '../../components/dashboard/chart/radar-chart';
import { DashboardShell } from '../../components/dashboard/shell';

export default function RadarChartPage() {
  return (
    <DashboardShell renderChart={(props) => <RadarChartView {...props} />} />
  );
}
