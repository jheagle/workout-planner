const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const RECOVERY_DAYS = 3 // a muscle is considered recovered 72 hours after it was last worked
const TARGET_TIMES_PER_WEEK = 2 // strength goal: work each muscle at least this many distinct days per week

/**
 * Rank muscles by how much they need attention right now, from a real read of the database:
 * every muscle (including ones never worked at all), and every workout row with its muscles
 * already joined on (see workout()/musclePriority.test.js for the exact query shape this expects).
 * A muscle needs priority once it's past its recovery window, or hasn't been worked often enough
 * this week yet - whichever muscle has gone longest without being worked sorts first.
 * @param muscles - every row from `read muscles`
 * @param workoutsWithMuscles - every row from the workouts-joined-to-muscles query, each carrying
 * a `.muscles` array (the muscles that workout's exercise worked)
 * @param today - injectable for testing; defaults to the real current time
 */
export const musclePriority = (muscles = [], workoutsWithMuscles = [], today = new Date()) => {
  const stats = {}
  muscles.forEach(muscle => {
    stats[muscle._id] = { muscle, lastWorkedDate: null, datesThisWeek: new Set() }
  })

  const weekAgo = new Date(today.getTime() - 7 * MILLISECONDS_PER_DAY)

  workoutsWithMuscles.forEach(workout => {
    const workoutDate = new Date(workout.date)
    ;(workout.muscles || []).forEach(muscle => {
      const stat = stats[muscle._id]
      if (!stat) {
        return
      }
      if (!stat.lastWorkedDate || workoutDate > stat.lastWorkedDate) {
        stat.lastWorkedDate = workoutDate
      }
      if (workoutDate >= weekAgo) {
        stat.datesThisWeek.add(workout.date)
      }
    })
  })

  return Object.values(stats)
    .map(({ muscle, lastWorkedDate, datesThisWeek }) => {
      const daysSinceLastWorked = lastWorkedDate
        ? Math.floor((today.getTime() - lastWorkedDate.getTime()) / MILLISECONDS_PER_DAY)
        : Infinity
      const timesWorkedThisWeek = datesThisWeek.size
      return {
        muscleId: muscle._id,
        name: muscle.name,
        daysSinceLastWorked,
        timesWorkedThisWeek,
        needsPriority: daysSinceLastWorked >= RECOVERY_DAYS || timesWorkedThisWeek < TARGET_TIMES_PER_WEEK
      }
    })
    .sort((first, second) => {
      if (first.needsPriority !== second.needsPriority) {
        return first.needsPriority ? -1 : 1
      }
      return second.daysSinceLastWorked - first.daysSinceLastWorked
    })
}
