export const METRIC_CONFIG = {
  efficiency: {
    name: 'Path Efficiency',
    unit: '%',
    why: 'Indicates how directly the patient can move toward targets. Improving efficiency suggests better motor planning and control.',
    derivation:
      'Ratio of the shortest possible path to the actual path taken. 100% = perfectly straight line.',
    bounds: {
      lower: 0,
      upper: 100,
      ideal: '≥85%',
      summary: '0–100%. Above 85% is very good; below 40% suggests significant difficulty.',
    },
    grades: [
      {
        min: 95,
        grade: 'A+' as const,
        color: 'bg-green-500 text-white',
        description: 'Excellent efficiency - near-optimal path directness',
      },
      {
        min: 85,
        grade: 'A' as const,
        color: 'bg-green-400 text-white',
        description: 'Very good efficiency - highly direct movement',
      },
      {
        min: 70,
        grade: 'B' as const,
        color: 'bg-lime-500 text-white',
        description: 'Good efficiency - above average path directness',
      },
      {
        min: 55,
        grade: 'C' as const,
        color: 'bg-yellow-500 text-white',
        description: 'Average efficiency - typical path directness',
      },
      {
        min: 40,
        grade: 'D' as const,
        color: 'bg-orange-500 text-white',
        description:
          'Below average efficiency - indirect movement patterns',
      },
      {
        min: -Infinity,
        grade: 'F' as const,
        color: 'bg-red-500 text-white',
        description: 'Poor efficiency - significant path deviations',
      },
    ],
  },
  force: {
    name: 'Force',
    unit: 'N',
    why: 'Tracks whether the patient is generating their own movement force or relying on robot assistance. Increasing patient-generated force indicates strengthening.',
    derivation:
      'Average force measured by H-Man sensors during the session. Positive = patient pushing; negative = robot assisting.',
    bounds: {
      typical: '-36 to +41 N',
      summary:
        'Typical range -36 to +41 N. Positive values indicate independent movement.',
    },
    activities: [
      {
        maxNewtons: 5,
        patientActivity: 'Pressing a keyboard key',
        machineActivity: 'Light guided support',
      },
      {
        maxNewtons: 10,
        patientActivity: 'Holding a smartphone',
        machineActivity: 'Gentle steering assistance',
      },
      {
        maxNewtons: 20,
        patientActivity: 'Lifting a 1.5L water bottle',
        machineActivity: 'Moderate movement support',
      },
      {
        maxNewtons: 35,
        patientActivity: 'Carrying a laptop bag',
        machineActivity: 'Significant assistance provided',
      },
      {
        maxNewtons: Infinity,
        patientActivity: 'Opening a tight jar lid',
        machineActivity: 'Strong assistive force',
      },
    ],
  },
  area: {
    name: 'Range of Motion',
    unit: 'cm²',
    why: 'Shows how much workspace the patient can actively reach. Larger coverage indicates improved mobility and confidence.',
    derivation:
      'Area of the region covered by the patient\u2019s hand movements on the H-Man surface (30\u00d730 cm, 900 cm\u00b2 total).',
    bounds: {
      lower: 0,
      upper: 900,
      surfaceDimensions: '30×30 cm',
      summary:
        '0–900 cm². Higher is better; above 50% coverage indicates good functional reach.',
    },
  },
  sparc: {
    name: 'SPARC',
    unit: '(unitless)',
    why: 'Smoother movements indicate better neuromuscular coordination. Jerky movements (low SPARC) suggest difficulty with motor control.',
    derivation:
      'Spectral Arc Length — analyzes the frequency content of the movement velocity profile. More negative = jerkier.',
    bounds: {
      ideal: 'Closer to 0',
      worst: 'More negative',
      summary:
        'Ranges from negative values toward 0. Above -1 is excellent; below -7 indicates significant jerkiness.',
    },
    grades: [
      {
        min: -1,
        grade: 'A+' as const,
        color: 'bg-green-500 text-white',
        description:
          'Excellent smoothness - near-optimal movement quality',
      },
      {
        min: -2,
        grade: 'A' as const,
        color: 'bg-green-400 text-white',
        description: 'Very good smoothness - high-quality movement',
      },
      {
        min: -3.5,
        grade: 'B' as const,
        color: 'bg-lime-500 text-white',
        description:
          'Good smoothness - above average movement quality',
      },
      {
        min: -5,
        grade: 'C' as const,
        color: 'bg-yellow-500 text-white',
        description: 'Average smoothness - typical movement quality',
      },
      {
        min: -7,
        grade: 'D' as const,
        color: 'bg-orange-500 text-white',
        description:
          'Below average smoothness - movement needs improvement',
      },
      {
        min: -Infinity,
        grade: 'F' as const,
        color: 'bg-red-500 text-white',
        description:
          'Poor smoothness - significant movement difficulties',
      },
    ],
  },
} as const;

export type MetricKey = keyof typeof METRIC_CONFIG;
