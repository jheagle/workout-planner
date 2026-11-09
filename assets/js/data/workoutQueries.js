import { query, quote } from './index.js'
import { createReads } from './reads.js'
import { localDate } from './localDate.js'

const { quoteId, getMusclePriority, getExercisesForMuscle, getLastSession } = createReads({ query, quote })

// The reads are shared with the page, which runs them in the browser on json-fs-query's browser build (see reads.js)
export { getMusclePriority, getExercisesForMuscle, getLastSession }

/**
 * Log a new workout entry.
 * @param exerciseId
 * @param weightEffort
 * @param sets
 * @param reps
 * @param note
 * @param date - defaults to today (the local date, see localDate), in the same 'YYYY-MM-DD' shape the rest of the data uses
 * @param order - where this entry falls among others logged the same day (defaults to first)
 */
export const logWorkout = async ({
  exerciseId,
  weightEffort = '',
  sets,
  reps,
  note = '',
  date = localDate(),
  order = 0
}) => {
  const queryString = 'insert workouts values ' +
    `exercise_id = ${quoteId(exerciseId)}, ` +
    `weight_effort = ${quote(weightEffort)}, ` +
    `sets = ${sets}, ` +
    `reps = ${reps}, ` +
    `note = ${quote(note)}, ` +
    `order = ${order}, ` +
    `date = '${date}'`
  const [rows] = await query(queryString)
  return rows[0]
}

/**
 * Update an existing workout entry - e.g. correcting the plan with what was actually done.
 * @param workoutId
 * @param changes - any subset of weightEffort/sets/reps/note to change
 */
export const updateWorkout = async (workoutId, { weightEffort, sets, reps, note } = {}) => {
  const assignments = []
  if (typeof weightEffort !== 'undefined') {
    assignments.push(`weight_effort = ${quote(weightEffort)}`)
  }
  if (typeof sets !== 'undefined') {
    assignments.push(`sets = ${sets}`)
  }
  if (typeof reps !== 'undefined') {
    assignments.push(`reps = ${reps}`)
  }
  if (typeof note !== 'undefined') {
    assignments.push(`note = ${quote(note)}`)
  }
  if (!assignments.length) {
    return null
  }
  const queryString = `update workouts set ${assignments.join(', ')} where _id = ${quoteId(workoutId)}`
  const [rows] = await query(queryString)
  return rows[0] ?? null
}

/**
 * Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).
 * @param name
 * @param description
 * @param {Array<{muscleId: number, rank: number}>} muscleAssignments - one row per muscle this exercise works
 */
export const addExercise = async ({ name, description = '' }, muscleAssignments = []) => {
  const insertExerciseQuery = 'insert exercises values ' +
    `name = ${quote(name)}, ` +
    `description = ${quote(description)}`
  const [exerciseRows] = await query(insertExerciseQuery)
  const exercise = exerciseRows[0]
  for (const { muscleId, rank } of muscleAssignments) {
    const insertLinkQuery = 'insert exercise_muscle values ' +
      `exercise_id = ${quoteId(exercise._id)}, ` +
      `muscle_id = ${quoteId(muscleId)}, ` +
      `muscle_rank = ${rank}`
    await query(insertLinkQuery)
  }
  return exercise
}
