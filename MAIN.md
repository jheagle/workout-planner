# workout-planner

[![tests](https://github.com/jheagle/workout-planner/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/jheagle/workout-planner/actions/workflows/tests.yml)

Plan daily and weekly workouts based on goals and muscle groups.

## Data

The workout history lives in `database/` (json-fs-query records). Weights are stored as entered, in the unit the
equipment shows (`weight` and `unit`, kg or lbs), and the page shows them in the viewer's unit. Three scripts fill it:

- `node scripts/import-sheets.js upper=<csv> lower=<csv> core=<csv> [--replace] [--dry-run]` imports the history from
  the Google Sheets CSV exports. `--replace` re-imports the sheets' date range from scratch.
- `node scripts/migrate.js` runs the database migrations that haven't run yet (`assets/js/data/migrations.js`).
- `node scripts/apply-muscle-map.js` writes the muscle map (`assets/js/data/muscleMap.js`) into `database/`: the
  muscles, their regions, and each exercise's share of the work per muscle.

