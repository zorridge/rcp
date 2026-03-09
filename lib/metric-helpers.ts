import { METRIC_CONFIG } from './metric-config';

// H-Man working surface area in cm²
export const HMAN_SURFACE_CM2 = 900;

/**
 * Get an everyday-activity interpretation for a force value in Newtons.
 */
export function getForceInterpretation(newtons: number): {
  isAssistive: boolean;
  activity: string;
  displayText: string;
} {
  const isAssistive = newtons < 0;
  const absNewtons = Math.abs(newtons);

  const match = METRIC_CONFIG.force.activities.find(
    (a) => absNewtons <= a.maxNewtons
  )!;

  const activity = isAssistive
    ? match.machineActivity
    : match.patientActivity;

  const displayText = isAssistive
    ? `Machine assisting ~${absNewtons.toFixed(0)} N — ${activity.toLowerCase()}`
    : `Patient producing ~${absNewtons.toFixed(0)} N — similar to ${activity.toLowerCase()}`;

  return { isAssistive, activity, displayText };
}

/**
 * @deprecated Use getForceInterpretation instead
 */
export const formatForceInterpretation = getForceInterpretation;

/**
 * Calculate area coverage as percentage of H-Man surface
 */
export function calculateAreaCoverage(areaM2: number): {
  areaCm2: number;
  percentage: number;
} {
  const areaCm2 = areaM2 * 100 * 100; // Convert m² to cm²
  const percentage = (areaCm2 / HMAN_SURFACE_CM2) * 100;

  return {
    areaCm2,
    percentage: Math.min(percentage, 100), // Cap at 100%
  };
}

type LetterGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Map path efficiency percentage to letter grade
 */
export function getEfficiencyGrade(efficiency: number): {
  grade: LetterGrade;
  color: string;
  description: string;
} {
  const grade = METRIC_CONFIG.efficiency.grades.find(
    (g) => efficiency >= g.min
  )!;
  return {
    grade: grade.grade as LetterGrade,
    color: grade.color,
    description: grade.description,
  };
}

/**
 * Map SPARC value to letter grade based on clinical thresholds
 */
export function getSparcGrade(sparc: number): {
  grade: LetterGrade;
  color: string;
  description: string;
} {
  const grade = METRIC_CONFIG.sparc.grades.find(
    (g) => sparc >= g.min
  )!;
  return {
    grade: grade.grade as LetterGrade,
    color: grade.color,
    description: grade.description,
  };
}
