/**
 * The code that checks a plan: the model proposes, these decide. Every error names the exact field
 * (`weeks[1].days[0].exercises[2].weight`) and what's wrong with it, so one fix round can hand the model the list,
 * and the evals grade plans by the same checks. LJS-2, 2026-11-26.
 *
 * How it reads: `checkPlan` lays the plan out flat once (every day and every exercise with its path), then runs
 * the rules in `PLAN_RULES`, one small function per rule, and collects their errors. To add a rule, write a function
 * and list it there. The limits are starting points, kept in `LIMITS` to tune from real plans.
 * @module planChecks
 */

import { convertWeight, formatAmount } from '../data/units.js'
import { canMake, roundToEquipment } from './gymProfile.js'
import { PHASE_PACE, parseDate, reachableMax } from './planSchedule.js'

export const LIMITS = {
  minWeeks: 4,
  maxWeeks: 12,
  maxGoalReps: 20,
  minSets: 1,
  maxSets: 8,
  minReps: 1,
  maxReps: 30,
  minutesPerSet: 2.5, // one set with its rest
  warmUpMinutes: 10,
  maxWeeklySets: 20, // weighted sets per muscle per week (10-20 is the common range for growth)
  hardDaySets: 3, // weighted sets on a day that make it a hard day for that muscle
  workedDaySets: 1, // weighted sets on a day that count as working a muscle group that day
  minDaysBetweenHardDays: 2, // no muscle hard on two days in a row
  lighterSetsShare: 0.6, // a lighter week has at most 60% of the sets of the build week before it
  taperSetsShare: 0.7, // the taper week has at most 70%
  multiSetRepShare: 0.85 // with 2+ sets of a bodyweight exercise, each set's reps are at most 85% of the person's max
  // How fast weights may climb depends on the phase: PHASE_PACE in planSchedule.js
}

/**
 * The muscle groups (database/muscles ids) each kind of other training uses: on its day and the day before, none is
 * worked hard, so a run starts on recovered legs. Calves, glutes, hamstrings and quadriceps.
 */
export const ACTIVITY_MUSCLE_GROUPS = {
  run: ['3', '7', '8', '12'],
  bike: ['7', '8', '12']
}

const WEEKDAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/**
 * @typedef {Object} PlanError
 * @property {string} path - the field, e.g. 'weeks[1].days[0].exercises[2].weight'; '' for the plan as a whole
 * @property {string} message
 */

// Weights compare with a little room for floating point (2.5 kg steps)
const EPSILON = 1e-6

const error = (path, message) => ({ path, message })
const weightText = weight => `${formatAmount(weight.amount)} ${weight.unit}`
const isWholeIn = (value, min, max) => Number.isInteger(value) && value >= min && value <= max

// 'all bulk', or '2 maintain, 4 cut': the phases a goal's weeks fall in
const phaseText = schedule => {
  const counts = new Map()
  schedule.forEach(({ phase }) => counts.set(phase, (counts.get(phase) || 0) + 1))
  return counts.size === 1 ? `all ${[...counts.keys()][0]}` : [...counts].map(([phase, count]) => `${count} ${phase}`).join(', ')
}

/* ------------------------------------------------------------------------------------------------------------------
 * The goal
 * ---------------------------------------------------------------------------------------------------------------- */

/**
 * Whether a goal can be planned for: its exercise is one this gym allows, and it's a strength goal v1 handles in a
 * realistic time.
 * @param {Goal} goal
 * @param {PlanContext} context
 * @returns {PlanError[]}
 */
