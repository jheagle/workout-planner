import { retrieveFile } from './retrieveFile.js'

describe('retrieveFile', () => {
  test('should get the file if found', async () => {
    expect(await retrieveFile('__RECORDS.json')).toEqual({
      path: '',
      definition: [
        {
          name: 'path',
          type: 'string',
          optional: false,
          keys: []
        },
        {
          name: 'definition',
          type: 'object',
          optional: false,
          keys: []
        },
        {
          name: 'entries',
          type: 'array',
          optional: false,
          keys: []
        },
      ],
      entries: [
        'exercise_muscle.json',
        'exercises.json',
        'muscles.json',
        'workouts.json',
      ]
    })
  })
})