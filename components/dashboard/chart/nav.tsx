'use client';

import {
  AreaChartIcon,
  BarChart3Icon,
  LineChartIcon,
  RadarIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Line', icon: LineChartIcon },
  { href: '/area-chart', label: 'Area', icon: AreaChartIcon },
  { href: '/bar-chart', label: 'Bar', icon: BarChart3Icon },
  { href: '/radar-chart', label: 'Radar', icon: RadarIcon },
];

export function ChartNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-background/80 fixed right-4 bottom-4 z-50 flex gap-1 rounded-xl border p-1 shadow-lg backdrop-blur">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === href && 'bg-muted text-foreground'
          )}
        >
          <Icon className="size-4" />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
