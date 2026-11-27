/**
 * What a plan is built from, gathered by code (never by the model): the exercises this gym's equipment allows, each
 * with the muscles it works, its last session and an estimated one-rep max, plus the goal, the gym profile and the
 * muscles that need attention now, and the schedule of weeks (planSchedule.js). The same context goes to the model
 * and to the checks. LJS-2, 2026-11-26.
 * @module planContext
 */

import { convertWeight, workoutWeight } from '../data/units.js'
import { localDate } from '../data/localDate.js'
import { musclePriority } from '../data/musclePriority.js'
import { loadFor } from './gymProfile.js'
import { buildSchedule } from './planSchedule.js'

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const HISTORY_DAYS = 90 // the estimated max comes from the last 90 days of a lift

/**
 * A one-rep max estimated from a set (Epley): weight x (1 + reps / 30); one rep is the weight itself.
 * @param {number} amount
 * @param {number} reps
 * @returns {number}
 */
export const estimateMax = (amount, reps) => reps <= 1 ? amount : amount * (1 + reps / 30)

const round1 = amount => Math.round(amount * 10) / 10

/**
 * Every row a plan's context needs, read whole (joined in code, as reads.js does).
 * @param {Function} query - json-fs-query's
 * @returns {Promise<PlanRows>}
 */
export const readPlanRows = async query => {
  const [[muscles], [exercises], [exerciseMuscle], [exerciseEquipment], [workouts]] = await Promise.all([
    query('read muscles'),
    query('read exercises'),
    query('read exercise_muscle'),
    query('read exercise_equipment'),
    query('read workouts')
  ])
  return { muscles, exercises, exerciseMuscle, exerciseEquipment, workouts }
}

/**
 * @typedef {Object} PlanRows
 * @property {Object[]} muscles
 * @property {Object[]} exercises
 * @property {Object[]} exerciseMuscle
 * @property {Object[]} exerciseEquipment
 * @property {Object[]} workouts
 */

const groupBy = (rows, field) => {
  const groups = new Map()
  rows.forEach(row => {
    const key = String(row[field])
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  })
  return groups
}

/**
 * The context for one plan.
 * @param {Object} options
 * @param {Goal} options.goal
 * @param {GymProfile} options.profile
 * @param {PlanRows} options.rows
 * @param {Date} [options.today] - injectable for testing; only its local date counts
 * @returns {PlanContext}
 */
