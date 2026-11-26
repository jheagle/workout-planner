/**
 * The muscle map: every muscle (some split into regions that training can target separately) and how much of each
 * exercise's work each muscle does. Worked out with Joshua on 2026-11-26 (WP-1; the discussion and the reasons are in
 * tm's WP/muscle-map).
 *
 * Rules:
 * - An exercise links to a region where its muscle has them (Chest: upper, mid/lower), otherwise to the muscle.
 * - A rank is the muscle's share of the work, 0-100: 100 the target, 60-80 strong, 30-50 minor. Estimates, to be
 *   fine-tuned.
 * - No stabilizers, except the core on lifts that need heavy bracing (squats including hack and Smith, deadlifts,
 *   RDLs, standing presses): abs, obliques and erector spinae get about 20.
 * - An exercise is mapped for its usual form (cable cross: high to low).
 * @module muscleMap
 */
import { nameKey } from './sheetImport.js'

/**
 * Every muscle. The first 14 keep the ids the app started with; a muscle with regions is a parent, and its regions
 * name it in `parent_id`.
 * @type {Array<{_id: string, name: string, alias: string, parent_id: (string|undefined)}>}
 */
export const muscles = [
  { _id: '1', name: 'Abdominal', alias: 'abs' },
  { _id: '2', name: 'Biceps', alias: '' },
  { _id: '3', name: 'Calves', alias: '' },
  { _id: 'gastrocnemius', name: 'Gastrocnemius', alias: 'calves, straight knee', parent_id: '3' },
  { _id: 'soleus', name: 'Soleus', alias: 'calves, bent knee', parent_id: '3' },
  { _id: '4', name: 'Deltoids', alias: 'shoulders' },
  { _id: 'delt_front', name: 'Front deltoid', alias: 'front of the shoulder', parent_id: '4' },
  { _id: 'delt_side', name: 'Side deltoid', alias: 'side of the shoulder', parent_id: '4' },
  { _id: 'delt_rear', name: 'Rear deltoid', alias: 'back of the shoulder', parent_id: '4' },
  { _id: '5', name: 'Erector Spinae', alias: 'lower back, along the spine' },
  { _id: '6', name: 'Forearms', alias: 'grip' },
  { _id: 'forearm_flexors', name: 'Forearm flexors', alias: 'grip, wrist curls', parent_id: '6' },
  { _id: 'forearm_extensors', name: 'Forearm extensors', alias: 'back of the forearm', parent_id: '6' },
  { _id: '7', name: 'Glutes', alias: 'glutes' },
  { _id: 'glute_max', name: 'Gluteus maximus', alias: 'glutes', parent_id: '7' },
  { _id: 'glute_medius', name: 'Gluteus medius', alias: 'side glutes, hip abductors', parent_id: '7' },
  { _id: '8', name: 'Hamstrings', alias: 'back of the thigh' },
  { _id: '9', name: 'Latissimus Dorsi', alias: 'lats' },
  { _id: '10', name: 'Obliques', alias: 'sides of the abs' },
  { _id: '11', name: 'Pectorals', alias: 'chest' },
  { _id: 'chest_upper', name: 'Upper chest', alias: 'clavicular head', parent_id: '11' },
  { _id: 'chest_mid_lower', name: 'Mid and lower chest', alias: 'sternocostal head', parent_id: '11' },
  { _id: '12', name: 'Quadriceps', alias: 'quads' },
  { _id: '13', name: 'Trapezius', alias: 'traps' },
  { _id: 'traps_upper', name: 'Upper traps', alias: 'neck to shoulders', parent_id: '13' },
  { _id: 'traps_mid_lower', name: 'Mid and lower traps', alias: 'between the shoulder blades', parent_id: '13' },
  { _id: '14', name: 'Triceps', alias: '' },
  { _id: 'triceps_long', name: 'Triceps long head', alias: 'worked most overhead', parent_id: '14' },
  { _id: 'triceps_lateral_medial', name: 'Triceps lateral and medial heads', alias: 'worked most in pushdowns', parent_id: '14' },
  { _id: 'rotator_cuff', name: 'Rotator cuff', alias: 'shoulder rotators' },
  { _id: 'rhomboids', name: 'Rhomboids', alias: 'mid back' },
  { _id: 'brachialis', name: 'Brachialis', alias: 'with brachioradialis: hammer and reverse curls' },
  { _id: 'hip_flexors', name: 'Hip flexors', alias: 'front of the hip' },
  { _id: 'adductors', name: 'Adductors', alias: 'inner thigh' }
]

