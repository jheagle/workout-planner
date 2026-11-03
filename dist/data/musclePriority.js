"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.musclePriority = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.for-each.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.set.add-all.js");
require("core-js/modules/esnext.set.delete-all.js");
require("core-js/modules/esnext.set.difference.js");
require("core-js/modules/esnext.set.every.js");
require("core-js/modules/esnext.set.filter.js");
require("core-js/modules/esnext.set.find.js");
require("core-js/modules/esnext.set.intersection.js");
require("core-js/modules/esnext.set.is-disjoint-from.js");
require("core-js/modules/esnext.set.is-subset-of.js");
require("core-js/modules/esnext.set.is-superset-of.js");
require("core-js/modules/esnext.set.join.js");
require("core-js/modules/esnext.set.map.js");
require("core-js/modules/esnext.set.reduce.js");
require("core-js/modules/esnext.set.some.js");
require("core-js/modules/esnext.set.symmetric-difference.js");
require("core-js/modules/esnext.set.union.js");
var _localDate = require("./localDate.js");
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const RECOVERY_DAYS = 3; // a muscle is considered recovered 72 hours after it was last worked
const TARGET_TIMES_PER_WEEK = 2; // strength goal: work each muscle at least this many distinct days per week

/**
 * A 'YYYY-MM-DD' date as a whole day number, so two dates are compared as calendar days, never as moments: a
 * workout's date has no time of day, and new Date('YYYY-MM-DD') is midnight UTC, which in the evening west of UTC
 * is already more than a day before the local "now" (21:30 in Toronto counted yesterday's workout as 2 days ago).
 * @param date
 */
const dayNumber = date => {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY;
};

/**
 * Rank muscles by how much they need attention right now, from a real read of the database:
 * every muscle (including ones never worked at all), and every workout row with its muscles
 * already joined on (see workout()/musclePriority.test.js for the exact query shape this expects).
 * A muscle needs priority once it's past its recovery window, or hasn't been worked often enough
 * this week yet - whichever muscle has gone longest without being worked sorts first.
 * @param muscles - every row from `read muscles`
 * @param workoutsWithMuscles - every row from the workouts-joined-to-muscles query, each carrying
 * a `.muscles` array (the muscles that workout's exercise worked)
 * @param today - injectable for testing; defaults to the real current time (only its local date counts)
 */
const musclePriority = (muscles = [], workoutsWithMuscles = [], today = new Date()) => {
  const stats = {};
  muscles.forEach(muscle => {
    stats[muscle._id] = {
      muscle,
      lastWorkedDate: null,
      datesThisWeek: new Set()
    };
  });
  const todayNumber = dayNumber((0, _localDate.localDate)(today));
  const weekAgo = todayNumber - 7;
  workoutsWithMuscles.forEach(workout => {
    const workoutDate = dayNumber(workout.date);
    (workout.muscles || []).forEach(muscle => {
      const stat = stats[muscle._id];
      if (!stat) {
        return;
      }
      if (stat.lastWorkedDate === null || workoutDate > stat.lastWorkedDate) {
        stat.lastWorkedDate = workoutDate;
      }
      if (workoutDate >= weekAgo) {
        stat.datesThisWeek.add(workout.date);
      }
    });
  });
  return Object.values(stats).map(({
    muscle,
    lastWorkedDate,
    datesThisWeek
  }) => {
    const daysSinceLastWorked = lastWorkedDate !== null ? todayNumber - lastWorkedDate : Infinity;
    const timesWorkedThisWeek = datesThisWeek.size;
    return {
      muscleId: muscle._id,
      name: muscle.name,
      daysSinceLastWorked,
      timesWorkedThisWeek,
      needsPriority: daysSinceLastWorked >= RECOVERY_DAYS || timesWorkedThisWeek < TARGET_TIMES_PER_WEEK
    };
  }).sort((first, second) => {
    if (first.needsPriority !== second.needsPriority) {
      return first.needsPriority ? -1 : 1;
    }
    return second.daysSinceLastWorked - first.daysSinceLastWorked;
  });
};
exports.musclePriority = musclePriority;