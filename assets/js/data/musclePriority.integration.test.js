import { query, describe as describeEntities } from './index.js'
import { musclePriority } from './musclePriority.js'

describe('musclePriority against the real database/', () => {
  test('wires up correctly against a real query result, not just hand-built fixtures', async () => {
    expect(await describeEntities()).toEqual(['exercise_muscle.json', 'exercises.json', 'muscles.json', 'workouts.json', 'categories.json', 'exercise_category.json', 'equipment.json', 'exercise_equipment.json'])

    const [muscles] = await query('read muscles')
    const queryString = 'read workouts.muscles' +
      ' on workouts.exercise_id = exercises._id' +
      ' and on exercises._id = exercise_muscle.exercise_id' +
      ' and on exercise_muscle.muscle_id = muscles._id' +
      ' merge muscles._id with exercise_muscle.muscle_id'
    const [workoutsWithMuscles] = await query(queryString)

    // 3 days after the most recent real workout (2026-10-30, from the imported sheets)
    const today = new Date(2026, 10, 2) // local midnight: only the local date counts
    const result = musclePriority(muscles, workoutsWithMuscles, today)

    expect(result).toHaveLength(14)
    // every muscle the seed data never links an exercise to needs priority, with no history at all
    const neverWorked = result.filter(row => row.daysSinceLastWorked === Infinity)
    expect(neverWorked).toHaveLength(11)
    neverWorked.forEach(row => expect(row.needsPriority).toBe(true))

    // Pectorals (barbell bench press) was last worked 6 days before "today", once this week:
    // past the recovery window and under 2x/week, so it needs priority
    const pectorals = result.find(row => row.name === 'Pectorals')
    expect(pectorals.timesWorkedThisWeek).toBe(1)
    expect(pectorals.daysSinceLastWorked).toBe(6)
    expect(pectorals.needsPriority).toBe(true)
  })
})
