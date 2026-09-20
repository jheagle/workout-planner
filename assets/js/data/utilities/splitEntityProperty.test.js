import { splitEntityProperty } from './splitEntityProperty.js'

describe('splitEntityProperty', () => {
  test('can parse entity property', () => {
    const result = splitEntityProperty('workouts.exercise_id')
    expect(result).toEqual({ entity: 'workouts', property: 'exercise_id' })
  })
})