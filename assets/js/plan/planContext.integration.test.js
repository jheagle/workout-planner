/**
 * @jest-environment node
 */
import { setUp } from 'test-filesystem'
import { query } from '../data/index.js'
import { createTestDatabase } from '../data/testDatabase.js'
import { buildPlanContext, readPlanRows } from './planContext.js'
import { placeholderProfile } from './gymProfile.js'

const databasePath = 'plan-context-test-database/'
setUp.setDefaults(databasePath)

beforeEach(() => setUp.beforeEach().then(() => createTestDatabase(databasePath)))
afterEach(setUp.afterEach)

describe('readPlanRows against a real database', () => {
  test('reads every record a plan needs, and builds a context from them', async () => {
    const rows = await readPlanRows(query)
    expect(rows.muscles).toHaveLength(14)
    expect(rows.exercises).toHaveLength(3)
    expect(rows.exerciseMuscle).toHaveLength(3)
    expect(rows.exerciseEquipment).toEqual([])
    expect(rows.workouts).toHaveLength(6)

    const bench = rows.exercises.find(row => row.name === 'Bench Press')
    const goal = { exerciseId: bench._id, weight: { amount: 135, unit: 'lbs' }, reps: 10, weeks: 8 }
    const context = buildPlanContext({ goal, profile: placeholderProfile, rows, today: new Date(2024, 5, 8) })
    // 120 x (1 + 10/30) = 160
    expect(context.goal.estimatedMax).toEqual({ amount: 160, unit: 'lbs' })
    expect(context.exercises).toHaveLength(3)
  })
})
