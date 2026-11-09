import fs from 'fs/promises'
import path from 'path'
import { configure, create, query, quote } from './index.js'

/**
 * A value that is the _id of the exercise with this name, once it's inserted: exercises' ids are generated on insert
 * (json-fs-query's `auto` replaces any _id given), so rows refer to them through this.
 * @param {string} name
 * @returns {function(Object<string, Array<Object>>): string}
 */
export const exercise = name => inserted => inserted.exercises.find(row => row.name === name)._id

/**
 * The rows every test database starts with: the app's original seed data (14 muscles, 3 exercises each linked to one
 * muscle, and 6 workouts on 2024-06-02 and 2024-06-05). Fixed here, so tests never depend on the real database/,
 * which changes with every workout logged.
 */
export const seedRows = {
  muscles: [
    { _id: '1', name: 'Abdominal', alias: 'abs', image: '../img/abdominals.jpg' },
    { _id: '2', name: 'Biceps', alias: '', image: '' },
    { _id: '3', name: 'Calves', alias: '', image: '' },
    { _id: '4', name: 'Deltoids', alias: 'shoulders', image: '' },
    { _id: '5', name: 'Erector Spinae', alias: 'mid back, along spine', image: '' },
    { _id: '6', name: 'Forearms', alias: '', image: '' },
    { _id: '7', name: 'Gluteus Maximus', alias: 'glutes', image: '' },
    { _id: '8', name: 'Hamstrings', alias: '', image: '' },
    { _id: '9', name: 'Latissimus Dorsi', alias: 'outer lower back', image: '' },
    { _id: '10', name: 'Obliques', alias: 'outer abs', image: '' },
    { _id: '11', name: 'Pectorals', alias: 'chest', image: '' },
    { _id: '12', name: 'Quadriceps', alias: 'quads', image: '' },
    { _id: '13', name: 'Trapezius', alias: 'upper back', image: '' },
    { _id: '14', name: 'Triceps', alias: '', image: '' }
  ],
  exercises: [
    { name: 'Bench Press', description: '' },
    { name: 'Deadlift', description: '' },
    { name: 'Squat', description: '' }
  ],
  exercise_muscle: [
    { exercise_id: exercise('Bench Press'), muscle_id: '11', muscle_rank: 100 },
    { exercise_id: exercise('Deadlift'), muscle_id: '8', muscle_rank: 100 },
    { exercise_id: exercise('Squat'), muscle_id: '12', muscle_rank: 100 }
  ],
  workouts: [
    { exercise_id: exercise('Bench Press'), weight_effort: '115lbs', reps: 10, sets: 3, note: '', order: 0, date: '2024-06-02' },
    { exercise_id: exercise('Deadlift'), weight_effort: '155lbs', reps: 10, sets: 3, note: '', order: 1, date: '2024-06-02' },
    { exercise_id: exercise('Squat'), weight_effort: '155lbs', reps: 10, sets: 3, note: '', order: 2, date: '2024-06-02' },
    { exercise_id: exercise('Bench Press'), weight_effort: '120lbs', reps: 10, sets: 3, note: '', order: 0, date: '2024-06-05' },
    { exercise_id: exercise('Deadlift'), weight_effort: '160lbs', reps: 10, sets: 3, note: '', order: 1, date: '2024-06-05' },
    { exercise_id: exercise('Squat'), weight_effort: '160lbs', reps: 10, sets: 3, note: '', order: 2, date: '2024-06-05' }
  ]
}

const toValue = value => typeof value === 'string' ? quote(value) : String(value)
// A function value is resolved against the rows inserted so far
const toRow = (row, inserted) => `(${Object.entries(row).map(([field, value]) => `${field} = ${toValue(typeof value === 'function' ? value(inserted) : value)}`).join(', ')})`

/**
 * Build a test database at destination: every record the real database has, with the same fields and keys (read
 * from its record files, so a schema change reaches the tests), holding only the given rows. Configures
 * json-fs-query to use it.
 * @param {string} destination - The folder to create the test database in.
 * @param {Object<string, Array<Object>>} [rows=seedRows] - The rows to insert, by record, in an order that keeps the
 * foreign keys valid.
 * @param {string} [source='database/'] - The real database whose schema is copied.
 * @returns {Promise<Object<string, Array<Object>>>} The inserted rows by record (with their generated ids).
 */
export const createTestDatabase = async (destination, rows = seedRows, source = 'database/') => {
  configure({ databasePath: destination })
  const { entries } = JSON.parse(await fs.readFile(path.join(source, '__RECORDS.json'), 'utf8'))
  for (const file of entries) {
    const { path: name, definition, keys } = JSON.parse(await fs.readFile(path.join(source, file), 'utf8'))
    await create(name, definition, keys)
  }
  const inserted = {}
  for (const [record, list] of Object.entries(rows)) {
    inserted[record] = list.length
      ? (await query(`insert ${record} values ${list.map(row => toRow(row, inserted)).join(', ')}`))[0]
      : []
  }
  return inserted
}