export const checkGoal = (goal, context) => {
  const errors = []
  const exercise = context.exercises.find(row => row.id === String(goal.exerciseId))
  if (!exercise) {
    errors.push(error('goal.exerciseId', `exercise ${goal.exerciseId} isn't one this gym's equipment allows`))
  }
  if (!isWholeIn(goal.weeks, LIMITS.minWeeks, LIMITS.maxWeeks)) {
    errors.push(error('goal.weeks', `must be a whole number of weeks from ${LIMITS.minWeeks} to ${LIMITS.maxWeeks}`))
  }
  if (!isWholeIn(goal.reps, 1, LIMITS.maxGoalReps)) {
    errors.push(error('goal.reps', `must be a whole number from 1 to ${LIMITS.maxGoalReps}`))
  }
  if (!goal.weight || !(goal.weight.amount > 0) || !['kg', 'lbs'].includes(goal.weight.unit)) {
    errors.push(error('goal.weight', 'must be a weight above 0, in kg or lbs'))
  }
  if (goal.startDate !== undefined && goal.startDate !== null) {
    if (!parseDate(goal.startDate)) errors.push(error('goal.startDate', 'must be a date as YYYY-MM-DD'))
    else if (goal.startDate < context.today) errors.push(error('goal.startDate', `${goal.startDate} is in the past; today is ${context.today}`))
  }
  // Pace is judged only for a well-formed goal on a lift with history to estimate from
  if (errors.length || !exercise.estimatedMax) return errors

  const now = exercise.estimatedMax.amount
  const needed = context.goal.targetMax.amount
  const reachable = reachableMax(now, context.schedule)
  if (needed > reachable) {
    errors.push(error('goal', `${goal.reps} x ${weightText(goal.weight)} needs a max of about ${formatAmount(needed)} ${context.profile.unit}; ` +
      `the estimate now is ${formatAmount(now)}, and ${goal.weeks} weeks (${phaseText(context.schedule)}) can realistically reach about ${formatAmount(reachable)}`))
  }
  return errors
}

/* ------------------------------------------------------------------------------------------------------------------
 * The plan laid out flat
 * ---------------------------------------------------------------------------------------------------------------- */

/**
 * @typedef {Object} PlanLayout
 * @property {Object[]} weeks - the plan's weeks (none when it has none)
 * @property {Array<{path: string, weekIndex: number, day: Object, dayNumber: number}>} days - dayNumber counts
 * from the plan's first Monday (week 2's Monday is 8), so rest between days is a subtraction
 * @property {Array<{path: string, weekIndex: number, dayNumber: number, item: Object, exercise: (Object|undefined)}>} items -
 * every exercise in the plan, with its exercise from the context (undefined when the id isn't one)
 */

/**
 * The plan as flat lists, each entry with its path, so every rule is a simple loop.
 * @param {Plan} plan
 * @param {PlanContext} context
 * @returns {PlanLayout}
 */
const layOut = (plan, context) => {
  const exercisesById = new Map(context.exercises.map(exercise => [exercise.id, exercise]))
  const weeks = Array.isArray(plan && plan.weeks) ? plan.weeks : []
  const days = weeks.flatMap((week, weekIndex) => (Array.isArray(week.days) ? week.days : []).map((day, dayIndex) => ({
    path: `weeks[${weekIndex}].days[${dayIndex}]`,
    weekIndex,
    day,
    dayNumber: weekIndex * 7 + day.dayOfWeek
  })))
  const items = days.flatMap(({ path, weekIndex, day, dayNumber }) => (Array.isArray(day.exercises) ? day.exercises : []).map((item, itemIndex) => ({
    path: `${path}.exercises[${itemIndex}]`,
    weekIndex,
    dayNumber,
    item,
    exercise: exercisesById.get(String(item.exerciseId))
  })))
  return { weeks, days, items }
}

// Most rules only look at exercises the context knows; an unknown one is reported once, by exercisesAreKnown
const known = items => items.filter(({ exercise }) => exercise)

const muscleName = (context, muscleId) => {
  for (const exercise of context.exercises) {
    const muscle = exercise.muscles.find(row => row.muscleId === muscleId)
    if (muscle) return muscle.name
  }
  return muscleId
}

/**
 * Weighted sets per muscle per day: each exercise's sets times the muscle's share of it (3 sets of bench at 50%
 * triceps is 1.5 for triceps).
 * @returns {Map<string, Map<number, number>>} muscleId -> dayNumber -> weighted sets
 */
const weightedSetsByMuscleAndDay = items => {
  const totals = new Map()
  known(items).forEach(({ dayNumber, item, exercise }) => {
    const sets = Number.isInteger(item.sets) ? item.sets : 0
    exercise.muscles.forEach(({ muscleId, share }) => {
      if (!totals.has(muscleId)) totals.set(muscleId, new Map())
      const byDay = totals.get(muscleId)
      byDay.set(dayNumber, (byDay.get(dayNumber) || 0) + sets * share / 100)
    })
  })
  return totals
}

