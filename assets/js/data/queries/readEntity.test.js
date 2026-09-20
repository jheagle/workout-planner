import { readEntity } from './readEntity.js'

const allWorkouts = [
  {
    _id: 1,
    exercise_id: 1,
    weight_effort: '115lbs',
    reps: 10,
    sets: 3,
    note: '',
    order: 0,
    date: '2024-06-02'
  },
  {
    _id: 2,
    exercise_id: 2,
    weight_effort: '155lbs',
    reps: 10,
    sets: 3,
    note: '',
    order: 1,
    date: '2024-06-02'
  },
  {
    _id: 3,
    exercise_id: 3,
    weight_effort: '155lbs',
    reps: 10,
    sets: 3,
    note: '',
    order: 2,
    date: '2024-06-02'
  }
]

describe('readEntity', () => {
  test('it will get all files', async () => {
    const dataSet = await readEntity('workouts')
    expect(dataSet).toEqual(allWorkouts)
  }, 30000)
})
