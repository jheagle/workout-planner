/**
 * @jest-environment node
 */
import { setUp } from 'test-filesystem'
import { configure } from './index.js'
import { copyDatabase } from './copyDatabase.js'
import {
  getMusclePriority,
  getExercisesForMuscle,
  getLastSession,
  logWorkout,
  updateWorkout,
  addExercise
} from './workoutQueries.js'

const databasePath = 'workout-queries-test-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

beforeEach(() => setUp.beforeEach().then(() => copyDatabase(databasePath)))
afterEach(setUp.afterEach)

describe('workoutQueries', () => {
  test('getMusclePriority wires up against the real database, same as the dedicated integration test', async () => {
    const result = await getMusclePriority(new Date(2024, 5, 8))
    expect(result).toHaveLength(14)
    expect(result.find(row => row.name === 'Pectorals').timesWorkedThisWeek).toBe(2)
  })

  test('getExercisesForMuscle finds the real exercise linked to a real muscle', async () => {
    // Pectorals (_id 11) is linked to Bench Press via the real seed data
    const exercises = await getExercisesForMuscle(11)
    expect(exercises).toHaveLength(1)
    expect(exercises[0].name).toBe('Bench Press')
  })

  test('getExercisesForMuscle returns nothing for a muscle with no linked exercise yet', async () => {
    const exercises = await getExercisesForMuscle(2) // Biceps - no real exercise links it yet
    expect(exercises).toHaveLength(0)
  })

  test('getLastSession finds the most recent real workout for an exercise', async () => {
    const session = await getLastSession(1) // Bench Press
    expect(session.date).toBe('2024-06-05')
    expect(session.weight_effort).toBe('120lbs')
  })

  test('getLastSession returns null for an exercise never logged', async () => {
    const session = await getLastSession(999)
    expect(session).toBeNull()
  })

  test('logWorkout inserts a new real entry, immediately visible to getLastSession', async () => {
    const logged = await logWorkout({
      exerciseId: 1,
      weightEffort: '125lbs',
      sets: 3,
      reps: 8,
      date: '2024-06-12'
    })
    expect(logged.weight_effort).toBe('125lbs')

    const session = await getLastSession(1)
    expect(session.date).toBe('2024-06-12')
    expect(session.weight_effort).toBe('125lbs')
  })

  test('logWorkout keeps free text exactly as typed, quotes and query syntax included', async () => {
    const note = "felt great, didn't even need a spotter; C:\\gym -- \"PR\" /* next */ [x]"
    const logged = await logWorkout({
      exerciseId: 1,
      weightEffort: "bar + 2 25's",
      sets: 3,
      reps: 8,
      note,
      date: '2024-06-12'
    })
    expect(logged.note).toBe(note)
    expect(logged.weight_effort).toBe("bar + 2 25's")

    const session = await getLastSession(1)
    expect(session.note).toBe(note)
  })

  test('updateWorkout keeps free text exactly as typed', async () => {
    const updated = await updateWorkout(1, { note: "spotter's call \\ last set" })
    expect(updated.note).toBe("spotter's call \\ last set")
  })

  test.each([
    [0, 1],
    [23, 59]
  ])('logWorkout defaults to the local date at %i:%i, not the UTC one (logging at 21:30 in Toronto used to save tomorrow)', async (hours, minutes) => {
    // Only Date is faked: the database is real files, so timers and ticks must keep running
    jest.useFakeTimers({ now: new Date(2026, 9, 26, hours, minutes), doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask', 'hrtime', 'performance'] })
    try {
      const logged = await logWorkout({ exerciseId: 1, sets: 3, reps: 8 })
      expect(logged.date).toBe('2026-10-26')
    } finally {
      jest.useRealTimers()
    }
  })

  test('updateWorkout corrects an existing real entry', async () => {
    const updated = await updateWorkout(1, { weightEffort: '120lbs', reps: 12 })
    expect(updated.weight_effort).toBe('120lbs')
    expect(updated.reps).toBe(12)
    // untouched fields survive the update
    expect(updated.sets).toBe(3)
  })

  test('addExercise creates a real exercise and links it to the given muscles', async () => {
    const exercise = await addExercise(
      { name: 'Overhead Press', description: 'Standing barbell press' },
      [{ muscleId: 4, rank: 100 }, { muscleId: 14, rank: 50 }] // Deltoids primary, Triceps secondary
    )
    expect(exercise.name).toBe('Overhead Press')

    const deltoidExercises = await getExercisesForMuscle(4)
    expect(deltoidExercises.map(row => row.name)).toContain('Overhead Press')
    const tricepExercises = await getExercisesForMuscle(14)
    expect(tricepExercises.map(row => row.name)).toContain('Overhead Press')
  })

  test('addExercise keeps an apostrophe in the name and description', async () => {
    const exercise = await addExercise({ name: "Farmer's Walk", description: "Carry; don't drop" })
    expect(exercise.name).toBe("Farmer's Walk")
    expect(exercise.description).toBe("Carry; don't drop")
  })
})