/**
 * Weighted sets per muscle group per day (a group's muscles added up: upper and lower chest are Pectorals).
 * @returns {Map<string, Map<number, number>>} groupId -> dayNumber -> weighted sets
 */
const weightedSetsByGroupAndDay = items => {
  const totals = new Map()
  known(items).forEach(({ dayNumber, item, exercise }) => {
    const sets = Number.isInteger(item.sets) ? item.sets : 0
    exercise.muscles.forEach(({ groupId, share }) => {
      if (!totals.has(groupId)) totals.set(groupId, new Map())
      const byDay = totals.get(groupId)
      byDay.set(dayNumber, (byDay.get(dayNumber) || 0) + sets * share / 100)
    })
  })
  return totals
}

// 'Pectorals' for the group of 'Pectorals: Upper chest'
const groupName = (context, groupId) => {
  for (const exercise of context.exercises) {
    const muscle = exercise.muscles.find(row => row.groupId === groupId)
    if (muscle) return muscle.name.split(': ')[0]
  }
  return groupId
}

/** All the sets planned in each week, by week index. */
const setsByWeek = (items, weekCount) => {
  const totals = Array(weekCount).fill(0)
  known(items).forEach(({ weekIndex, item }) => {
    if (weekIndex < weekCount && Number.isInteger(item.sets)) totals[weekIndex] += item.sets
  })
  return totals
}

/** The heaviest entry of each loaded lift in each week: exerciseId -> weekIndex -> entry. */
const topWeights = items => {
  const tops = new Map()
  known(items).filter(({ item, exercise }) => exercise.loadedEquipment && item.weight).forEach(entry => {
    if (!tops.has(entry.exercise.id)) tops.set(entry.exercise.id, new Map())
    const byWeek = tops.get(entry.exercise.id)
    const top = byWeek.get(entry.weekIndex)
    if (!top || entry.item.weight.amount > top.item.weight.amount) byWeek.set(entry.weekIndex, entry)
  })
  return tops
}

/** The index of the last build week before this one, or -1. */
const buildWeekBefore = (schedule, weekIndex) => {
  for (let index = weekIndex - 1; index >= 0; index--) {
    if (schedule[index].kind === 'build') return index
  }
  return -1
}

/* ------------------------------------------------------------------------------------------------------------------
 * The rules: each takes (layout, context) and returns its errors
 * ---------------------------------------------------------------------------------------------------------------- */

/** The plan has as many weeks as the goal. */
const weeksMatchGoal = ({ weeks }, { goal }) =>
  weeks.length === goal.weeks ? [] : [error('weeks', `has ${weeks.length} weeks; the goal is ${goal.weeks} weeks`)]

/** Weeks are numbered 1, 2, 3, ... in order. */
const weeksAreNumbered = ({ weeks }) => weeks
  .map((week, index) => week.week === index + 1 ? null : error(`weeks[${index}].week`, `should be ${index + 1}`))
  .filter(Boolean)

/** No week has more training days than the profile allows. */
const daysFitTheWeek = ({ weeks }, { profile }) => weeks
  .map((week, index) => {
    const count = Array.isArray(week.days) ? week.days.length : 0
    return count > profile.daysPerWeek ? error(`weeks[${index}].days`, `has ${count} training days; at most ${profile.daysPerWeek}`) : null
  })
  .filter(Boolean)

/** Each day is a weekday from 1 (Monday) to 7 (Sunday), once per week. */
const weekdaysAreValid = ({ days }) => {
  const seen = new Set()
  return days.flatMap(({ path, weekIndex, day }) => {
    const key = `${weekIndex}:${day.dayOfWeek}`
    if (!isWholeIn(day.dayOfWeek, 1, 7)) return [error(`${path}.dayOfWeek`, 'must be 1 (Monday) to 7 (Sunday)')]
    if (seen.has(key)) return [error(`${path}.dayOfWeek`, `day ${day.dayOfWeek} is already in this week`)]
    seen.add(key)
    return []
  })
}

