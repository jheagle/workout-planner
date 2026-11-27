/**
 * The code that checks a plan: the model proposes, these decide. Every error names the exact field
 * (`weeks[1].days[0].exercises[2].weight`) and what's wrong with it, so one fix round can hand the model the list,
 * and the evals grade plans by the same checks. LJS-2, 2026-11-26.
 *
 * The limits are starting points, kept here as constants to tune from real plans.
 * @module planChecks
 */

import { convertWeight, formatAmount } from '../data/units.js'
import { canMake, roundToEquipment } from './gymProfile.js'

export const LIMITS = {
  minWeeks: 4,
  maxWeeks: 12,
  maxGoalReps: 20,
  maxGainPerWeek: 0.02, // a goal's implied max may be at most 2% a week above the current estimated max
  minSets: 1,
  maxSets: 8,
  minReps: 1,
  maxReps: 30,
  minutesPerSet: 2.5, // one set with its rest
  warmUpMinutes: 10,
  maxWeeklySets: 20, // weighted sets per muscle per week (10-20 is the common range for growth)
  hardDaySets: 3, // weighted sets on a day that make it a hard day for that muscle
  minDaysBetweenHardDays: 2, // no muscle hard on two days in a row
  maxJump: 0.1 // the top weight may rise at most 10% a week (or one step, when that's more)
}

/**
 * @typedef {Object} PlanError
 * @property {string} path - the field, e.g. 'weeks[1].days[0].exercises[2].weight'; '' for the plan as a whole
 * @property {string} message
 */

const weightText = weight => `${formatAmount(weight.amount)} ${weight.unit}`

/**
 * Whether a goal can be planned for: its exercise is one this gym allows, and it's a strength goal v1 handles in a
 * realistic time.
 * @param {import('./planSchema.js').Goal} goal
 * @param {import('./planContext.js').PlanContext} context
 * @returns {PlanError[]}
 */
export const checkGoal = (goal, context) => {
  const errors = []
  const add = (path, message) => errors.push({ path, message })
  const exercise = context.exercises.find(row => row.id === String(goal.exerciseId))
  if (!exercise) add('goal.exerciseId', `exercise ${goal.exerciseId} isn't one this gym's equipment allows`)
  if (!Number.isInteger(goal.weeks) || goal.weeks < LIMITS.minWeeks || goal.weeks > LIMITS.maxWeeks) {
    add('goal.weeks', `must be a whole number of weeks from ${LIMITS.minWeeks} to ${LIMITS.maxWeeks}`)
  }
  if (!Number.isInteger(goal.reps) || goal.reps < 1 || goal.reps > LIMITS.maxGoalReps) {
    add('goal.reps', `must be a whole number from 1 to ${LIMITS.maxGoalReps}`)
  }
  if (!goal.weight || !(goal.weight.amount > 0) || !['kg', 'lbs'].includes(goal.weight.unit)) {
    add('goal.weight', 'must be a weight above 0, in kg or lbs')
  }
  if (errors.length || !exercise.estimatedMax) return errors

  const now = exercise.estimatedMax.amount
  const target = context.goal.targetMax.amount
  const reachable = now * (1 + LIMITS.maxGainPerWeek * goal.weeks)
  if (target > reachable) {
    add('goal', `${goal.reps} x ${weightText(goal.weight)} needs a max of about ${formatAmount(target)} ${context.profile.unit}; ` +
      `the estimate now is ${formatAmount(now)}, and ${goal.weeks} weeks can realistically reach about ${formatAmount(reachable)}`)
  }
  return errors
}

/**
 * Every problem with a plan, or none.
 * @param {import('./planSchema.js').Plan} plan
 * @param {import('./planContext.js').PlanContext} context
 * @returns {PlanError[]}
 */
