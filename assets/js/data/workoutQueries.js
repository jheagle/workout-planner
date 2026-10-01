import { query } from './index.js'
import { musclePriority } from './musclePriority.js'

// These values only ever get interpolated into a query string, never executed as code - stripping
// a stray quote is enough to keep that string's own syntax intact for this single-user, local tool.
const escapeQuoted = (value = '') => String(value).replace(/'/g, '')

/**
 * Rank every muscle by how much it needs attention right now, from a real read of the database.
 * @param today - injectable for testing; defaults to the real current time
 */
export const getMusclePriority = async (today = new Date()) => {
  const [muscles] = await query('read muscles')
  const joinQueryString = 'read workouts.muscles'
    + ' on workouts.exercise_id = exercises._id'
    + ' and on exercises._id = exercise_muscle.exercise_id'
    + ' and on exercise_muscle.muscle_id = muscles._id'
    + ' merge muscles._id with exercise_muscle.muscle_id'
  const [workoutsWithMuscles] = await query(joinQueryString)
  return musclePriority(muscles, workoutsWithMuscles, today)
}

/**
 * Every exercise linked to a given muscle, via exercise_muscle.
 * @param muscleId
 */
export const getExercisesForMuscle = async (muscleId) => {
  const queryString = 'read exercise_muscle.exercises'
    + ' on exercise_muscle.exercise_id = exercises._id'
    + ` where muscle_id = ${muscleId}`
  const [rows] = await query(queryString)
  return rows.map(row => row.exercises[0])
}

/**
 * The most recently logged workout for a given exercise, or null if it's never been logged.
 * @param exerciseId
 */
export const getLastSession = async (exerciseId) => {
  const queryString = `read workouts where exercise_id = ${exerciseId} sort date desc limit 1`
  const [rows] = await query(queryString)
  return rows[0] ?? null
}

/**
 * Log a new workout entry.
 * @param exerciseId
 * @param weightEffort
 * @param sets
 * @param reps
 * @param note
 * @param date - defaults to today, in the same 'YYYY-MM-DD' shape the rest of the data uses
 * @param order - where this entry falls among others logged the same day (defaults to first)
 */
export const logWorkout = async ({
  exerciseId,
  weightEffort = '',
  sets,
  reps,
  note = '',
  date = new Date().toISOString().slice(0, 10),
  order = 0
}) => {
  const queryString = 'insert workouts values '
    + `exercise_id = ${exerciseId}, `
    + `weight_effort = '${escapeQuoted(weightEffort)}', `
    + `sets = ${sets}, `
    + `reps = ${reps}, `
    + `note = '${escapeQuoted(note)}', `
    + `order = ${order}, `
    + `date = '${date}'`
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
    assignments.push(`weight_effort = '${escapeQuoted(weightEffort)}'`)
  }
  if (typeof sets !== 'undefined') {
    assignments.push(`sets = ${sets}`)
  }
  if (typeof reps !== 'undefined') {
    assignments.push(`reps = ${reps}`)
  }
  if (typeof note !== 'undefined') {
    assignments.push(`note = '${escapeQuoted(note)}'`)
  }
  if (!assignments.length) {
    return null
  }
  const queryString = `update workouts set ${assignments.join(', ')} where _id = ${workoutId}`
  const [rows] = await query(queryString)
  return rows[0] ?? null
}

/**
 * Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).
 * @param name
 * @param description
 * @param muscleAssignments - [{ muscleId, rank }], one row per muscle this exercise works
 */
export const addExercise = async ({ name, description = '' }, muscleAssignments = []) => {
  const insertExerciseQuery = 'insert exercises values '
    + `name = '${escapeQuoted(name)}', `
    + `description = '${escapeQuoted(description)}'`
  const [exerciseRows] = await query(insertExerciseQuery)
  const exercise = exerciseRows[0]
  for (const { muscleId, rank } of muscleAssignments) {
    const insertLinkQuery = 'insert exercise_muscle values '
      + `exercise_id = '${exercise._id}', `
      + `muscle_id = ${muscleId}, `
      + `muscle_rank = ${rank}`
    await query(insertLinkQuery)
  }
  return exercise
}
