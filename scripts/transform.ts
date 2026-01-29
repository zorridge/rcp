import fs from "fs";
import path from "path";

// Paths
const inputCsvPath = path.join(process.cwd(), "data", "metrics.csv");
const outputCsvPath = path.join(process.cwd(), "data", "metrics_filtered.csv");
const outputJsonPath = path.join(process.cwd(), "data", "metrics_filtered.json");

// Map: output column -> input column
const COLUMN_MAP: Record<string, string> = {
  patient_id: "patient_id",
  game: "game",
  session: "session",
  date: "date",
  timestampms: "timestampms",
  avg_efficiency: "avg_efficiency",
  avg_f_patient: "avg_f_patient",
  area: "area",
  avg_sparc: "average_sparc", // coerced name
};

// Read + normalize CSV
const raw = fs
  .readFileSync(inputCsvPath, "utf-8")
  .trim()
  .replace(/\r\n/g, "\n")
  .replace(/\r/g, "\n");

const lines = raw.split("\n");

// Parse headers
const headers = lines[0].split(",");
const columnIndexes: Record<string, number> = {};

for (const [outCol, inCol] of Object.entries(COLUMN_MAP)) {
  const idx = headers.indexOf(inCol);
  if (idx === -1) {
    throw new Error(`Column "${inCol}" not found in CSV header`);
  }
  columnIndexes[outCol] = idx;
}

// Extract rows
const rows = lines.slice(1).map(line => {
  const values = line.split(",");
  const row: Record<string, string> = {};

  for (const [outCol, idx] of Object.entries(columnIndexes)) {
    row[outCol] = values[idx];
  }

  return row;
});

// Write CSV
const csvHeader = Object.keys(COLUMN_MAP).join(",");
const csvBody = rows
  .map(row => Object.keys(COLUMN_MAP).map(col => row[col]).join(","))
  .join("\n");

fs.writeFileSync(outputCsvPath, `${csvHeader}\n${csvBody}`);
console.log(`CSV written to ${outputCsvPath}`);

// Write JSON
fs.writeFileSync(outputJsonPath, JSON.stringify(rows, null, 2));
console.log(`JSON written to ${outputJsonPath}`);
