/**
 * The gym a plan is built for: which equipment there is, the weights each piece can actually be set to, and the
 * days and time there are to train. A plan's weights must be ones the equipment can make (a barbell can't hold 137
 * lbs with 2.5 lb plates), so every weight is rounded to its equipment's steps.
 *
 * A loaded piece of equipment is `{unit, min, step, max}`: it makes min, min + step, min + 2 x step, ... up to max
 * (no max: no limit). A barbell with a 45 lb bar and 2.5 lb plates is min 45, step 5 (one plate a side). Equipment
 * with no weight of its own (a bench, a pull-up bar) is `{}`. LJS-2, 2026-11-26.
 * @module gymProfile
 */

import { convertWeight } from '../data/units.js'

/**
 * PLACEHOLDER values, not Joshua's gym yet: his list (equipment steps, days, session length, must-haves and
 * no-gos, the v1 goal) replaces these. The equipment ids are the ones in database/equipment.
 * @type {GymProfile}
 */
export const placeholderProfile = {
  unit: 'lbs',
  daysPerWeek: 4,
  sessionMinutes: 60,
  bodyweight: null, // WP-9: {amount, unit} once it's logged; room for bodyweight-relative targets later
  equipment: {
    barbell: { unit: 'lbs', min: 45, step: 5 },
    ez_bar: { unit: 'lbs', min: 25, step: 5 },
    smith_machine: { unit: 'lbs', min: 0, step: 5 },
    dumbbells: { unit: 'lbs', min: 5, step: 5, max: 100 },
    kettlebell: { unit: 'lbs', min: 10, step: 5, max: 70 },
    machine: { unit: 'lbs', min: 10, step: 10, max: 300 },
    cable_machine: { unit: 'lbs', min: 5, step: 5, max: 200 },
    t_bar_row: { unit: 'lbs', min: 0, step: 5 },
    bench: {},
    decline_bench: {},
    back_extension_bench: {},
    dip_bars: {},
    pull_up_bar: {},
    captain_s_chair: {},
    ab_wheel: {},
    exercise_ball: {},
    suspension_trainer_trx: {}
  },
  mustInclude: [], // exercise ids every week must have
  avoid: [], // exercise ids a plan must never use
  deloadEvery: 4, // a lighter week every 4th week (Joshua's history dips about every 3-4 weeks)
  // Joshua's phases from his Garmin weight (checked with him 2026-11-27): bulk Sep 2024 to Jul 2025, cut Mar to Jun
  // 2026, bulk since Aug 2026. The next cut is his usual March start, a guess until he plans it.
  phases: [
    { phase: 'bulk', from: '2024-09-01', to: '2025-07-31' },
    { phase: 'cut', from: '2026-03-01', to: '2026-06-30' },
    { phase: 'bulk', from: '2026-08-01', to: '2027-02-28' },
    { phase: 'cut', from: '2027-03-01', to: '2027-06-30' }
  ]
}

/**
 * @typedef {Object} Equipment
 * @property {string} [unit] - 'kg' or 'lbs'; only loaded equipment has one
 * @property {number} [min] - the lightest weight it makes
 * @property {number} [step] - the smallest change in weight
 * @property {number} [max] - the heaviest weight it makes (none: no limit)
 */

/**
 * @typedef {Object} GymProfile
 * @property {string} unit - the unit plans are shown in
 * @property {number} daysPerWeek - most training days in a week
 * @property {number} sessionMinutes - longest session
 * @property {({amount: number, unit: string}|null)} bodyweight
 * @property {Object<string, Equipment>} equipment - by equipment id; missing means the gym doesn't have it
 * @property {string[]} mustInclude - exercise ids
 * @property {string[]} avoid - exercise ids
 * @property {(number|null)} [deloadEvery] - a lighter week every this many weeks (default 4; 0 or null: none)
 * @property {Array<{phase: string, from: string, to: (string|undefined)}>} [phases] - 'cut', 'maintain' or 'bulk'
 * from one date to another ('YYYY-MM-DD', both ends included); a date outside them is maintain
 */

/**
 * Whether the equipment takes a weight (a barbell, a machine) or not (a bench).
 * @param {Equipment} equipment
 * @returns {boolean}
 */
export const isLoaded = equipment => Boolean(equipment && equipment.step)

// Steps are often fractions (2.5 kg); compare with a little room for floating point
const EPSILON = 1e-6

/**
 * The nearest weight the equipment can make, in its own unit; a weight in another unit is converted first.
 * Below its lightest it's the lightest, above its heaviest the heaviest.
 * @param {{amount: number, unit: string}} weight
 * @param {Equipment} equipment - loaded
 * @returns {{amount: number, unit: string}}
 */
export const roundToEquipment = (weight, equipment) => {
  const amount = convertWeight(weight.amount, weight.unit, equipment.unit)
  const steps = Math.round((amount - equipment.min) / equipment.step)
  let rounded = equipment.min + Math.max(0, steps) * equipment.step
  if (equipment.max !== undefined && rounded > equipment.max) {
    rounded = equipment.min + Math.floor((equipment.max - equipment.min) / equipment.step + EPSILON) * equipment.step
  }
  return { amount: Math.round(rounded * 1000) / 1000, unit: equipment.unit }
}

/**
 * Whether the equipment can make exactly this weight, in its own unit.
 * @param {{amount: number, unit: string}} weight
 * @param {Equipment} equipment - loaded
 * @returns {boolean}
 */
export const canMake = (weight, equipment) => {
  if (weight.unit !== equipment.unit) return false
  if (weight.amount < equipment.min - EPSILON) return false
  if (equipment.max !== undefined && weight.amount > equipment.max + EPSILON) return false
  const steps = (weight.amount - equipment.min) / equipment.step
  return Math.abs(steps - Math.round(steps)) < EPSILON
}
