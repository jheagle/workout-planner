/* global jsonFsQuery -- json-fs-query's browser build, loaded as a plain script in muscles.html before this module */
import { createReads } from './reads.js'

// The page reads database/ from its own origin: no server needed to read. A local server writes those files while the
// page is open, so every file is checked with the server first instead of being read from the browser's cache
// (fetchOptions, json-fs-query 3.4.0): an unchanged file is a short 304.
jsonFsQuery.configure({ databasePath: 'database/', fetchOptions: { cache: 'no-cache' } })

export const { getMusclePriority, getExercisesForMuscle, getLastSession } = createReads(jsonFsQuery)