/** Every training day has at least one exercise. */
const daysHaveExercises = ({ days }) => days
  .filter(({ day }) => !Array.isArray(day.exercises) || !day.exercises.length)
  .map(({ path }) => error(`${path}.exercises`, 'a training day needs at least one exercise'))

/** Every exercise is one from the context (which already leaves out the no-gos), and not on the no-go list. */
const exercisesAreKnown = ({ items }, { profile }) => {
  const avoid = new Set((profile.avoid || []).map(String))
  return items.flatMap(({ path, item, exercise }) => {
    if (!exercise) return [error(`${path}.exerciseId`, `${item.exerciseId} isn't an exercise in the context`)]
    if (avoid.has(exercise.id)) return [error(`${path}.exerciseId`, `${exercise.name} is on the no-go list`)]
    return []
  })
}

/** Sets and reps are whole numbers in range; the profile can narrow the sets (setsPerExercise). */
const setsAndRepsInRange = ({ items }, { profile }) => {
  const { min, max } = profile.setsPerExercise || { min: LIMITS.minSets, max: LIMITS.maxSets }
  return known(items).flatMap(({ path, item }) => [
    isWholeIn(item.sets, min, max) ? null : error(`${path}.sets`, `must be a whole number from ${min} to ${max}`),
    isWholeIn(item.reps, LIMITS.minReps, LIMITS.maxReps) ? null : error(`${path}.reps`, `must be a whole number from ${LIMITS.minReps} to ${LIMITS.maxReps}`)
  ].filter(Boolean))
}

/**
 * A bodyweight exercise with a known rep max (profile.repMaxes) is planned at what the person can do: one set at most
 * the max, and with 2+ sets at most 85% of it (rounded down), since every set has the same reps and the later ones
 * come tired. A max of 12 pull-ups allows 1 x 12 or 2 x 10, not 2 x 12. Past it, the way on is assisted reps (a
 * counterweight machine), not more reps than the person has.
 */
const repsWithinMax = ({ items }, { profile }) => {
  const maxes = profile.repMaxes || {}
  return known(items).flatMap(({ path, item, exercise }) => {
    const max = maxes[exercise.id]
    if (!max || item.weight || !Number.isInteger(item.sets) || !Number.isInteger(item.reps)) return []
    const cap = item.sets > 1 ? Math.floor(max * LIMITS.multiSetRepShare) : max
    if (item.reps <= cap) return []
    return [error(`${path}.reps`, item.sets > 1
      ? `${item.sets} x ${item.reps} ${exercise.name} is more than the person can do (max ${max} in one set); at most ${cap} a set with ${item.sets} sets`
      : `${item.reps} ${exercise.name} is more than the person's max of ${max}`)]
  })
}

/**
 * A loaded exercise names its equipment and has a weight that equipment can make (the error says the nearest it
 * can); a bodyweight exercise has neither.
 */
const weightsFitEquipment = ({ items }) => known(items).flatMap(({ path, item, exercise }) => {
  const equipmentId = exercise.loadedEquipment
  if (!equipmentId) {
    return [
      item.equipmentId === null ? null : error(`${path}.equipmentId`, `${exercise.name} has no loaded equipment; use null`),
      item.weight === null ? null : error(`${path}.weight`, `${exercise.name} takes no weight; use null`)
    ].filter(Boolean)
  }
  const equipment = exercise.load
  const label = equipment.name || equipmentId
  const errors = []
  if (item.equipmentId !== equipmentId) errors.push(error(`${path}.equipmentId`, `should be ${equipmentId}`))
  if (!item.weight) {
    errors.push(error(`${path}.weight`, `${exercise.name} needs a weight on the ${label}`))
  } else if (!canMake(item.weight, equipment)) {
    const range = `${equipment.unit}, from ${equipment.min} in steps of ${equipment.step}${equipment.max !== undefined ? ` up to ${equipment.max}` : ''}`
    errors.push(error(`${path}.weight`, `the ${label} can't make ${weightText(item.weight)} (${range}); ` +
      `nearest is ${weightText(roundToEquipment(item.weight, equipment))}`))
  }
  return errors
})