export const checkPlan = (plan, context) => {
  const errors = []
  const add = (path, message) => errors.push({ path, message })
  const { goal, profile } = context
  const exercisesById = new Map(context.exercises.map(exercise => [exercise.id, exercise]))
  const avoid = new Set((profile.avoid || []).map(String))
  const weeks = Array.isArray(plan && plan.weeks) ? plan.weeks : []

  if (weeks.length !== goal.weeks) add('weeks', `has ${weeks.length} weeks; the goal is ${goal.weeks} weeks`)

  // Gathered while walking the plan, for the checks across days and weeks
  const setsByMuscleDay = new Map() // muscleId -> Map(absolute day -> weighted sets)
  const topWeights = new Map() // exerciseId -> Map(week index -> {amount, unit, path})

  weeks.forEach((week, weekIndex) => {
    const weekPath = `weeks[${weekIndex}]`
    if (week.week !== weekIndex + 1) add(`${weekPath}.week`, `should be ${weekIndex + 1}`)
    const days = Array.isArray(week.days) ? week.days : []
    if (days.length > profile.daysPerWeek) add(`${weekPath}.days`, `has ${days.length} training days; at most ${profile.daysPerWeek}`)
    const seenDays = new Set()
    const weekExercises = new Set()

    days.forEach((day, dayIndex) => {
      const dayPath = `${weekPath}.days[${dayIndex}]`
      if (!Number.isInteger(day.dayOfWeek) || day.dayOfWeek < 1 || day.dayOfWeek > 7) {
        add(`${dayPath}.dayOfWeek`, 'must be 1 (Monday) to 7 (Sunday)')
      } else if (seenDays.has(day.dayOfWeek)) {
        add(`${dayPath}.dayOfWeek`, `day ${day.dayOfWeek} is already in this week`)
      }
      seenDays.add(day.dayOfWeek)
      const absoluteDay = weekIndex * 7 + day.dayOfWeek
      const items = Array.isArray(day.exercises) ? day.exercises : []
      if (!items.length) add(`${dayPath}.exercises`, 'a training day needs at least one exercise')

      let totalSets = 0
      items.forEach((item, itemIndex) => {
        const path = `${dayPath}.exercises[${itemIndex}]`
        const exercise = exercisesById.get(String(item.exerciseId))
        if (!exercise) {
          add(`${path}.exerciseId`, `${item.exerciseId} isn't an exercise in the context`)
          return
        }
        if (avoid.has(exercise.id)) add(`${path}.exerciseId`, `${exercise.name} is on the no-go list`)
        weekExercises.add(exercise.id)

        if (!Number.isInteger(item.sets) || item.sets < LIMITS.minSets || item.sets > LIMITS.maxSets) {
          add(`${path}.sets`, `must be a whole number from ${LIMITS.minSets} to ${LIMITS.maxSets}`)
        }
        if (!Number.isInteger(item.reps) || item.reps < LIMITS.minReps || item.reps > LIMITS.maxReps) {
          add(`${path}.reps`, `must be a whole number from ${LIMITS.minReps} to ${LIMITS.maxReps}`)
        }
        const sets = Number.isInteger(item.sets) ? item.sets : 0
        totalSets += sets

        checkWeight(item, exercise, profile, path, add)
        if (item.weight && exercise.loadedEquipment) {
          if (!topWeights.has(exercise.id)) topWeights.set(exercise.id, new Map())
          const tops = topWeights.get(exercise.id)
          const top = tops.get(weekIndex)
          if (!top || item.weight.amount > top.amount) tops.set(weekIndex, { ...item.weight, path: `${path}.weight` })
        }

        exercise.muscles.forEach(({ muscleId, share }) => {
          if (!setsByMuscleDay.has(muscleId)) setsByMuscleDay.set(muscleId, new Map())
          const byDay = setsByMuscleDay.get(muscleId)
          byDay.set(absoluteDay, (byDay.get(absoluteDay) || 0) + sets * share / 100)
        })
      })

      const minutes = LIMITS.warmUpMinutes + totalSets * LIMITS.minutesPerSet
      if (minutes > profile.sessionMinutes) {
        add(`${dayPath}.exercises`, `${totalSets} sets take about ${formatAmount(minutes)} minutes; the session is ${profile.sessionMinutes}`)
      }
    })

    ;(profile.mustInclude || []).map(String).forEach(id => {
      if (!weekExercises.has(id)) {
        const exercise = exercisesById.get(id)
        add(`${weekPath}.days`, `must include ${exercise ? exercise.name : id} every week`)
      }
    })
  })

  checkVolume(setsByMuscleDay, context, add)
  checkRecovery(setsByMuscleDay, context, add)
  checkJumps(topWeights, exercisesById, profile, add)
  checkGoalReached(weeks, goal, exercisesById, profile, add)
  return errors
}

const checkWeight = (item, exercise, profile, path, add) => {
  const equipmentId = exercise.loadedEquipment
  if (!equipmentId) {
    if (item.equipmentId !== null) add(`${path}.equipmentId`, `${exercise.name} has no loaded equipment; use null`)
    if (item.weight !== null) add(`${path}.weight`, `${exercise.name} takes no weight; use null`)
    return
  }
  if (item.equipmentId !== equipmentId) add(`${path}.equipmentId`, `should be ${equipmentId}`)
  const equipment = profile.equipment[equipmentId]
  if (!item.weight) {
    add(`${path}.weight`, `${exercise.name} needs a weight on the ${equipmentId}`)
    return
  }
  if (!canMake(item.weight, equipment)) {
    const nearest = roundToEquipment(item.weight, equipment)
    add(`${path}.weight`, `the ${equipmentId} can't make ${weightText(item.weight)} ` +
      `(${equipment.unit}, from ${equipment.min} in steps of ${equipment.step}${equipment.max !== undefined ? ` up to ${equipment.max}` : ''}); ` +
      `nearest is ${weightText(nearest)}`)
  }
}

