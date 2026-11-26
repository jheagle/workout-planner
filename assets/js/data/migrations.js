/**
 * Changes to the database's records, in order. Each one checks whether it has already run, so `migrate()` can be run
 * any time: on database/ by scripts/migrate.js, and on every test database (testDatabase.js), so tests always see
 * the current schema even before database/ has been migrated.
 * @module migrations
 */
import { readWeightText } from './units.js'

/**
 * The fields of a record.
 * @param {function(string): Promise<Array>} query
 * @param {string} record
 * @returns {Promise<string[]>}
 */
const fieldsOf = async (query, record) => {
  const [{ definition }] = await query(`describe ${record}`)
  return definition.map(field => field.name)
}

/**
 * @type {Array<{name: string, applied: function(function): Promise<boolean>, up: function(function, function): Promise<Object>}>}
 */
export const migrations = [
  {
    // WP-8: weights stored as entered, in kg or lbs, and holds in seconds, instead of one text field ('180lbs', '0:30')
    name: '2026-11-26 weight and unit',
    applied: async query => !(await fieldsOf(query, 'workouts')).includes('weight_effort'),
    up: async (query, quote) => {
      const fields = await fieldsOf(query, 'workouts')
      if (!fields.includes('weight')) await query('alter workouts add weight string optional')
      if (!fields.includes('unit')) await query('alter workouts add unit string optional')
      if (!fields.includes('seconds')) await query('alter workouts add seconds int optional')
      const [rows] = await query('read workouts')
      const unread = []
      let converted = 0
      for (const row of rows) {
        const text = (row.weight_effort || '').trim()
        if (!text) continue
        const { weight, seconds } = readWeightText(text)
        const id = quote(String(row._id))
        if (weight) {
          await query(`update workouts set weight = ${quote(String(weight.amount))}, unit = ${quote(weight.unit)} where _id = ${id}`)
        } else if (seconds !== null) {
          await query(`update workouts set seconds = ${seconds} where _id = ${id}`)
        } else {
          // Free text ("bar + 2 25's") goes to the note, so nothing is lost
          const note = row.note ? `${row.note} (${text})` : text
          await query(`update workouts set note = ${quote(note)} where _id = ${id}`)
          unread.push(text)
        }
        converted++
      }
      await query('alter workouts drop weight_effort')
      return { converted, unread }
    }
  }
]

/**
 * Run every migration that hasn't run yet, in order.
 * @param {function(string): Promise<Array>} query - json-fs-query's query, configured for the database
 * @param {function(*): string} quote - json-fs-query's quote
 * @returns {Promise<Array<{name: string, result: Object}>>} the migrations that ran, with what each reported
 */
export const migrate = async (query, quote) => {
  const ran = []
  for (const migration of migrations) {
    if (await migration.applied(query)) continue
    ran.push({ name: migration.name, result: await migration.up(query, quote) })
  }
  return ran
}
