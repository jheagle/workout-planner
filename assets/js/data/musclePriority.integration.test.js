/**
 * @jest-environment node
 */
import { setUp } from 'test-filesystem'
import { query, quote } from './index.js'
import { createReads } from './reads.js'
import { createTestDatabase } from './testDatabase.js'

const databasePath = 'muscle-priority-test-database/'
setUp.setDefaults(databasePath)

beforeEach(() => setUp.beforeEach().then(() => createTestDatabase(databasePath)))
afterEach(setUp.afterEach)

describe('getMusclePriority against a real database', () => {
  test('joins workouts to each exercise\'s own muscles and ranks, not another exercise\'s', async () => {
    // A second exercise working Pectorals at a smaller share: the old merge picked one link per muscle for every
    // exercise, so one of the two exercises got the other's rank
    const [[bench]] = await query("read exercises where name = 'Bench Press'")
    const [[fly]] = await query("insert exercises values name = 'Pec Fly', description = ''")
    await query(`insert exercise_muscle values exercise_id = ${quote(String(fly._id))}, muscle_id = '11', muscle_rank = 50`)
    await query(`insert workouts values exercise_id = ${quote(String(fly._id))}, sets = 2, reps = 10, order = 3, date = '2024-06-05'`)

    // 3 days after the seed data's most recent workout (2024-06-05)
    const today = new Date(2024, 5, 8) // local midnight: only the local date counts
    const result = await createReads({ query, quote }).getMusclePriority(today)

    expect(result).toHaveLength(14)
    // every muscle the seed data never links an exercise to needs priority, with no history at all
    const neverWorked = result.filter(row => row.daysSinceLastWorked === Infinity)
    expect(neverWorked).toHaveLength(11)
    neverWorked.forEach(row => expect(row.needsPriority).toBe(true))

    // Pectorals: bench press 3 sets on 06-02 and 06-05 (100%) = 6, plus the fly 2 sets at 50% = 1; 3 days since worked
    const pectorals = result.find(row => row.name === 'Pectorals')
    expect(pectorals.weeklySets).toBe(7)
    expect(pectorals.daysSinceLastWorked).toBe(3)
    expect(pectorals.needsPriority).toBe(true)
    expect(bench).toBeDefined()
  })
})
