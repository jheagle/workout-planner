/**
 * Weights in kg or lbs, and timed holds. A workout stores its weight as entered, in the unit the equipment shows
 * (`weight` as decimal text, since json-fs-query has no decimal type, and `unit`), and every weight is shown in the
 * viewer's preferred unit, with the entered value kept alongside. Holds are whole `seconds`. WP-8, 2026-11-26: most
 * gym equipment here is in lbs, while Joshua thinks in kg.
 * @module units
 */

/** One pound in kilograms (exact, by definition). */
export const KG_PER_LB = 0.45359237

/** The units a weight can be in. */
export const WEIGHT_UNITS = ['kg', 'lbs']

/**
 * A weight in another unit, unrounded.
 * @param {number} amount
 * @param {string} from - 'kg' or 'lbs'
 * @param {string} to - 'kg' or 'lbs'
 * @returns {number}
 */
export const convertWeight = (amount, from, to) => {
  if (from === to) return amount
  return from === 'lbs' ? amount * KG_PER_LB : amount / KG_PER_LB
}

/**
 * A number for people: at most one decimal, none when it's whole (67.5, 30.6, 225).
 * @param {number} amount
 * @returns {string}
 */
export const formatAmount = amount => String(Math.round(amount * 10) / 10)

/**
 * A workout's weight, or null when it has none: `weight` and `unit`, or the old `weight_effort` text ('180lbs',
 * '2x40lbs', which is 80 lbs), so rows from before the change still read.
 * @param {{weight: (string|number|undefined), unit: (string|undefined), weight_effort: (string|undefined)}} workout
 * @returns {{amount: number, unit: string}|null}
 */
export const workoutWeight = workout => {
  if (workout.weight !== undefined && workout.weight !== null && workout.weight !== '') {
    return { amount: Number(workout.weight), unit: workout.unit || 'lbs' }
  }
  return readWeightText(workout.weight_effort || '').weight
}

/**
 * The old `weight_effort` text read as a weight or a hold: '180lbs', '2x40lbs' (two 40s: 80 lbs), '0:30', '2:00',
 * '30 seconds'. Anything else reads as neither.
 * @param {string} text
 * @returns {{weight: ({amount: number, unit: string}|null), seconds: (number|null)}}
 */
export const readWeightText = text => {
  const value = text.trim()
  const weight = value.match(/^(?:(\d+)\s*x\s*)?(\d+(?:\.\d+)?)\s*(lbs?|kgs?)$/i)
  if (weight) {
    const unit = /^kg/i.test(weight[3]) ? 'kg' : 'lbs'
    return { weight: { amount: Number(weight[2]) * Number(weight[1] || 1), unit }, seconds: null }
  }
  const clock = value.match(/^(\d+):(\d{2})$/)
  if (clock) return { weight: null, seconds: Number(clock[1]) * 60 + Number(clock[2]) }
  const seconds = value.match(/^(\d+)\s*(?:seconds?|secs?|s)$/i)
  if (seconds) return { weight: null, seconds: Number(seconds[1]) }
  return { weight: null, seconds: null }
}

/**
 * A weight shown in the viewer's unit: '81.6 kg'. When that isn't the unit it was entered in, `entered` is the
 * original ('180 lbs'), to show alongside.
 * @param {{amount: number, unit: string}|null} weight
 * @param {string} preferredUnit - 'kg' or 'lbs'
 * @returns {{text: string, entered: (string|null)}|null}
 */
export const showWeight = (weight, preferredUnit) => {
  if (!weight) return null
  const entered = `${formatAmount(weight.amount)} ${weight.unit}`
  if (weight.unit === preferredUnit) return { text: entered, entered: null }
  return { text: `${formatAmount(convertWeight(weight.amount, weight.unit, preferredUnit))} ${preferredUnit}`, entered }
}

/**
 * Seconds as a clock: 30 is '0:30', 125 is '2:05'.
 * @param {number} seconds
 * @returns {string}
 */
export const formatSeconds = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/**
 * A starting unit for someone who hasn't chosen one: lbs where it's the everyday unit (the US, Liberia, Myanmar),
 * kg everywhere else.
 * @param {string} [locale] - e.g. 'en-US'
 * @returns {string}
 */
export const defaultUnit = (locale = '') => /-(US|LR|MM)\b/i.test(locale) ? 'lbs' : 'kg'
