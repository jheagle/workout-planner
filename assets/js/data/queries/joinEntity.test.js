import { joinEntity } from './joinEntity.js'

describe('joinEntity', () => {
  test('it will find the joins', async () => {
    const joinClauses = [
      {
        and: undefined,
        propertyA: 'workouts.exercise_id',
        comparator: '=',
        propertyB: 'exercises._id'
      },
      {
        and: 'and',
        propertyA: 'exercises._id',
        comparator: '=',
        propertyB: 'exercise_muscle.exercise_id'
      },
      {
        and: 'and',
        propertyA: 'exercise_muscle.muscle_id',
        comparator: '=',
        propertyB: 'muscles._id'
      }
    ]
    const result = await joinEntity('workouts', 'muscles', {}, joinClauses)
    expect(result['workouts']).toEqual([
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-02',
        muscles: [{ _id: 11, name: 'Pectorals', alias: 'chest', image: '' }]
      },
      {
        _id: 2,
        exercise_id: 2,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 1,
        date: '2024-06-02',
        muscles: [{ _id: 8, name: 'Hamstrings', alias: 'abs', image: '' }]
      },
      {
        _id: 3,
        exercise_id: 3,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 2,
        date: '2024-06-02',
        muscles: [{ _id: 12, name: 'Quadriceps', alias: 'quads', image: '' }]
      }
    ])
  })
})
