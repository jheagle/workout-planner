/**
 * What the model reads: the instructions (the system prompt) and the context, and the message for the fix round.
 * The rules in the instructions are written from the same numbers the checks use (LIMITS, PHASE_PACE), so the
 * prompt and the checks can't drift apart. LJS-2, 2026-11-27.
 *
 * Caching: the instructions never change and the context is the same in both rounds, so the context block is
 * marked for the prompt cache and the fix round reads it from there.
 * @module planPrompt
 */

import { ACTIVITY_MUSCLE_GROUPS, formatErrors, LIMITS } from './planChecks.js'
import { PHASE_PACE } from './planSchedule.js'

const percent = share => `${Math.round(share * 1000) / 10}%`

/**
 * The system prompt: the job, then every rule the checks hold the plan to.
 * @returns {string}
 */
export const planInstructions = () => [
  'You write strength training plans for one person, toward one goal: a lift, for a number of reps, by the end of a number of weeks.',
  'The context (JSON) has everything you need: the goal, the gym (equipment, days a week, session length), the schedule of weeks, ' +
  'the exercises this gym allows (with the muscles each works, its share of the work, the last session and an estimated one-rep max) ' +
  'and the muscles that need more work now (needsPriority). Use only what is in it.',
  '',
  'Rules (code checks every one; a plan that breaks any is sent back):',
  '- One entry in weeks per week of the goal, numbered from 1. At most profile.daysPerWeek training days a week, each on its own dayOfWeek (1 Monday to 7 Sunday); ' +
  'when profile.trainingDays is set, only on those days.',
  '- exerciseId is an id from context.exercises. Never an exercise on profile.avoid; every exercise on profile.mustInclude in every week. ' +
  'When profile.firstExercise is set, every session starts with it.',
  `- sets from ${LIMITS.minSets} to ${LIMITS.maxSets} (or profile.setsPerExercise.min to max, when set), reps from ${LIMITS.minReps} to ${LIMITS.maxReps}, whole numbers.`,
  '- An exercise with a loadedEquipment names it as equipmentId and has a weight its load can make: in load.unit, ' +
  'load.min + a whole number of load.step, never above load.max (load.addOns are not used). An exercise without one has equipmentId null and weight null.',
  `- A session fits profile.sessionMinutes: ${LIMITS.warmUpMinutes} minutes of warm-up plus ${LIMITS.minutesPerSet} minutes per set.`,
  `- Weighted sets per muscle (sets x the muscle's share / 100) are at most ${LIMITS.maxWeeklySets} a week. ` +
  `A muscle with ${LIMITS.hardDaySets} or more weighted sets in a day is worked hard; never hard on two days in a row (Sunday to Monday counts).`,
  `- When profile.minDaysPerMuscle is set, every muscle group (exercises[].muscles[].groupId) gets ${LIMITS.workedDaySets}+ weighted set on that many days of each week, except the test week.`,
  '- profile.otherTraining is other training on fixed weekdays. On its day and the day before, the muscle groups it uses get fewer than ' +
  `${LIMITS.hardDaySets} weighted sets each (${Object.entries(ACTIVITY_MUSCLE_GROUPS).map(([activity, groups]) => `${activity}: groups ${groups.join(', ')}`).join('; ')}).`,
  '- Each lift starts from its last session. Its top weight rises at most this much from one week to the next ' +
  `(or one step of its load, when that is more): ${Object.entries(PHASE_PACE).map(([phase, { maxJump }]) => `${percent(maxJump)} in a ${phase} week`).join(', ')}. ` +
  'Dropping is always fine.',
  '- Follow schedule[].kind for each week:',
  '  - build: normal training; the weights climb.',
  `  - lighter: at most ${percent(LIMITS.lighterSetsShare)} of the sets of the build week before it, and no lift heavier than in that week. ` +
  'The week after it carries on from that build week.',
  `  - taper: at most ${percent(LIMITS.taperSetsShare)} of the sets of the build week before it.`,
  '  - test: the goal lift for the goal\'s reps, at the goal weight (rounded to its equipment) or more.',
  '',
  'Aim: reach the goal safely, train the way profile.style describes, and give the muscles marked needsPriority a bit more of the weekly work. Keep the plan simple ' +
  'enough to follow: the same few exercises on the same days from week to week, changing sets, reps and weights.',
  'The summary is two or three plain sentences: the approach and how the weights progress.'
].join('\n')

/**
 * The first request: the instructions and the context.
 * @param {PlanContext} context
 * @returns {{system: string, messages: Array<Object>}}
 */
export const buildPrompt = context => ({
  system: planInstructions(),
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: `Context:\n${JSON.stringify(context)}`, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: 'Write the plan.' }
    ]
  }]
})

/**
 * The fix round's message: the exact errors, and the whole plan again.
 * @param {PlanError[]} errors
 * @returns {Object} a user message
 */
export const fixMessage = errors => ({
  role: 'user',
  content: `The checks found these problems:\n${formatErrors(errors)}\n\nReturn the whole plan again with every one fixed, keeping what was fine.`
})
