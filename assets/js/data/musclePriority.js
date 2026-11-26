import { localDate } from './localDate.js'

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const RECOVERY_DAYS = 3 // a muscle is considered recovered 72 hours after it was last worked
const WEEKLY_SET_TARGET = 10 // weighted sets per muscle per week (a common guideline for growth is 10-20)
const WORKED_DAY_SETS = 1 // weighted sets on a day for the muscle to count as worked that day (recovery, days since)

/**
 * A 'YYYY-MM-DD' date as a whole day number, so two dates are compared as calendar days, never as moments: a
 * workout's date has no time of day, and new Date('YYYY-MM-DD') is midnight UTC, which in the evening west of UTC
 * is already more than a day before the local "now" (21:30 in Toronto counted yesterday's workout as 2 days ago).
 * @param date
 */
const dayNumber = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY
}

/**
 * Rank muscles by how much they need attention right now, from a real read of the database: every muscle (including
 * ones never worked at all), and every workout row with the muscles its exercise works.
 *
 * Work is counted in weighted sets: a workout row's sets times the muscle's share of the exercise (rank / 100), so 3
 * sets of bench press give the mid and lower chest 3 and the front deltoid 1.5. A muscle counts as worked on a day
 * with at least WORKED_DAY_SETS weighted sets. It needs priority when it has recovered (RECOVERY_DAYS since it was
 * last worked, or never worked) and is still short of the weekly target in the last 7 days. Muscles needing priority
 * sort first, the biggest shortfall first, then the longest since worked.
 *
 * A muscle split into regions (Pectorals: upper chest, mid and lower chest) is ranked by its regions, since exercises
 * link to those: the muscle itself isn't listed, and each region's name starts with the muscle's (`group` is the
 * muscle's name, for grouping).
 * @param muscles - every row from `read muscles`
 * @param workoutsWithMuscles - workout rows, each with `sets` (a row without it counts as 1 set) and a `.muscles`
 * array: each muscle's `_id` and `rank` (0-100; a muscle without a rank counts as 100)
 * @param today - injectable for testing; defaults to the real current time (only its local date counts). Workouts
 * dated after it are ignored
 * @param {{weeklyTarget: number}} [options] - weeklyTarget: weighted sets per muscle per week (default 10)
 */
export const musclePriority = (muscles = [], workoutsWithMuscles = [], today = new Date(), { weeklyTarget = WEEKLY_SET_TARGET } = {}) => {
  const stats = {}
  const parentIds = new Set(muscles.filter(muscle => muscle.parent_id).map(muscle => String(muscle.parent_id)))
  const byId = new Map(muscles.map(muscle => [String(muscle._id), muscle]))
  muscles.forEach(muscle => {
    if (parentIds.has(String(muscle._id))) return
    stats[muscle._id] = { muscle, setsByDay: new Map() }
  })

  const todayNumber = dayNumber(localDate(today))
  const weekAgo = todayNumber - 7

  workoutsWithMuscles.forEach(workout => {
    const workoutDate = dayNumber(workout.date)
    // A workout dated after "today" (logged ahead, or a past "today" passed in) hasn't happened yet as of today:
    // counting it gave a negative daysSinceLastWorked and counted it as this week
    if (workoutDate > todayNumber) {
      return
    }
    const sets = workout.sets ?? 1
    ;(workout.muscles || []).forEach(muscle => {
      const stat = stats[muscle._id]
      if (!stat) {
        return
      }
      const weighted = sets * (muscle.rank ?? 100) / 100
      stat.setsByDay.set(workoutDate, (stat.setsByDay.get(workoutDate) || 0) + weighted)
    })
  })

  return Object.values(stats)
    .map(({ muscle, setsByDay }) => {
      const workedDays = [...setsByDay].filter(([, sets]) => sets >= WORKED_DAY_SETS).map(([day]) => day)
      const lastWorkedDate = workedDays.length ? Math.max(...workedDays) : null
      const daysSinceLastWorked = lastWorkedDate !== null
        ? todayNumber - lastWorkedDate
        : Infinity
      const weeklySets = [...setsByDay].filter(([day]) => day >= weekAgo).reduce((total, [, sets]) => total + sets, 0)
      const parent = muscle.parent_id ? byId.get(String(muscle.parent_id)) : null
      return {
        muscleId: muscle._id,
        name: parent ? `${parent.name}: ${muscle.name}` : muscle.name,
        group: parent ? parent.name : muscle.name,
        daysSinceLastWorked,
        timesWorkedThisWeek: workedDays.filter(day => day >= weekAgo).length,
        weeklySets: Math.round(weeklySets * 10) / 10,
        weeklyTarget,
        needsPriority: daysSinceLastWorked >= RECOVERY_DAYS && weeklySets < weeklyTarget
      }
    })
    .sort((first, second) => {
      if (first.needsPriority !== second.needsPriority) {
        return first.needsPriority ? -1 : 1
      }
      if (first.weeklySets !== second.weeklySets) {
        return first.weeklySets - second.weeklySets
      }
      return second.daysSinceLastWorked - first.daysSinceLastWorked
    })
}
