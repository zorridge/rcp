'use client';

import { AreaChartView } from '../../components/dashboard/chart/area-chart';
import { DashboardShell } from '../../components/dashboard/shell';

export default function AreaChartPage() {
  return (
    <DashboardShell renderChart={(props) => <AreaChartView {...props} />} />
  );
}
