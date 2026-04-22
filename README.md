# H-Man Dashboard Handover Guide

## Project Overview

This repository contains a local web dashboard for reviewing rehabilitation
session data collected from the H-Man system.

In simple terms, the app lets a user:

- choose a patient
- choose a game or activity
- filter by date range
- view summary metrics and charts for that patient
- open a chat panel for follow-up questions

The dashboard itself can run locally from the sample data already included in
this repository. The chat feature is different: it depends on a separate Python
backend that is **not** included here.

## What The App Does

The main purpose of this app is to turn rehabilitation session data into a
visual dashboard that is easier to review than raw spreadsheet rows.

The dashboard highlights four main measures:

- **Path Efficiency**: how directly the patient moved toward targets
- **Force**: whether the patient generated movement force or needed assistance
- **Range of Motion**: how much of the H-Man working area the patient covered
- **SPARC**: a smoothness measure for movement quality

The page also includes charts so trends can be viewed across sessions instead of
only looking at one session at a time.

## What Is Included In This Repository

This repository includes everything needed to run the **dashboard view** locally.

Important parts of the project:

- `app/`: the main Next.js application
- `components/dashboard/`: the main dashboard screen, filters, KPI cards, and
  charts
- `app/api/chat/route.ts`: the frontend API route used by the chat panel
- `public/data/metrics_filtered.json`: the prepared local dataset used by the
  dashboard
- `data/metrics.csv`: the original source CSV
- `scripts/transform.ts`: the script that converts source CSV data into the
  filtered output used by the app

## What Is Not Included

The chat function in this app is **not fully self-contained inside this
repository**.

The file `app/api/chat/route.ts` sends chat requests to a separate Python API.
That external service must exist and must be reachable through the environment
variable `PYTHON_API_URL`.

This means:

- the dashboard can still open and display charts without the Python backend
- the chat box may still appear in the interface
- sending a chat message will fail unless `PYTHON_API_URL` points to a working
  backend

This is the most important technical limitation to be aware of during handover.

## Local Setup Prerequisites

Before trying to run the app, the local computer should have:

- **Node.js** installed
- **pnpm** installed or enabled
- a terminal opened inside this repository folder

This project uses `pnpm` as its package manager. That is why the repository
contains `pnpm-lock.yaml`.

If `pnpm` is not already available, one common option is:

```bash
corepack enable
```

If that does not work on the local machine, `pnpm` may need to be installed
separately after Node.js is installed.

## How To Run The App Locally

### Option 1: Dashboard-Only Demo

Use this option if the goal is simply to open the dashboard locally and review
the prepared data.

1. Open a terminal in this repository folder.
2. Install project dependencies:

```bash
pnpm install
```

3. Start the local development server:

```bash
pnpm dev
```

4. Open the app in a browser:

```text
http://localhost:3000
```

This is enough to load the dashboard and view the bundled data.

### Option 2: Dashboard Plus Chat Backend

Use this option only if the Python chat backend is available.

1. Open a terminal in this repository folder.
2. Install project dependencies:

```bash
pnpm install
```

3. Create a file named `.env.local` in the repository root and add the backend
   URL:

```env
PYTHON_API_URL=http://your-python-backend-endpoint
```

4. Start the local development server:

```bash
pnpm dev
```

5. Open:

```text
http://localhost:3000
```

If the backend is reachable and working, the chat panel should be able to send
messages through that backend.

## Common Problems And Fixes

### `pnpm: command not found`

Cause: `pnpm` is not installed or not enabled on the local machine.

Try:

```bash
corepack enable
```

Then retry the install command:

```bash
pnpm install
```

### Dependencies have not been installed

Cause: the project packages have not been downloaded yet.

Fix:

```bash
pnpm install
```

### The dashboard opens but chat does not work

Cause: the Python backend is missing, not running, or `PYTHON_API_URL` is not
set correctly.

Check:

- whether `.env.local` exists
- whether `PYTHON_API_URL` points to the correct backend address
- whether the Python backend itself is running and reachable

### Charts are empty or data is missing

Cause: the app could not find the prepared JSON data file.

Check that this file exists:

- `public/data/metrics_filtered.json`

### Source CSV data was changed but the app still shows old values

Cause: the source CSV and the app-ready JSON are separate files.

If `data/metrics.csv` is updated, the transform step needs to be rerun so the
derived output files are refreshed.

The transformation logic is in:

- `scripts/transform.ts`

## Important Files And Folders

These are the most useful places to look during handover:

- [`README.md`](/Users/bytedance/personal/rcp/README.md)
- [`components/dashboard/shell.tsx`](/Users/bytedance/personal/rcp/components/dashboard/shell.tsx)
- [`app/api/chat/route.ts`](/Users/bytedance/personal/rcp/app/api/chat/route.ts)
- [`public/data/metrics_filtered.json`](/Users/bytedance/personal/rcp/public/data/metrics_filtered.json)
- [`scripts/transform.ts`](/Users/bytedance/personal/rcp/scripts/transform.ts)

## Notes For The Next Owner

- This repository is strongest as a **local dashboard demonstration**.
- The dashboard depends on prepared local data that is already included.
- The chat feature depends on an external Python service and should be described
  as an integration point, not as a standalone feature of this repository.
- If a future owner wants the project to be fully self-contained, the missing
  backend service will need to be documented, added, or replaced.