/** A day's sets fit in the session: a warm-up, then each set with its rest. */
const sessionsFitTheTime = ({ days }, { profile }) => days.flatMap(({ path, day }) => {
  const sets = (day.exercises || []).reduce((total, item) => total + (Number.isInteger(item.sets) ? item.sets : 0), 0)
  const minutes = LIMITS.warmUpMinutes + sets * LIMITS.minutesPerSet
  return minutes > profile.sessionMinutes
    ? [error(`${path}.exercises`, `${sets} sets take about ${formatAmount(minutes)} minutes; the session is ${profile.sessionMinutes}`)]
    : []
})

/** Every must-include exercise is in every week. */
const mustIncludesEveryWeek = ({ weeks, items }, { profile, exercises }) => weeks.flatMap((week, weekIndex) => {
  const inWeek = new Set(known(items).filter(entry => entry.weekIndex === weekIndex).map(({ exercise }) => exercise.id))
  return (profile.mustInclude || []).map(String).filter(id => !inWeek.has(id)).map(id => {
    const exercise = exercises.find(row => row.id === id)
    return error(`weeks[${weekIndex}].days`, `must include ${exercise ? exercise.name : id} every week`)
  })
})

/** No muscle gets more than the weekly limit of weighted sets in any week. */
const weeklySetsPerMuscle = ({ items }, context) => {
  const errors = []
  for (const [muscleId, byDay] of weightedSetsByMuscleAndDay(items)) {
    for (let week = 0; week < context.goal.weeks; week++) {
      const total = [...byDay].filter(([day]) => Math.ceil(day / 7) - 1 === week).reduce((sum, [, sets]) => sum + sets, 0)
      if (total > LIMITS.maxWeeklySets + EPSILON) {
        errors.push(error(`weeks[${week}]`, `${muscleName(context, muscleId)} gets ${formatAmount(total)} weighted sets; at most ${LIMITS.maxWeeklySets} a week`))
      }
    }
  }
  return errors
}

/** A muscle worked hard one day gets the next day off from hard work (also from a Sunday into the next Monday). */
const restBetweenHardDays = ({ items }, context) => {
  const errors = []
  for (const [muscleId, byDay] of weightedSetsByMuscleAndDay(items)) {
    const hardDays = [...byDay].filter(([, sets]) => sets >= LIMITS.hardDaySets).map(([day]) => day).sort((first, second) => first - second)
    hardDays.slice(1).forEach((day, index) => {
      if (day - hardDays[index] >= LIMITS.minDaysBetweenHardDays) return
      const week = Math.ceil(day / 7) - 1
      errors.push(error(`weeks[${week}]`, `${muscleName(context, muscleId)} is worked hard (${LIMITS.hardDaySets}+ weighted sets) on two days in a row ` +
        `(day ${day - week * 7}); leave a day between`))
    })
  }
  return errors
}

/** When the profile names its training days, every day is one of them. */
const daysAreTrainingDays = ({ days }, { profile }) => {
  if (!Array.isArray(profile.trainingDays)) return []
  const allowed = profile.trainingDays.map(day => WEEKDAYS[day]).join(' and ')
  return days
    .filter(({ day }) => isWholeIn(day.dayOfWeek, 1, 7) && !profile.trainingDays.includes(day.dayOfWeek))
    .map(({ path, day }) => error(`${path}.dayOfWeek`, `${WEEKDAYS[day.dayOfWeek]} isn't a training day; train on ${allowed}`))
}

/** When the profile names a first exercise, every session starts with it. */
const sessionsStartRight = ({ days }, { profile, exercises }) => {
  if (!profile.firstExercise) return []
  const first = String(profile.firstExercise)
  const exercise = exercises.find(row => row.id === first)
  return days
    .filter(({ day }) => Array.isArray(day.exercises) && day.exercises.length && String(day.exercises[0].exerciseId) !== first)
    .map(({ path }) => error(`${path}.exercises[0]`, `every session starts with ${exercise ? exercise.name : first}`))
}

/**
 * When the profile asks for it, every muscle group the gym's exercises work gets at least one weighted set on that
 * many days of each week (the test week is left out: it's for the test).
 */
