/**
 * @jest-environment node
 */
import { setUp } from 'test-filesystem'
import { query } from './index.js'
import { musclePriority } from './musclePriority.js'
import { createTestDatabase } from './testDatabase.js'

const databasePath = 'muscle-priority-test-database/'
setUp.setDefaults(databasePath)

beforeEach(() => setUp.beforeEach().then(() => createTestDatabase(databasePath)))
afterEach(setUp.afterEach)

describe('musclePriority against a real query result', () => {
  test('wires up correctly against a real query result, not just hand-built rows', async () => {
    const [muscles] = await query('read muscles')
    const queryString = 'read workouts.muscles' +
      ' on workouts.exercise_id = exercises._id' +
      ' and on exercises._id = exercise_muscle.exercise_id' +
      ' and on exercise_muscle.muscle_id = muscles._id' +
      ' merge muscles._id with exercise_muscle.muscle_id'
    const [workoutsWithMuscles] = await query(queryString)

    // 3 days after the seed data's most recent workout (2024-06-05)
    const today = new Date(2024, 5, 8) // local midnight: only the local date counts
    const result = musclePriority(muscles, workoutsWithMuscles, today)

    expect(result).toHaveLength(14)
    // every muscle the seed data never links an exercise to needs priority, with no history at all
    const neverWorked = result.filter(row => row.daysSinceLastWorked === Infinity)
    expect(neverWorked).toHaveLength(11)
    neverWorked.forEach(row => expect(row.needsPriority).toBe(true))

    // Pectorals (bench press), Hamstrings (deadlift), Quadriceps (squat) were each worked twice,
    // 3 days before "today" - past the recovery window, so still needing priority despite 2x/week
    const pectorals = result.find(row => row.name === 'Pectorals')
    expect(pectorals.timesWorkedThisWeek).toBe(2)
    expect(pectorals.daysSinceLastWorked).toBe(3)
    expect(pectorals.needsPriority).toBe(true)
  })
})
