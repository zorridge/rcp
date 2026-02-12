import { HMAN_SURFACE_CM2 } from '@/lib/metric-helpers';

interface AreaVisualizationProps {
  areaCm2: number;
  percentage: number;
}

export function AreaVisualization({
  areaCm2,
  percentage,
}: AreaVisualizationProps) {
  // Calculate inner square size proportional to percentage
  // Using square root since area scales quadratically
  const innerSizePercent = Math.sqrt(percentage / 100) * 100;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-48 w-48">
        {/* Outer square - H-Man surface (30x30 cm) */}
        <div className="absolute inset-0 rounded border-2 border-dashed border-muted-foreground/50" />

        {/* Inner square - Patient coverage */}
        <div
          className="absolute rounded bg-primary/30 border-2 border-primary"
          style={{
            width: `${innerSizePercent}%`,
            height: `${innerSizePercent}%`,
            left: `${(100 - innerSizePercent) / 2}%`,
            top: `${(100 - innerSizePercent) / 2}%`,
          }}
        />

        {/* Center crosshair */}
        <div className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/30" />
        <div className="absolute left-1/2 top-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/30" />
      </div>

      <div className="space-y-1 text-center">
        <div className="text-2xl font-semibold tabular-nums">
          {percentage.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">
          {areaCm2.toFixed(2)} cm² of {HMAN_SURFACE_CM2} cm² covered
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center max-w-xs">
        The dashed square represents the H-Man working surface (30 x 30 cm). The
        shaded area shows the patient&apos;s range of motion coverage.
      </div>
    </div>
  );
}
