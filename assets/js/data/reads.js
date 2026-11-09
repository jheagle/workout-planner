import { musclePriority } from './musclePriority.js'

/**
 * The app's reads, given the json-fs-query `query` and `quote` to run them with: Node's (workoutQueries.js, for the
 * API server and the tests) or the browser build's (browserReads.js, for the page, which reads database/ from its own
 * origin over fetch()). Reads need no server; only writes do.
 * @param {{query: Function, quote: Function}} jsonFsQuery
 * @returns {{quoteId: Function, getMusclePriority: Function, getExercisesForMuscle: Function, getLastSession: Function}}
 */
export const createReads = ({ query, quote }) => {
  /**
   * An id as a query value: quoted, since ids are strings and a generated one (a UUID such as
   * 'aca3a0b4-5539-...') reads as subtraction when it isn't. A missing id stays missing, so the query still fails on it.
   * @param id
   * @returns {string|undefined|null}
   */
  const quoteId = id => id === undefined || id === null ? id : quote(String(id))

  /**
   * Rank every muscle by how much it needs attention right now, from a real read of the database.
   * @param today - injectable for testing; defaults to the real current time
   */
  const getMusclePriority = async (today = new Date()) => {
    const [muscles] = await query('read muscles')
    const joinQueryString = 'read workouts.muscles' +
      ' on workouts.exercise_id = exercises._id' +
      ' and on exercises._id = exercise_muscle.exercise_id' +
      ' and on exercise_muscle.muscle_id = muscles._id' +
      ' merge muscles._id with exercise_muscle.muscle_id'
    const [workoutsWithMuscles] = await query(joinQueryString)
    return musclePriority(muscles, workoutsWithMuscles, today)
  }

  /**
   * Every exercise linked to a given muscle, via exercise_muscle.
   * @param muscleId
   */
  const getExercisesForMuscle = async (muscleId) => {
    const queryString = 'read exercise_muscle.exercises' +
      ' on exercise_muscle.exercise_id = exercises._id' +
      ` where muscle_id = ${quoteId(muscleId)}`
    const [rows] = await query(queryString)
    return rows.map(row => row.exercises[0])
  }

  /**
   * The most recently logged workout for a given exercise, or null if it's never been logged.
   * @param exerciseId
   */
  const getLastSession = async (exerciseId) => {
    const queryString = `read workouts where exercise_id = ${quoteId(exerciseId)} sort date desc limit 1`
    const [rows] = await query(queryString)
    return rows[0] ?? null
  }

  return { quoteId, getMusclePriority, getExercisesForMuscle, getLastSession }
}