const muscleNames = context => {
  const names = new Map(context.musclePriority.map(row => [row.muscleId, row.name]))
  context.exercises.forEach(exercise => exercise.muscles.forEach(({ muscleId, name }) => names.set(muscleId, name)))
  return names
}

const checkVolume = (setsByMuscleDay, context, add) => {
  const names = muscleNames(context)
  for (const [muscleId, byDay] of setsByMuscleDay) {
    for (let week = 0; week < context.goal.weeks; week++) {
      const total = [...byDay].filter(([day]) => day > week * 7 && day <= (week + 1) * 7).reduce((sum, [, sets]) => sum + sets, 0)
      if (total > LIMITS.maxWeeklySets + 1e-6) {
        add(`weeks[${week}]`, `${names.get(muscleId) || muscleId} gets ${formatAmount(total)} weighted sets; at most ${LIMITS.maxWeeklySets} a week`)
      }
    }
  }
}

const checkRecovery = (setsByMuscleDay, context, add) => {
  const names = muscleNames(context)
  for (const [muscleId, byDay] of setsByMuscleDay) {
    const hardDays = [...byDay].filter(([, sets]) => sets >= LIMITS.hardDaySets).map(([day]) => day).sort((first, second) => first - second)
    for (let index = 1; index < hardDays.length; index++) {
      if (hardDays[index] - hardDays[index - 1] < LIMITS.minDaysBetweenHardDays) {
        const day = hardDays[index]
        const week = Math.ceil(day / 7) - 1
        add(`weeks[${week}]`, `${names.get(muscleId) || muscleId} is worked hard (${LIMITS.hardDaySets}+ weighted sets) on two days in a row ` +
          `(day ${day - week * 7}); leave a day between`)
      }
    }
  }
}

const allowedJump = (from, equipment) => Math.max(from * (1 + LIMITS.maxJump), from + equipment.step)

const checkJumps = (topWeights, exercisesById, profile, add) => {
  for (const [exerciseId, tops] of topWeights) {
    const exercise = exercisesById.get(exerciseId)
    const equipment = profile.equipment[exercise.loadedEquipment]
    const weekIndexes = [...tops.keys()].sort((first, second) => first - second)
    // From the last session logged into the plan's first week with this exercise
    let previous = exercise.last && exercise.last.weight
      ? { amount: convertWeight(exercise.last.weight.amount, exercise.last.weight.unit, equipment.unit), label: 'the last session' }
      : null
    weekIndexes.forEach(weekIndex => {
      const top = tops.get(weekIndex)
      if (top.unit !== equipment.unit) return // already an error from checkWeight
      if (previous && top.amount > allowedJump(previous.amount, equipment) + 1e-6) {
        add(top.path, `${exercise.name} jumps from ${formatAmount(previous.amount)} to ${weightText(top)} after ${previous.label}; ` +
          `at most ${formatAmount(allowedJump(previous.amount, equipment))} ${equipment.unit}`)
      }
      previous = { amount: top.amount, label: `week ${weekIndex + 1}` }
    })
  }
}

const checkGoalReached = (weeks, goal, exercisesById, profile, add) => {
  if (weeks.length !== goal.weeks) return
  const exercise = exercisesById.get(goal.exerciseId)
  if (!exercise) return
  const lastIndex = weeks.length - 1
  const items = (weeks[lastIndex].days || []).flatMap(day => day.exercises || []).filter(item => String(item.exerciseId) === goal.exerciseId)
  const equipment = exercise.loadedEquipment ? profile.equipment[exercise.loadedEquipment] : null
  const target = equipment ? roundToEquipment(goal.weight, equipment) : null
  const reached = items.some(item => item.reps >= goal.reps &&
    (!target || (item.weight && item.weight.unit === target.unit && item.weight.amount >= target.amount - 1e-6)))
  if (!reached) {
    add(`weeks[${lastIndex}]`, `the last week must test the goal: ${exercise.name} for ${goal.reps} reps` +
      (target ? ` at ${weightText(target)} or more` : ''))
  }
}

/**
 * Errors as the list handed back to the model in the fix round: one line each, the field first.
 * @param {PlanError[]} errors
 * @returns {string}
 */
export const formatErrors = errors => errors.map(({ path, message }) => `- ${path || 'plan'}: ${message}`).join('\n')