const musclesWorkedEnoughDays = ({ weeks, items }, context) => {
  const days = context.profile.minDaysPerMuscle
  if (!days || weeks.length !== context.schedule.length) return []
  const groups = [...new Set(context.exercises.flatMap(exercise => exercise.muscles.map(({ groupId }) => groupId)))].sort()
  const byGroup = weightedSetsByGroupAndDay(items)
  const errors = []
  context.schedule.forEach(({ kind }, weekIndex) => {
    if (kind === 'test') return
    groups.forEach(groupId => {
      const worked = [...(byGroup.get(groupId) || new Map())]
        .filter(([day, sets]) => Math.ceil(day / 7) - 1 === weekIndex && sets >= LIMITS.workedDaySets - EPSILON).length
      if (worked < days) {
        errors.push(error(`weeks[${weekIndex}]`, `${groupName(context, groupId)} is worked on ${worked} day${worked === 1 ? '' : 's'}; ` +
          `every muscle group needs ${LIMITS.workedDaySets}+ weighted set on ${days} days a week`))
      }
    })
  })
  return errors
}

/**
 * Other training (a run on Wednesday) starts recovered: the muscle groups it uses aren't worked hard that day or the
 * day before.
 */
const otherTrainingRested = ({ weeks, items }, context) => {
  const events = (context.profile.otherTraining || []).filter(({ activity }) => ACTIVITY_MUSCLE_GROUPS[activity])
  if (!events.length) return []
  const byGroup = weightedSetsByGroupAndDay(items)
  const errors = []
  weeks.forEach((week, weekIndex) => events.forEach(({ dayOfWeek, activity }) => {
    const eventDay = weekIndex * 7 + dayOfWeek
    ACTIVITY_MUSCLE_GROUPS[activity].forEach(groupId => {
      const byDay = byGroup.get(groupId)
      if (!byDay) return
      ;[eventDay - 1, eventDay].forEach(day => {
        const sets = byDay.get(day) || 0
        if (sets < LIMITS.hardDaySets) return
        const dayWeek = Math.ceil(day / 7) - 1
        const when = day === eventDay ? 'the same day' : 'the day before'
        errors.push(error(`weeks[${dayWeek}]`, `${groupName(context, groupId)} is worked hard on ${WEEKDAYS[day - dayWeek * 7]} ` +
          `(${formatAmount(sets)} weighted sets), ${when} the ${WEEKDAYS[dayOfWeek]} ${activity}; keep it under ${LIMITS.hardDaySets} then`))
      })
    })
  }))
  return errors
}

/**
 * Each lift's top weight rises at most its phase's jump a week (10% in a bulk, 5% in a cut; or one step of its
 * equipment, when that's more), starting from its last logged session. A lighter week isn't the baseline for the
 * week after it: the climb carries on from the build week before. Dropping is always fine.
 */
const weightsRiseGradually = ({ items }, { schedule }) => {
  const errors = []
  for (const byWeek of topWeights(items).values()) {
    const { exercise } = byWeek.values().next().value
    const equipment = exercise.load
    const last = exercise.last && exercise.last.weight
    let previous = last ? { amount: convertWeight(last.amount, last.unit, equipment.unit), label: 'the last session' } : null
    ;[...byWeek.keys()].sort((first, second) => first - second).forEach(weekIndex => {
      const { path, item } = byWeek.get(weekIndex)
      if (item.weight.unit !== equipment.unit) return // weightsFitEquipment reports it
      const week = schedule[weekIndex]
      const { maxJump } = PHASE_PACE[week ? week.phase : 'maintain']
      const allowed = previous && Math.max(previous.amount * (1 + maxJump), previous.amount + equipment.step)
      if (previous && item.weight.amount > allowed + EPSILON) {
        errors.push(error(`${path}.weight`, `${exercise.name} jumps from ${formatAmount(previous.amount)} to ${weightText(item.weight)} ` +
          `after ${previous.label}; at most ${formatAmount(allowed)} ${equipment.unit}${week ? ` in a ${week.phase} week` : ''}`))
      }
      if (!week || week.kind !== 'lighter') previous = { amount: item.weight.amount, label: `week ${weekIndex + 1}` }
    })
  }
  return errors
}

