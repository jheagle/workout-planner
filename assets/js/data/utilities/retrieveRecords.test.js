import { retrieveRecords } from './retrieveRecords.js'

describe('retrieveRecords', () => {
  test('retrieve main RECORDS file', async () => {
    expect(await retrieveRecords('__RECORDS')).toEqual([
      {
        path: 'exercise_muscle',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'primary', references: ['self'] }]
          },
          {
            name: 'exercise_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'foreign', references: ['exercises._id'] }]
          },
          {
            name: 'muscle_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'foreign', references: ['muscles._id'] }]
          },
          { name: 'muscle_rank', type: 'int', optional: false, keys: [] }
        ],
        entries: [
          'bench_press_pectorals.json',
          'deadlift_hamstrings.json',
          'squat_quadriceps.json'
        ]
      },
      {
        path: 'exercises',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'primary', references: ['self'] }]
          },
          { name: 'name', type: 'string', optional: false, keys: [] },
          { name: 'description', type: 'string', optional: true, keys: [] }
        ],
        entries: ['bench_press.json', 'deadlift.json', 'squat.json']
      },
      {
        path: 'muscles',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'primary', references: ['self'] }]
          },
          { name: 'name', type: 'string', optional: false, keys: [] },
          { name: 'alias', type: 'string', optional: true, keys: [] },
          { name: 'image', type: 'string', optional: true, keys: [] }
        ],
        entries: [
          'abdominal.json',
          'biceps.json',
          'calves.json',
          'deltoids.json',
          'erector_spinae.json',
          'forearms.json',
          'gluteus_maximus.json',
          'hamstrings.json',
          'latissimus_dorsi.json',
          'obliques.json',
          'pectorals.json',
          'quadriceps.json',
          'trapezius.json',
          'triceps.json'
        ]
      },
      {
        path: 'workouts',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'primary', references: ['self'] }]
          },
          {
            name: 'exercise_id',
            type: 'string',
            optional: false,
            keys: [{ type: 'foreign', references: ['exercise._id'] }]
          },
          {
            name: 'weight_effort',
            type: 'string',
            optional: true,
            keys: []
          },
          { name: 'reps', type: 'int', optional: true, keys: [] },
          { name: 'sets', type: 'int', optional: true, keys: [] },
          { name: 'note', type: 'string', optional: true, keys: [] },
          { name: 'order', type: 'int', optional: false, keys: [] },
          { name: 'date', type: 'string', optional: false, keys: [] }
        ],
        entries: [
          '2024-06-02-001.json',
          '2024-06-02-002.json',
          '2024-06-02-003.json'
        ]
      }
    ])
  })

  test('retrieve workouts entries', async () => {
    expect(await retrieveRecords('workouts')).toEqual([
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
    ])
  })
})