/** Short names used in the shares below. */
const U = 'chest_upper'
const M = 'chest_mid_lower'
const FD = 'delt_front'
const SD = 'delt_side'
const RD = 'delt_rear'
const TL = 'triceps_long'
const TLM = 'triceps_lateral_medial'
const BI = '2'
const BR = 'brachialis'
const FF = 'forearm_flexors'
const FE = 'forearm_extensors'
const LATS = '9'
const RH = 'rhomboids'
const UT = 'traps_upper'
const MT = 'traps_mid_lower'
const RC = 'rotator_cuff'
const ES = '5'
const ABS = '1'
const OBL = '10'
const HF = 'hip_flexors'
const Q = '12'
const H = '8'
const GX = 'glute_max'
const GM = 'glute_medius'
const ADD = 'adductors'
const GAS = 'gastrocnemius'
const SOL = 'soleus'

/**
 * Triceps in a press, push-up or dip: the share goes to the lateral and medial heads, and the long head gets about 60%
 * of it (to the nearest 10).
 * @param {number} share
 * @returns {Object<string, number>}
 */
const pressTriceps = share => ({ [TLM]: share, [TL]: Math.round(share * 0.6 / 10) * 10 })

/** The core share on lifts that need heavy bracing (erector spinae keeps a bigger share where it has one). */
const CORE = { [ABS]: 20, [OBL]: 20, [ES]: 20 }

/**
 * Each exercise's muscles, by exercise name (matched without case or spacing) to muscle or region id and share.
 * @type {Object<string, Object<string, number>>}
 */
