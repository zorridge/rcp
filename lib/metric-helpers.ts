// Conversion constants
const GRAVITY = 9.81; // m/s²
const APPLE_MASS_KG = 0.2; // Average apple mass

// H-Man working surface area in cm²
export const HMAN_SURFACE_CM2 = 900;

/**
 * Convert force in Newtons to an intuitive interpretation using apples
 */
export function formatForceInterpretation(newtons: number): {
  kg: number;
  apples: number;
  isAssistive: boolean;
  displayText: string;
} {
  const isAssistive = newtons < 0;
  const absNewtons = Math.abs(newtons);
  const kg = absNewtons / GRAVITY;
  const apples = Math.round(kg / APPLE_MASS_KG);

  const appleText = apples === 1 ? 'apple' : 'apples';
  const displayText = isAssistive
    ? `Machine assisting: ~${apples} ${appleText} of force`
    : `Patient producing: ~${apples} ${appleText} of force`;

  return {
    kg,
    apples,
    isAssistive,
    displayText,
  };
}

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
 * 100% is optimal (A+), 40% or below is failing (F)
 */
export function getEfficiencyGrade(efficiency: number): {
  grade: LetterGrade;
  color: string;
  description: string;
} {
  if (efficiency >= 95) {
    return {
      grade: 'A+',
      color: 'bg-green-500 text-white',
      description: 'Excellent efficiency - near-optimal path directness',
    };
  }
  if (efficiency >= 85) {
    return {
      grade: 'A',
      color: 'bg-green-400 text-white',
      description: 'Very good efficiency - highly direct movement',
    };
  }
  if (efficiency >= 70) {
    return {
      grade: 'B',
      color: 'bg-lime-500 text-white',
      description: 'Good efficiency - above average path directness',
    };
  }
  if (efficiency >= 55) {
    return {
      grade: 'C',
      color: 'bg-yellow-500 text-white',
      description: 'Average efficiency - typical path directness',
    };
  }
  if (efficiency >= 40) {
    return {
      grade: 'D',
      color: 'bg-orange-500 text-white',
      description: 'Below average efficiency - indirect movement patterns',
    };
  }
  return {
    grade: 'F',
    color: 'bg-red-500 text-white',
    description: 'Poor efficiency - significant path deviations',
  };
}

/**
 * Map SPARC value to letter grade based on clinical thresholds
 * SPARC values are negative, with values closer to 0 being better
 */
export function getSparcGrade(sparc: number): {
  grade: LetterGrade;
  color: string;
  description: string;
} {
  if (sparc >= -1) {
    return {
      grade: 'A+',
      color: 'bg-green-500 text-white',
      description: 'Excellent smoothness - near-optimal movement quality',
    };
  }
  if (sparc >= -2) {
    return {
      grade: 'A',
      color: 'bg-green-400 text-white',
      description: 'Very good smoothness - high-quality movement',
    };
  }
  if (sparc >= -3.5) {
    return {
      grade: 'B',
      color: 'bg-lime-500 text-white',
      description: 'Good smoothness - above average movement quality',
    };
  }
  if (sparc >= -5) {
    return {
      grade: 'C',
      color: 'bg-yellow-500 text-white',
      description: 'Average smoothness - typical movement quality',
    };
  }
  if (sparc >= -7) {
    return {
      grade: 'D',
      color: 'bg-orange-500 text-white',
      description: 'Below average smoothness - movement needs improvement',
    };
  }
  return {
    grade: 'F',
    color: 'bg-red-500 text-white',
    description: 'Poor smoothness - significant movement difficulties',
  };
}