export const buildPlanContext = ({ goal, profile, rows, today = new Date() }) => {
  const todayText = localDate(today)
  const historyStart = localDate(new Date(today.getTime() - HISTORY_DAYS * MILLISECONDS_PER_DAY))
  const musclesById = new Map(rows.muscles.map(muscle => [String(muscle._id), muscle]))
  const muscleName = id => {
    const muscle = musclesById.get(id)
    if (!muscle) return id
    const parent = muscle.parent_id ? musclesById.get(String(muscle.parent_id)) : null
    return parent ? `${parent.name}: ${muscle.name}` : muscle.name
  }
  // A muscle's group is its parent (Pectorals for upper chest), or itself when it has none
  const muscleGroup = id => {
    const muscle = musclesById.get(id)
    return muscle && muscle.parent_id ? String(muscle.parent_id) : id
  }
  const linksByExercise = groupBy(rows.exerciseMuscle, 'exercise_id')
  const equipmentByExercise = groupBy(rows.exerciseEquipment, 'exercise_id')
  const workoutsByExercise = groupBy(rows.workouts.filter(workout => workout.date <= todayText), 'exercise_id')
  const avoid = new Set((profile.avoid || []).map(String))

  const exercises = rows.exercises
    .map(row => {
      const id = String(row._id)
      const equipment = (equipmentByExercise.get(id) || []).map(link => String(link.equipment_id))
      const workouts = (workoutsByExercise.get(id) || []).sort((first, second) => second.date.localeCompare(first.date))
      const last = workouts[0]
      const lastWeight = last ? workoutWeight(last) : null
      const maxes = workouts
        .filter(workout => workout.date >= historyStart)
        .map(workout => ({ weight: workoutWeight(workout), reps: workout.reps }))
        .filter(({ weight, reps }) => weight && reps)
        .map(({ weight, reps }) => estimateMax(convertWeight(weight.amount, weight.unit, profile.unit), reps))
      const loaded = loadFor(profile, id, equipment)
      return {
        id,
        name: row.name,
        equipment,
        loadedEquipment: loaded ? loaded.equipmentId : null,
        load: loaded ? loaded.load : null,
        muscles: (linksByExercise.get(id) || [])
          .map(link => {
            const muscleId = String(link.muscle_id)
            return { muscleId, groupId: muscleGroup(muscleId), name: muscleName(muscleId), share: link.muscle_rank ?? 100 }
          })
          .sort((first, second) => second.share - first.share),
        last: last
          ? { date: last.date, sets: last.sets ?? null, reps: last.reps ?? null, weight: lastWeight }
          : null,
        estimatedMax: maxes.length ? { amount: round1(Math.max(...maxes)), unit: profile.unit } : null
      }
    })
    // Only what this gym can do: every piece of equipment the exercise needs is there, and it isn't a no-go
    .filter(exercise => !avoid.has(exercise.id) && exercise.equipment.every(equipmentId => profile.equipment[equipmentId]))
    .sort((first, second) => first.name.localeCompare(second.name))

  const goalExercise = exercises.find(exercise => exercise.id === String(goal.exerciseId)) ?? null

  const linksForPriority = new Map([...linksByExercise].map(([id, links]) => [id, links.map(link => ({ _id: String(link.muscle_id), rank: link.muscle_rank }))]))
  const priority = musclePriority(
    rows.muscles,
    rows.workouts.map(workout => ({ ...workout, muscles: linksForPriority.get(String(workout.exercise_id)) || [] })),
    today
  )

  return {
    today: todayText,
    goal: {
      ...goal,
      exerciseId: String(goal.exerciseId),
      name: goalExercise ? goalExercise.name : null,
      estimatedMax: goalExercise ? goalExercise.estimatedMax : null,
      targetMax: { amount: round1(estimateMax(convertWeight(goal.weight.amount, goal.weight.unit, profile.unit), goal.reps)), unit: profile.unit }
    },
    profile,
    schedule: buildSchedule({ weeks: goal.weeks, profile, today, startDate: goal.startDate }),
    exercises,
    musclePriority: priority.map(({ muscleId, name, weeklySets, daysSinceLastWorked, needsPriority }) => ({
      muscleId: String(muscleId), name, weeklySets, daysSinceLastWorked: Number.isFinite(daysSinceLastWorked) ? daysSinceLastWorked : null, needsPriority
    }))
  }
}

/**
 * @typedef {Object} ContextExercise
 * @property {string} id
 * @property {string} name
 * @property {string[]} equipment - equipment ids it needs, all in the gym
 * @property {(string|null)} loadedEquipment - the one that takes the weight, or null
 * @property {(Equipment|null)} load - the weights it can be set to: its own machine's (gymProfile machines) or its
 * equipment's; null for a bodyweight exercise
 * @property {Array<{muscleId: string, groupId: string, name: string, share: number}>} muscles - share of the work,
 * 0-100; groupId is the muscle's group (its parent, or itself)
 * @property {({date: string, sets: (number|null), reps: (number|null), weight: ({amount: number, unit: string}|null)}|null)} last
 * @property {({amount: number, unit: string}|null)} estimatedMax - in the profile's unit
 */

/**
 * @typedef {Object} PlanContext
 * @property {string} today - 'YYYY-MM-DD'
 * @property {Object} goal - the goal with its exercise's name, its estimated max now and the max the target implies
 * @property {GymProfile} profile
 * @property {ScheduleWeek[]} schedule - each week's start, phase and kind (build, lighter, taper, test)
 * @property {ContextExercise[]} exercises
 * @property {Array<Object>} musclePriority
 */
