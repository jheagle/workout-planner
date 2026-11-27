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

// Joshua's exercises that the profile names (ids in database/exercises)
const PULL_UPS = '3f5817f7-a212-4269-a5d6-9086cba77589'

/**
 * Joshua's gym and week, from his notes on 2026-11-27 (the full list, with what's still unknown, is in tm:
 * WP/equipment). The equipment ids are the ones in database/equipment.
 *
 * - Weights are pin-only: a stack's add-on (a 5 lb dial or slider) is a real option on the day, but plans don't
 *   rely on it ("the full pin step feels like a real weight"). Add-ons are listed in `addOns` for later.
 * - The barbell steps by 10: 5 lb plates (one a side) are the smallest the gym reliably has.
 * - Machines differ, so the ones he uses have their own entry in `machines` (by exercise id); the rest use the
 *   general `machine` and `cable_machine` values, which are guesses.
 * - No weighted chin-ups (the cause of his brachialis injury): pull-up bar exercises take no weight in a plan.
 * @type {GymProfile}
 */
export const joshuaProfile = {
  unit: 'lbs',
  daysPerWeek: 2,
  trainingDays: [1, 4], // Monday and Thursday: two days before each run
  sessionMinutes: 60, // 40 to 60
  bodyweight: null, // WP-9: {amount, unit} once it's logged; room for bodyweight-relative targets later
  style: 'Full body every session. Usually 2 hard sets per exercise, taken near failure (about 1 rep left); a third set ' +
    'only to find the weight on a new machine, on a strong day, or as a lighter back-off set at the end.',
  setsPerExercise: { min: 1, max: 3 },
  minDaysPerMuscle: 2, // every muscle group worked on both days
  firstExercise: PULL_UPS, // slow pull-ups to start every session
  otherTraining: [
    { dayOfWeek: 3, activity: 'run' }, // a weeknight run, often Wednesday
    { dayOfWeek: 6, activity: 'run' } // Saturday morning
  ],
  equipment: {
    barbell: { unit: 'lbs', min: 45, step: 10 },
    ez_bar: { unit: 'lbs', min: 20, step: 10, max: 110 }, // the gym's fixed EZ and straight bars
    smith_machine: { unit: 'lbs', min: 0, step: 10 }, // bar weight unknown: plates only
    dumbbells: { unit: 'lbs', min: 5, step: 5, max: 110 },
    kettlebell: { unit: 'lbs', min: 10, step: 5, max: 70 }, // not checked
    machine: { unit: 'lbs', min: 10, step: 10 },
    cable_machine: { unit: 'lbs', min: 10, step: 10, max: 200 }, // some stacks step 7.5: not mapped yet
    t_bar_row: { unit: 'lbs', min: 0, step: 10 },
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
  // Each checked against his logged weights (e.g. hack squat 420 = 60 + four 45s a side)
  machines: {
    'f57af77f-9b72-4193-82b8-15e32ab620e3': { equipment: 'machine', name: 'hack squat (plate-loaded, 60 carriage)', unit: 'lbs', min: 60, step: 10, max: 510 },
    '33bc522e-cc6d-4fba-a9fb-ab4abfe5c85a': { equipment: 'machine', name: 'iso-lateral incline press (plate-loaded, per arm)', unit: 'lbs', min: 11, step: 5, max: 191 },
    'ea23c885-8e1e-446a-9d9f-c9ac2425adea': { equipment: 'machine', name: 'hip abduction', unit: 'lbs', min: 15, step: 10, max: 135, addOns: [5] },
    'bd7304f3-fd5c-4f93-b29e-6336e34bd7c3': { equipment: 'machine', name: 'hip adduction', unit: 'lbs', min: 15, step: 10, max: 135, addOns: [5] },
    '37b7f5ac-a34f-4d25-8a50-f1f2df49431c': { equipment: 'machine', name: 'pec deck', unit: 'lbs', min: 20, step: 20, addOns: [5] },
    'fe28d3b3-b5a8-4d6a-8e12-da3c24c4201a': { equipment: 'cable_machine', name: 'dual adjustable pulleys', unit: 'lbs', min: 10, step: 10, addOns: [5] },
    '045005cd-5bb5-43f1-b001-56d345d32b92': { equipment: 'machine', name: 'seated leg curl', unit: 'lbs', min: 10, step: 20 },
    '9a78a091-eb6c-40e6-9ff4-c17458157575': { equipment: 'machine', name: 'prone leg curl', unit: 'lbs', min: 10, step: 20 },
    '034d2dfe-ff8a-46ad-850d-4214cbec0e4e': { equipment: 'machine', name: 'leg extension', unit: 'lbs', min: 10, step: 20 },
    '470dcdc7-8a6d-4462-89cf-22a706dac9fd': { equipment: 'machine', name: 'standing calf raise', unit: 'lbs', min: 20, step: 20, addOns: [5, 5] },
    '14b1346f-de7e-4dbf-8885-4e29b2ffd835': { equipment: 'machine', name: 'standing calf raise', unit: 'lbs', min: 20, step: 20, addOns: [5, 5] },
    // Step 10 with a 5 slider, or 20 with a 5 dial: not sure, so 20, which is loadable either way
    'cc0c58c0-d307-4dda-9262-7eb554e648e8': { equipment: 'machine', name: 'chest press', unit: 'lbs', min: 20, step: 20 },
    '8bcd9730-f417-4397-a059-8ac13a830d4f': { equipment: 'machine', name: 'shoulder press', unit: 'lbs', min: 20, step: 20 }
  },
  mustInclude: [PULL_UPS], // exercise ids every week must have
  avoid: [], // exercise ids a plan must never use
  deloadEvery: 4, // a lighter week every 4th week (Joshua's history dips about every 3-4 weeks)
  // Joshua's phases from his Garmin weight (checked with him 2026-11-27): bulk Sep 2024 to Jul 2025, cut Mar to Jun
  // 2026, bulk since Aug 2026, cut Mar to Jun 2027 (his usual pattern, confirmed).
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
 * @property {number[]} [addOns] - small weights that go on top (a 5 lb dial); listed, not used by plans yet
 */

/**
 * @typedef {Object} Machine
 * @property {string} equipment - the equipment id it counts as (machine, cable_machine)
 * @property {string} name - what it is, for people and the model
 * @property {string} unit
 * @property {number} min
 * @property {number} step
 * @property {number} [max]
 * @property {number[]} [addOns]
 */

/**
 * @typedef {Object} GymProfile
 * @property {string} unit - the unit plans are shown in
 * @property {number} daysPerWeek - most training days in a week
 * @property {number[]} [trainingDays] - the only weekdays to train on (1 Monday to 7 Sunday); any day when absent
 * @property {number} sessionMinutes - longest session
 * @property {string} [style] - how the person trains, in plain words, for the model
 * @property {{min: number, max: number}} [setsPerExercise] - sets an exercise may have (the general limits when absent)
 * @property {number} [minDaysPerMuscle] - days a week every muscle group is worked (a lighter or taper week too; not
 * the test week)
 * @property {string} [firstExercise] - an exercise id every session starts with
 * @property {Array<{dayOfWeek: number, activity: string}>} [otherTraining] - other training on fixed weekdays (a
 * 'run'); the muscles it uses aren't worked hard on that day or the day before
 * @property {Object<string, Machine>} [machines] - by exercise id: the weights that exercise's machine makes, when it
 * differs from its equipment's general values
 * @property {({amount: number, unit: string}|null)} bodyweight
 * @property {Object<string, Equipment>} equipment - by equipment id; missing means the gym doesn't have it
 * @property {string[]} mustInclude - exercise ids
 * @property {string[]} avoid - exercise ids
 * @property {(number|null)} [deloadEvery] - a lighter week every this many weeks (default 4; 0 or null: none)
 * @property {Array<{phase: string, from: string, to: (string|undefined)}>} [phases] - 'cut', 'maintain' or 'bulk'
 * from one date to another ('YYYY-MM-DD', both ends included); a date outside them is maintain
 */

/**
 * What takes the weight in an exercise, and the weights it makes: its own machine when the profile has one,
 * otherwise the first of its equipment that takes a weight. Null for a bodyweight exercise.
 * @param {GymProfile} profile
 * @param {string} exerciseId
 * @param {string[]} equipmentIds - the equipment the exercise needs
 * @returns {({equipmentId: string, load: Equipment}|null)} load has `name` too for a machine
 */
export const loadFor = (profile, exerciseId, equipmentIds) => {
  const machine = profile.machines && profile.machines[exerciseId]
  if (machine) {
    const { equipment, ...load } = machine
    return { equipmentId: equipment, load }
  }
  const equipmentId = equipmentIds.find(id => isLoaded(profile.equipment[id]))
  return equipmentId ? { equipmentId, load: profile.equipment[equipmentId] } : null
}

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
