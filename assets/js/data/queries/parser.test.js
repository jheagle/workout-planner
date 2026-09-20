import { parser } from './parser.js'

describe('parser', () => {
  test('can parse simple read', () => {
    const query = 'read workouts'
      + ' where date = \'2024-06-02\''
    const result = parser(query)
    expect(result).toEqual({
      command: 'read',
      entity: 'workouts',
      joinEntity: undefined,
      joinClauses: [],
      mergeJoins: [],
      sortClauses: [],
      groupBy: undefined,
      conditions: [
        {
          andOr: undefined,
          property: 'date',
          comparator: '=',
          value: '2024-06-02'
        }
      ]
    })
  })

  test('can parse read with join', () => {
    const query = 'read workouts.muscles'
      + ' on workouts.exercise_id = exercises._id'
      + ' and on exercises._id = exercise_muscle.exercise_id'
      + ' and on exercise_muscle.muscle_id = muscles._id'
      + ' where muscles.alias = \'chest\''
    const result = parser(query)
    expect(result).toEqual({
      command: 'read',
      entity: 'workouts',
      joinEntity: 'muscles',
      joinClauses: [
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
      ],
      mergeJoins: [],
      sortClauses: [],
      groupBy: undefined,
      conditions: [
        {
          andOr: undefined,
          property: 'muscles.alias',
          comparator: '=',
          value: 'chest'
        }
      ]
    })
  })

  test('can parse read with join and merge', () => {
    const query = 'read workouts.muscles'
      + ' on workouts.exercise_id = exercises._id'
      + ' and on exercises._id = exercise_muscle.exercise_id'
      + ' and on exercise_muscle.muscle_id = muscles._id'
      + ' merge workouts.exercise_id with exercises._id'
      + ' merge exercise_muscle.muscle_id with muscles._id'
      + ' where muscles.alias = \'chest\''
    const result = parser(query)
    expect(result).toEqual({
      command: 'read',
      entity: 'workouts',
      joinEntity: 'muscles',
      joinClauses: [
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
      ],
      mergeJoins: [
        {
          propertyA: 'workouts.exercise_id',
          propertyB: 'exercises._id'
        },
        {
          propertyA: 'exercise_muscle.muscle_id',
          propertyB: 'muscles._id'
        }
      ],
      sortClauses: [],
      groupBy: undefined,
      conditions: [
        {
          andOr: undefined,
          property: 'muscles.alias',
          comparator: '=',
          value: 'chest'
        }
      ]
    })
  })

  test('can parse read with sort clause', () => {
    const query = 'read workouts'
      + ' sort date desc, order'
    const result = parser(query)
    expect(result).toEqual({
      command: 'read',
      entity: 'workouts',
      joinEntity: undefined,
      joinClauses: [],
      mergeJoins: [],
      sortClauses: [
        { property: 'date', direction: 'desc' },
        { property: 'order', direction: 'asc' }
      ],
      groupBy: undefined,
      conditions: []
    })
  })

  test('can parse read with group clause', () => {
    const query = 'read workouts'
      + ' group by date'
    const result = parser(query)
    expect(result).toEqual({
      command: 'read',
      entity: 'workouts',
      joinEntity: undefined,
      joinClauses: [],
      mergeJoins: [],
      sortClauses: [],
      groupBy: 'date',
      conditions: []
    })
  })
})
