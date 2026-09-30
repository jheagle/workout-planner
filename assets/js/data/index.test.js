import { describe as describeEntities, query } from './index.js'

describe('data', () => {
  test('describe() lists the real entity files in database/', async () => {
    const entities = await describeEntities()
    expect(entities).toEqual(['exercise_muscle.json', 'exercises.json', 'muscles.json', 'workouts.json'])
  })

  test('query() reads real workout rows from database/', async () => {
    const [rows] = await query("read workouts where date = '2024-06-02'")
    expect(rows).toHaveLength(3)
    expect(rows.every(row => row.date === '2024-06-02')).toBe(true)
  })

  test('query() resolves workouts to their exercise and muscles via joins', async () => {
    const queryString = 'read workouts.muscles'
      + ' on workouts.exercise_id = exercises._id'
      + ' and on exercises._id = exercise_muscle.exercise_id'
      + ' and on exercise_muscle.muscle_id = muscles._id'
      + ' merge muscles._id with exercise_muscle.muscle_id'
      + " where date = '2024-06-02'"
    const [rows] = await query(queryString)
    const benchPressRow = rows.find(row => row.order === 0)
    expect(benchPressRow.muscles).toHaveLength(1)
    expect(benchPressRow.muscles[0].name).toBe('Pectorals')
  })
})