/**
 * A lighter week has at most 60% of the sets of the build week before it, and no lift heavier than in that week.
 * The taper week has at most 70% of the sets (its weights follow the usual climb).
 */
const lighterWeeksAreLighter = ({ weeks, items }, { schedule }) => {
  if (weeks.length !== schedule.length) return [] // weeksMatchGoal reports it
  const sets = setsByWeek(items, weeks.length)
  const tops = topWeights(items)
  const errors = []
  schedule.forEach(({ kind }, weekIndex) => {
    if (kind !== 'lighter' && kind !== 'taper') return
    const before = buildWeekBefore(schedule, weekIndex)
    if (before < 0) return
    const share = kind === 'lighter' ? LIMITS.lighterSetsShare : LIMITS.taperSetsShare
    const most = Math.floor(sets[before] * share + EPSILON)
    if (sets[weekIndex] > most) {
      errors.push(error(`weeks[${weekIndex}]`, `week ${weekIndex + 1} is a ${kind} week: at most ${most} sets ` +
        `(${Math.round(share * 100)}% of week ${before + 1}'s ${sets[before]}); it has ${sets[weekIndex]}`))
    }
    if (kind !== 'lighter') return
    for (const byWeek of tops.values()) {
      const entry = byWeek.get(weekIndex)
      const build = byWeek.get(before)
      if (entry && build && entry.item.weight.unit === build.item.weight.unit && entry.item.weight.amount > build.item.weight.amount + EPSILON) {
        errors.push(error(`${entry.path}.weight`, `${entry.exercise.name} is heavier than in week ${before + 1} ` +
          `(${weightText(build.item.weight)}); a lighter week keeps it there or below`))
      }
    }
  })
  return errors
}

/** The last week tests the goal: its lift for the goal's reps, at the goal's weight (rounded to the equipment) or more. */
const lastWeekTestsGoal = ({ weeks, items }, { goal, exercises }) => {
  const exercise = exercises.find(row => row.id === goal.exerciseId)
  // A plan of the wrong length is already an error, and an unplannable goal is checkGoal's
  if (weeks.length !== goal.weeks || !exercise) return []
  const lastWeek = weeks.length - 1
  const target = exercise.load ? roundToEquipment(goal.weight, exercise.load) : null
  const heavyEnough = weight => !target || (weight && weight.unit === target.unit && weight.amount >= target.amount - EPSILON)
  const tested = known(items).some(({ weekIndex, item, exercise: planned }) =>
    weekIndex === lastWeek && planned.id === exercise.id && item.reps >= goal.reps && heavyEnough(item.weight))
  return tested
    ? []
    : [error(`weeks[${lastWeek}]`, `the last week must test the goal: ${exercise.name} for ${goal.reps} reps${target ? ` at ${weightText(target)} or more` : ''}`)]
}

/**
 * Every rule a plan must pass, in the order their errors are listed: the plan's shape, then each exercise, then
 * each session and week, then progress over the weeks.
 */
export const PLAN_RULES = [
  weeksMatchGoal,
  weeksAreNumbered,
  daysFitTheWeek,
  weekdaysAreValid,
  daysAreTrainingDays,
  daysHaveExercises,
  sessionsStartRight,
  exercisesAreKnown,
  setsAndRepsInRange,
  repsWithinMax,
  weightsFitEquipment,
  sessionsFitTheTime,
  mustIncludesEveryWeek,
  weeklySetsPerMuscle,
  restBetweenHardDays,
  musclesWorkedEnoughDays,
  otherTrainingRested,
  weightsRiseGradually,
  lighterWeeksAreLighter,
  lastWeekTestsGoal
]

/**
 * Every problem with a plan, or none.
 * @param {Plan} plan
 * @param {PlanContext} context
 * @returns {PlanError[]}
 */
export const checkPlan = (plan, context) => {
  const layout = layOut(plan, context)
  return PLAN_RULES.flatMap(rule => rule(layout, context))
}

/**
 * Errors as the list handed back to the model in the fix round: one line each, the field first.
 * @param {PlanError[]} errors
 * @returns {string}
 */
export const formatErrors = errors => errors.map(({ path, message }) => `- ${path || 'plan'}: ${message}`).join('\n')
