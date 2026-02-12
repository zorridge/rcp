'use client';

import { BarChartView } from '../../components/dashboard/chart/bar-chart';
import { DashboardShell } from '../../components/dashboard/shell';

export default function BarChartPage() {
  return (
    <DashboardShell renderChart={(props) => <BarChartView {...props} />} />
  );
}