export const exerciseShares = {
  // Chest presses and flys
  'Barbell bench press': { [U]: 70, [M]: 100, [FD]: 50, ...pressTriceps(50) },
  'Chest Press': { [U]: 70, [M]: 100, [FD]: 50, ...pressTriceps(50) },
  'MTS Chest Press': { [U]: 70, [M]: 100, [FD]: 50, ...pressTriceps(50) },
  'Iso-lateral Bench Press': { [U]: 70, [M]: 100, [FD]: 50, ...pressTriceps(50) },
  'Dumbbell Chest Press': { [U]: 70, [M]: 100, [FD]: 50, ...pressTriceps(40) },
  'Barbell Incline Press': { [U]: 100, [M]: 60, [FD]: 70, ...pressTriceps(50) },
  'Dumbbell Incline Press': { [U]: 100, [M]: 60, [FD]: 70, ...pressTriceps(40) },
  'MTS Incline Press': { [U]: 100, [M]: 60, [FD]: 70, ...pressTriceps(50) },
  'Smith Incline Bench': { [U]: 100, [M]: 60, [FD]: 70, ...pressTriceps(50) },
  'MTS Decline Press': { [U]: 40, [M]: 100, [FD]: 30, ...pressTriceps(50) },
  'Dumbbell flys': { [U]: 60, [M]: 100, [FD]: 40 },
  'Pec Fly': { [U]: 60, [M]: 100, [FD]: 30 },
  'Cable Pec Cross': { [U]: 40, [M]: 100, [FD]: 30 },
  'TRX Fly': { [U]: 60, [M]: 100, [FD]: 50 },

  // Push-ups and dips
  'Decline Push-ups': { [U]: 100, [M]: 60, [FD]: 70, ...pressTriceps(50) },
  'Diamond push-ups': { [U]: 50, [M]: 70, [FD]: 50, ...pressTriceps(100) },
  'Pike Push-ups': { [U]: 40, [FD]: 100, [SD]: 40, ...pressTriceps(60) },
  'Triceps Dips': { [M]: 60, [FD]: 50, ...pressTriceps(100) },
  'Seated Dip': { [M]: 50, [FD]: 30, ...pressTriceps(100) },
  'Biceps Push-ups': { [U]: 40, [M]: 50, [FD]: 70, ...pressTriceps(100), [BI]: 40 },

  // Shoulders (all presses seated: no core share)
  'Shoulder Press': { [FD]: 100, [SD]: 60, ...pressTriceps(60), [UT]: 30 },
  'MTS Shoulders Press': { [FD]: 100, [SD]: 60, ...pressTriceps(60), [UT]: 30 },
  'Arnold Press': { [FD]: 100, [SD]: 70, ...pressTriceps(50), [UT]: 30 },
  'Cable Arnold Press': { [FD]: 100, [SD]: 70, ...pressTriceps(50), [UT]: 30 },
  'Dumbbell Front Raise': { [FD]: 100, [SD]: 30, [U]: 30 },
  'Cable Front delt': { [FD]: 100, [SD]: 30, [U]: 30 },
  'Dumbbell Lateral Raise': { [FD]: 30, [SD]: 100, [UT]: 40 },
  'Cable Lateral Raise': { [FD]: 30, [SD]: 100, [UT]: 40 },
  'Dumbbell Leaning Lateral Raises': { [FD]: 20, [SD]: 100, [UT]: 30 },
  'Lateral Raises': { [FD]: 30, [SD]: 100, [UT]: 30 },
  'Rear delt': { [RD]: 100, [MT]: 60, [RH]: 60, [RC]: 30 },
  'Rear Delt, Unilateral': { [RD]: 100, [MT]: 60, [RH]: 60, [RC]: 30 },
  'Cable Rear Delt': { [RD]: 100, [MT]: 50, [RH]: 50, [RC]: 30 },
  'TRX face pulls': { [RD]: 100, [MT]: 70, [RH]: 70, [RC]: 60, [BI]: 30 },
  'Dumbbell External Rotation': { [RD]: 30, [RC]: 100 },
  'Shoulder 6 ways': { [FD]: 90, [SD]: 100, [UT]: 60, [RC]: 30, [U]: 30 },

  // Back
  'Pull-ups': { [LATS]: 100, [RH]: 50, [MT]: 50, [RD]: 30, [BI]: 50, [BR]: 50, [FF]: 40 },
  'Chin-ups': { [LATS]: 100, [RH]: 40, [MT]: 40, [RD]: 20, [BI]: 80, [BR]: 50, [FF]: 40 },
  'Mixed grip chin/pull-up': { [LATS]: 100, [RH]: 50, [MT]: 50, [RD]: 20, [BI]: 60, [BR]: 50, [FF]: 40 },
  'Archer Pull-ups': { [LATS]: 100, [RH]: 50, [MT]: 50, [RD]: 20, [BI]: 60, [BR]: 50, [FF]: 50 },
  'One-arm chin-up': { [LATS]: 100, [RH]: 40, [MT]: 40, [RD]: 20, [BI]: 80, [BR]: 60, [FF]: 60, [OBL]: 30 },
  'High pull-ups': { [LATS]: 100, [RH]: 70, [MT]: 70, [RD]: 40, [BI]: 60, [BR]: 50, [FF]: 50 },
  'L-sit Chin-ups': { [LATS]: 100, [RH]: 40, [MT]: 40, [BI]: 80, [BR]: 50, [FF]: 40, [HF]: 80, [ABS]: 60 },
  'Monkey Bars': { [LATS]: 100, [RH]: 30, [MT]: 30, [BI]: 50, [BR]: 50, [FF]: 80, [OBL]: 20 },
  'Lat Pulldown': { [LATS]: 100, [RH]: 40, [MT]: 40, [RD]: 20, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Front pulldown': { [LATS]: 100, [RH]: 40, [MT]: 40, [RD]: 20, [BI]: 50, [BR]: 40, [FF]: 30 },
  'MTS Front Pulldown': { [LATS]: 100, [RH]: 40, [MT]: 40, [RD]: 20, [BI]: 50, [BR]: 40, [FF]: 30 },
  'MTS HIgh Row': { [LATS]: 100, [RH]: 60, [MT]: 60, [RD]: 40, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Dumbbell Rows': { [LATS]: 100, [RH]: 70, [MT]: 70, [RD]: 40, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Cable Rows': { [LATS]: 90, [RH]: 100, [MT]: 100, [RD]: 50, [BI]: 50, [BR]: 40, [FF]: 30 },
  'MTS Row': { [LATS]: 90, [RH]: 100, [MT]: 100, [RD]: 50, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Dual Pulley Row': { [LATS]: 90, [RH]: 100, [MT]: 100, [RD]: 50, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Mid Row': { [LATS]: 90, [RH]: 100, [MT]: 100, [RD]: 50, [BI]: 50, [BR]: 40, [FF]: 30 },
  'T-bar row': { [LATS]: 90, [RH]: 100, [MT]: 100, [RD]: 50, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Inverse Body Rows': { [LATS]: 80, [RH]: 100, [MT]: 100, [RD]: 60, [BI]: 50, [BR]: 40, [FF]: 30 },
  'Back Extension': { [ES]: 100, [GX]: 60, [H]: 50 },

  // Arms
  'Biceps curl (machine)': { [BI]: 100, [BR]: 50, [FF]: 30 },
  'MTS Biceps Curl': { [BI]: 100, [BR]: 50, [FF]: 30 },
  'Preacher Curl': { [BI]: 100, [BR]: 60, [FF]: 30 },
  'Dumbbell Preacher Curl': { [BI]: 100, [BR]: 60, [FF]: 30 },
  'EZ-Bar Preacher Curl': { [BI]: 100, [BR]: 60, [FF]: 30 },
  'Dumbbell Hammer Curls': { [BI]: 60, [BR]: 100, [FF]: 30, [FE]: 50 },
  'EZ-Bar Reverse Curl': { [BI]: 40, [BR]: 100, [FE]: 70 },
  // Joshua's way: hammer grip up, palms down on the way down
  'Zottman Curls': { [BI]: 50, [BR]: 100, [FF]: 30, [FE]: 70 },
  'Dumbbell Wrist Curl': { [FF]: 100 },
  'Triceps Pushdown': { [TL]: 60, [TLM]: 100 },
  'Unilateral Triceps Pushdown': { [TL]: 60, [TLM]: 100 },
  // Overhead
  'Cable Triceps Extension': { [TL]: 100, [TLM]: 70 },
  'Dumbbell Triceps Extension': { [TL]: 100, [TLM]: 70 },
  // The fixed machine
  'Triceps Extension': { [TL]: 70, [TLM]: 100 },
  // A single-arm cable kickback
  'Unilateral Cable Extensions': { [TL]: 60, [TLM]: 100 },

  // Legs
  'Barbell Squat': { [Q]: 100, [H]: 30, [GX]: 80, [GM]: 30, [ADD]: 60, ...CORE, [ES]: 40 },
  'Smith Squat': { [Q]: 100, [H]: 30, [GX]: 70, [ADD]: 50, ...CORE },
  'Hack Squat': { [Q]: 100, [H]: 20, [GX]: 60, [ADD]: 50, ...CORE },
  'V-Squat': { [Q]: 100, [H]: 20, [GX]: 70, [ADD]: 50, ...CORE },
  'Leg Press': { [Q]: 100, [H]: 20, [GX]: 60, [ADD]: 50 },
  'Linear Leg Press': { [Q]: 100, [H]: 20, [GX]: 60, [ADD]: 50 },
  'Jump Squats': { [Q]: 100, [H]: 30, [GX]: 70, [GAS]: 50, [SOL]: 30 },
  'Pistol Squat': { [Q]: 100, [H]: 20, [GX]: 70, [GM]: 50, [ADD]: 40, [ABS]: 20, [HF]: 30 },
  'Kettlebell Bulgarian Split Squats': { [Q]: 100, [H]: 30, [GX]: 80, [GM]: 50, [ADD]: 50 },
  'Smith Bulgarian Split Squats': { [Q]: 100, [H]: 30, [GX]: 80, [GM]: 50, [ADD]: 50 },
  Deadlift: { [Q]: 60, [H]: 80, [GX]: 100, [ADD]: 50, ...CORE, [ES]: 80, [FF]: 60, [UT]: 40, [LATS]: 30 },
  'Romanian Deadlift': { [H]: 100, [GX]: 90, [ADD]: 40, ...CORE, [ES]: 60, [FF]: 40 },
  'Dumbbell Romanian Deadlift': { [H]: 100, [GX]: 90, [ADD]: 40, ...CORE, [ES]: 50, [FF]: 30 },
  'Kickstand RDL': { [H]: 100, [GX]: 90, [GM]: 40, [ADD]: 30, ...CORE, [ES]: 40 },
  'Hip Thrust': { [Q]: 30, [H]: 40, [GX]: 100, [GM]: 30, [ADD]: 30 },
  'Hip Abduction': { [GX]: 50, [GM]: 100 },
  'Hip Adduction': { [ADD]: 100 },
  'MTS Leg Extension': { [Q]: 100 },
  'Seated Leg Extensions': { [Q]: 100 },
  'Prone Leg Curl': { [H]: 100, [GAS]: 30 },
  'Seated leg curl': { [H]: 100, [GAS]: 30 },
  'MTS Kneeling Leg Curl': { [H]: 100, [GAS]: 30 },
  'Standing Calf Raises': { [GAS]: 100, [SOL]: 60 },
  'Unilateral Standing Calf Raises': { [GAS]: 100, [SOL]: 60 },
  'Calf raise, leg press': { [GAS]: 100, [SOL]: 60 },
  'Seated Calf Raises': { [GAS]: 30, [SOL]: 100 },
  'Horizontal Calf': { [GAS]: 100, [SOL]: 60 },
  'Unilateral Horizontal Calf': { [GAS]: 100, [SOL]: 60 },

  // Core
  'Abdominal Crunch': { [ABS]: 100, [OBL]: 30 },
  'MTS Abdominal Crunch': { [ABS]: 100, [OBL]: 30 },
  'Ab Core': { [ABS]: 100, [OBL]: 30, [HF]: 50 },
  'Ab Core, twist': { [ABS]: 80, [OBL]: 100, [HF]: 50 },
  'Decline Crunch': { [ABS]: 100, [OBL]: 30, [HF]: 40 },
  'Ab Wheel': { [ABS]: 100, [OBL]: 40, [HF]: 30, [LATS]: 40 },
  'Dragon Flag': { [ABS]: 100, [OBL]: 40, [HF]: 50, [LATS]: 40 },
  Plank: { [ABS]: 100, [OBL]: 50, [FD]: 30 },
  'Plank knee touches': { [ABS]: 100, [OBL]: 60, [HF]: 50 },
  'Side Plank': { [ABS]: 40, [OBL]: 100, [GM]: 40 },
  'Hand-to-Foot ball pass': { [ABS]: 100, [HF]: 80 },
  'Hanging Legs Raises': { [ABS]: 100, [OBL]: 30, [HF]: 90, [FF]: 40, [LATS]: 20 },
  'Mixed grip leg raises': { [ABS]: 100, [OBL]: 30, [HF]: 90, [FF]: 40, [LATS]: 20 },
  'Hanging Knee raise': { [ABS]: 60, [HF]: 100, [FF]: 40 },
  'Hanging L Sit': { [ABS]: 70, [HF]: 100, [FF]: 50, [LATS]: 20 },
  "Captain's chair leg raises": { [ABS]: 70, [OBL]: 30, [HF]: 100 },
  "Captain's Chair L sit": { [ABS]: 70, [HF]: 100 },
  'L-Sit Flutter Kicks': { [ABS]: 80, [HF]: 100 },
  'Hanging Knee cross': { [ABS]: 50, [OBL]: 100, [HF]: 70, [FF]: 40 },
  'Hanging core twist': { [ABS]: 50, [OBL]: 100, [HF]: 50, [FF]: 40 }
}

/** Descriptions written for users, by exercise name. */
export const exerciseDescriptions = {
  'Shoulder 6 ways': [
    'Shoulder combo: a light-weight sequence that works all three heads of the shoulder. Good as a warm-up before',
    'shoulder work or as a cooldown at the end.',
    '1. Stand with a light dumbbell in each hand at your sides.',
    '2. Lift (lateral raise): raise your arms out to the sides until they\'re level with your shoulders, making a "T".',
    '3. Sweep forward: keep your arms straight and at shoulder height, and sweep them forward until they point straight ahead.',
    '4. Lift (front raise): raise your arms the rest of the way until they\'re straight overhead.',
    '5. Reverse, slowly: lower to shoulder height in front, sweep back out to the "T", then lower to your sides.',
    'Keep the weight light and move with control, especially on the way down.'
  ].join('\n'),
  'L-Sit Flutter Kicks': [
    'Done in a captain\'s chair. Works the hip flexors and abs, one leg at a time.',
    '1. Support yourself on your forearms, back against the pad, and raise both legs straight out in front into an L.',
    '2. Keep one leg up. Slowly lower the other, then raise it back to the L. That\'s one rep for that leg.',
    '3. Switch legs and repeat. Count each leg when it gets back to the L, and finish on an even number so both legs do the same work.',
    '4. Optional finish: one slow, strict lowering and raising of both legs together, for a stretch (not counted).',
    'Keep your lower back against the pad; don\'t let the hips tip forward as a leg lowers.'
  ].join('\n')
}

/**
 * Write the muscle map into a database: the muscles (adding `parent_id` to the record if it's missing), each mapped
 * exercise's links (replacing the ones it had), and the descriptions. Running it again changes nothing.
 * @param {function(string): Promise<Array>} query - json-fs-query's query, configured for the database.
 * @param {function(*): string} quote - json-fs-query's quote.
 * @returns {Promise<{musclesAdded: string[], musclesUpdated: string[], exercisesLinked: number, links: number, unmapped: string[], missing: string[]}>}
 * unmapped: stored exercises with no entry in the map; missing: map entries with no stored exercise.
 */
export const applyMuscleMap = async (query, quote) => {
  const [{ definition }] = await query('describe muscles')
  if (!definition.some(field => field.name === 'parent_id')) await query('alter muscles add parent_id string optional')

  const report = { musclesAdded: [], musclesUpdated: [], exercisesLinked: 0, links: 0, unmapped: [], missing: [] }
  const [storedMuscles] = await query('read muscles')
  for (const muscle of muscles) {
    const stored = storedMuscles.find(each => String(each._id) === muscle._id)
    const values = [`name = ${quote(muscle.name)}`, `alias = ${quote(muscle.alias)}`]
    if (muscle.parent_id) values.push(`parent_id = ${quote(muscle.parent_id)}`)
    if (!stored) {
      await query(`insert muscles values _id = ${quote(muscle._id)}, ${values.join(', ')}, image = ''`)
      report.musclesAdded.push(muscle.name)
    } else if (stored.name !== muscle.name || (stored.alias ?? '') !== muscle.alias || (stored.parent_id ?? undefined) !== muscle.parent_id) {
      await query(`update muscles set ${values.join(', ')} where _id = ${quote(muscle._id)}`)
      report.musclesUpdated.push(stored.name === muscle.name ? muscle.name : `${stored.name} -> ${muscle.name}`)
    }
  }

  const [exercises] = await query('read exercises')
  const byKey = new Map(exercises.map(exercise => [nameKey(exercise.name), exercise]))
  const mapped = new Set()
  for (const [name, shares] of Object.entries(exerciseShares)) {
    const exercise = byKey.get(nameKey(name))
    if (!exercise) {
      report.missing.push(name)
      continue
    }
    mapped.add(nameKey(name))
    const exerciseId = quote(String(exercise._id))
    const [current] = await query(`read exercise_muscle where exercise_id = ${exerciseId}`)
    const same = current.length === Object.keys(shares).length &&
      current.every(link => shares[String(link.muscle_id)] === link.muscle_rank)
    if (!same) {
      if (current.length) await query(`delete exercise_muscle where exercise_id = ${exerciseId}`)
      const rows = Object.entries(shares).map(([muscleId, rank]) => `(exercise_id = ${exerciseId}, muscle_id = ${quote(muscleId)}, muscle_rank = ${rank})`)
      await query(`insert exercise_muscle values ${rows.join(', ')}`)
    }
    report.exercisesLinked++
    report.links += Object.keys(shares).length
    const description = exerciseDescriptions[name]
    if (description && exercise.description !== description) {
      await query(`update exercises set description = ${quote(description)} where _id = ${exerciseId}`)
    }
  }
  report.unmapped = exercises.filter(exercise => !mapped.has(nameKey(exercise.name))).map(exercise => exercise.name)
  return report
}
