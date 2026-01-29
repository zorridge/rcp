import fs from 'fs';
import path from 'path';

// =====================
// Types
// =====================
export type MetricRow = {
  patient_id: string;
  game: string;
  session: string;

  timestamp: string; // absolute ISO timestamp
  t_session_ms: number; // session-relative timestamp (ms)

  avg_efficiency: number;
  avg_f_patient: number;
  area: number;
  avg_sparc: number;
};

// =====================
// Paths
// =====================
const inputCsvPath = path.join(process.cwd(), 'data', 'metrics.csv');
const outputCsvPath = path.join(process.cwd(), 'data', 'metrics_filtered.csv');
const outputJsonPath = path.join(
  process.cwd(),
  'public',
  'data',
  'metrics_filtered.json'
);

// =====================
// CSV output column order
// =====================
const csvColumns: (keyof MetricRow)[] = [
  'patient_id',
  'game',
  'session',
  'timestamp',
  't_session_ms',
  'avg_efficiency',
  'avg_f_patient',
  'area',
  'avg_sparc',
];

// =====================
// Read + normalize CSV
// =====================
const raw = fs
  .readFileSync(inputCsvPath, 'utf-8')
  .trim()
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n');

const lines = raw.split('\n');
if (lines.length < 2) {
  throw new Error('CSV has no data rows');
}

// =====================
// Parse headers
// =====================
const headers = lines[0].split(',');
const headerIndex: Record<string, number> = {};

headers.forEach((h, i) => {
  headerIndex[h] = i;
});

// Required input columns
[
  'patient_id',
  'game',
  'session',
  'date',
  'timestampms',
  'avg_efficiency',
  'avg_f_patient',
  'area',
  'average_sparc',
].forEach((col) => {
  if (!(col in headerIndex)) {
    throw new Error(`Column "${col}" not found in CSV header`);
  }
});

// =====================
// Helpers
// =====================

// dateStr format: "DD MM YYYY"
function buildTimestamp(dateStr: string, timestampMs: number): string {
  const [dd, mm, yyyy] = dateStr.split(' ').map(Number);
  const baseUtc = Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0);
  return new Date(baseUtc + timestampMs).toISOString();
}

// =====================
// Transform rows
// =====================
const rows: MetricRow[] = lines.slice(1).map((line) => {
  const values = line.split(',');

  const tSessionMs = Number(values[headerIndex['timestampms']]);

  const timestamp = buildTimestamp(values[headerIndex['date']], tSessionMs);

  return {
    patient_id: values[headerIndex['patient_id']],
    game: values[headerIndex['game']],
    session: values[headerIndex['session']],

    timestamp,
    t_session_ms: tSessionMs,

    avg_efficiency: Number(values[headerIndex['avg_efficiency']]),
    avg_f_patient: Number(values[headerIndex['avg_f_patient']]),
    area: Number(values[headerIndex['area']]),
    avg_sparc: Number(values[headerIndex['average_sparc']]),
  };
});

// =====================
// Write CSV
// =====================
const csvHeader = csvColumns.join(',');

const csvBody = rows
  .map((row) => csvColumns.map((col) => String(row[col])).join(','))
  .join('\n');

fs.writeFileSync(outputCsvPath, `${csvHeader}\n${csvBody}`);
console.log(`CSV written to ${outputCsvPath}`);

// =====================
// Write JSON
// =====================
fs.writeFileSync(outputJsonPath, JSON.stringify(rows, null, 2));
console.log(`JSON written to ${outputJsonPath}`);
