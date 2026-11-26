import { query, quote } from './index.js'
import { createReads } from './reads.js'
import { localDate } from './localDate.js'

const { quoteId, getMusclePriority, getExercisesForMuscle, getLastSession } = createReads({ query, quote })

// The reads are shared with the page, which runs them in the browser on json-fs-query's browser build (see reads.js)
export { getMusclePriority, getExercisesForMuscle, getLastSession }

/**
 * A weight as query assignments: the amount as decimal text (json-fs-query has no decimal type) and its unit. An
 * empty or missing amount assigns nothing, unless `clear` is set (an update clearing the weight).
 * @param {(number|string|undefined)} weight
 * @param {string} unit
 * @param {boolean} [clear=false]
 * @returns {string[]}
 */
const weightAssignments = (weight, unit, clear = false) => {
  if (weight === undefined || weight === null || weight === '') return clear ? ['weight = null', 'unit = null'] : []
  return [`weight = ${quote(String(Number(weight)))}`, `unit = ${quote(unit === 'kg' ? 'kg' : 'lbs')}`]
}

/**
 * Log a new workout entry. The weight is stored as entered, in the unit the equipment shows.
 * @param exerciseId
 * @param weight - the amount, e.g. 67.5 (optional: bodyweight and holds have none)
 * @param unit - 'kg' or 'lbs'
 * @param seconds - a timed hold's length (optional)
 * @param sets
 * @param reps
 * @param note
 * @param date - defaults to today (the local date, see localDate), in the same 'YYYY-MM-DD' shape the rest of the data uses
 * @param order - where this entry falls among others logged the same day (defaults to first)
 */
export const logWorkout = async ({
  exerciseId,
  weight,
  unit = 'lbs',
  seconds,
  sets,
  reps,
  note = '',
  date = localDate(),
  order = 0
}) => {
  const values = [
    `exercise_id = ${quoteId(exerciseId)}`,
    ...weightAssignments(weight, unit),
    `sets = ${sets}`,
    `reps = ${reps}`,
    `note = ${quote(note)}`,
    `order = ${order}`,
    `date = '${date}'`
  ]
  if (seconds !== undefined && seconds !== null && seconds !== '') values.push(`seconds = ${Number(seconds)}`)
  const [rows] = await query(`insert workouts values ${values.join(', ')}`)
  return rows[0]
}

/**
 * Update an existing workout entry - e.g. correcting the plan with what was actually done.
 * @param workoutId
 * @param changes - any subset of weight (with unit)/seconds/sets/reps/note to change; an empty weight clears it
 */
export const updateWorkout = async (workoutId, { weight, unit, seconds, sets, reps, note } = {}) => {
  const assignments = []
  if (typeof weight !== 'undefined') {
    assignments.push(...weightAssignments(weight, unit, true))
  }
  if (typeof seconds !== 'undefined') {
    assignments.push(seconds === null || seconds === '' ? 'seconds = null' : `seconds = ${Number(seconds)}`)
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
