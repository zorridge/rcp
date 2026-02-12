'use client';

import { LineChartView } from '../components/dashboard/chart/line-chart';
import { DashboardShell } from '../components/dashboard/shell';

export default function Page() {
  return (
    <DashboardShell renderChart={(props) => <LineChartView {...props} />} />
  );
}
