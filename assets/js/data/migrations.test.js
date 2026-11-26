/**
 * @jest-environment node
 */
import { setUp } from 'test-filesystem'
import { configure, query, quote } from './index.js'
import { migrate } from './migrations.js'

const databasePath = 'migrations-test-database/'
setUp.setDefaults(databasePath)

beforeEach(() => setUp.beforeEach().then(() => configure({ databasePath })))
afterEach(setUp.afterEach)

describe('migrate', () => {
  test('moves weight_effort into weight and unit, or seconds, keeps free text in the note, and runs only once', async () => {
    // The workouts record as it was before the change
    await query(`create workouts (_id string auto, exercise_id string, weight_effort string optional, reps int optional,
      sets int optional, note string optional, order int, date string, primary key (_id))`)
    await query(`insert workouts values
      (exercise_id = '1', weight_effort = '67.5lbs', sets = 1, reps = 10, order = 0, date = '2026-11-01'),
      (exercise_id = '1', weight_effort = '2x40lbs', sets = 3, reps = 10, order = 1, date = '2026-11-01'),
      (exercise_id = '2', weight_effort = '0:30', sets = 5, order = 2, date = '2026-11-01'),
      (exercise_id = '3', weight_effort = ${quote("bar + 2 25's")}, sets = 3, reps = 8, note = 'easy', order = 3, date = '2026-11-01'),
      (exercise_id = '4', sets = 3, reps = 12, order = 4, date = '2026-11-01')`)

    const ran = await migrate(query, quote)
    expect(ran.map(each => each.name)).toEqual(['2026-11-26 weight and unit'])
    expect(ran[0].result).toEqual({ converted: 4, unread: ["bar + 2 25's"] })

    const [rows] = await query('read workouts sort order')
    expect(rows.map(row => [row.weight, row.unit, row.seconds, row.note, row.weight_effort])).toEqual([
      ['67.5', 'lbs', undefined, undefined, undefined],
      ['80', 'lbs', undefined, undefined, undefined],
      [undefined, undefined, 30, undefined, undefined],
      [undefined, undefined, undefined, "easy (bar + 2 25's)", undefined],
      [undefined, undefined, undefined, undefined, undefined]
    ])
    const [{ definition }] = await query('describe workouts')
    expect(definition.map(field => field.name)).not.toContain('weight_effort')

    expect(await migrate(query, quote)).toEqual([])
  })
})
