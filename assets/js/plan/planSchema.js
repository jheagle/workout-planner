/**
 * The shape of a plan: what the model must return (as a JSON schema, for structured outputs) and what the checks
 * read. The schema holds only the shape (types, required fields, no extra fields); ranges and rules (sets, reps,
 * weights the equipment can make, weekly volume) are the checks' job (planChecks.js), so their errors can name the
 * exact field and the model can fix it.
 *
 * A plan is weeks of training days. A day is placed by `dayOfWeek` (1 Monday to 7 Sunday), so the checks can see
 * rest between days; saving a plan turns these into future-dated workouts from its start date. LJS-2, 2026-11-26.
 * @module planSchema
 */

const weight = {
  type: 'object',
  description: 'The weight on the equipment, in the equipment\'s own unit. Null for exercises with no weight.',
  properties: {
    amount: { type: 'number' },
    unit: { type: 'string', enum: ['kg', 'lbs'] }
  },
  required: ['amount', 'unit'],
  additionalProperties: false
}

const exercise = {
  type: 'object',
  properties: {
    exerciseId: { type: 'string', description: 'An exercise id from the context.' },
    equipmentId: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'The loaded equipment the weight is for, from that exercise\'s equipment; null when it has none.'
    },
    sets: { type: 'integer' },
    reps: { type: 'integer' },
    weight: { anyOf: [weight, { type: 'null' }] }
  },
  required: ['exerciseId', 'equipmentId', 'sets', 'reps', 'weight'],
  additionalProperties: false
}

const day = {
  type: 'object',
  properties: {
    dayOfWeek: { type: 'integer', description: '1 is Monday, 7 is Sunday.' },
    exercises: { type: 'array', items: exercise }
  },
  required: ['dayOfWeek', 'exercises'],
  additionalProperties: false
}

const week = {
  type: 'object',
  properties: {
    week: { type: 'integer', description: 'Counts from 1.' },
    days: { type: 'array', items: day }
  },
  required: ['week', 'days'],
  additionalProperties: false
}

/**
 * The JSON schema of a plan, for the model's structured output.
 */
export const planSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'Two or three sentences: the approach and how the weights progress.' },
    weeks: { type: 'array', items: week }
  },
  required: ['summary', 'weeks'],
  additionalProperties: false
}

/**
 * @typedef {Object} PlanExercise
 * @property {string} exerciseId
 * @property {(string|null)} equipmentId
 * @property {number} sets
 * @property {number} reps
 * @property {({amount: number, unit: string}|null)} weight
 */

/**
 * @typedef {Object} Plan
 * @property {string} summary
 * @property {Array<{week: number, days: Array<{dayOfWeek: number, exercises: PlanExercise[]}>}>} weeks
 */

/**
 * @typedef {Object} Goal
 * @property {string} exerciseId - v1: one strength goal on one exercise
 * @property {{amount: number, unit: string}} weight - the weight to lift
 * @property {number} reps - for this many reps
 * @property {number} weeks - 4 to 12
 * @property {string} [startDate] - 'YYYY-MM-DD'; the plan starts that week's Monday (the Monday on or after it).
 * Without it, the Monday after today.
 */
