"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.musclePriority = void 0;
require("core-js/modules/es.array.for-each.js");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.array.sort.js");
require("core-js/modules/es.date.to-string.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.object.values.js");
require("core-js/modules/es.set.js");
require("core-js/modules/es.string.iterator.js");
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
require("core-js/modules/web.dom-collections.for-each.js");
require("core-js/modules/web.dom-collections.iterator.js");
var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
var RECOVERY_DAYS = 3; // a muscle is considered recovered 72 hours after it was last worked
var TARGET_TIMES_PER_WEEK = 2; // strength goal: work each muscle at least this many distinct days per week

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
var musclePriority = exports.musclePriority = function musclePriority() {
  var muscles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var workoutsWithMuscles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var today = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();
  var stats = {};
  muscles.forEach(function (muscle) {
    stats[muscle._id] = {
      muscle: muscle,
      lastWorkedDate: null,
      datesThisWeek: new Set()
    };
  });
  var weekAgo = new Date(today.getTime() - 7 * MILLISECONDS_PER_DAY);
  workoutsWithMuscles.forEach(function (workout) {
    var workoutDate = new Date(workout.date);
    (workout.muscles || []).forEach(function (muscle) {
      var stat = stats[muscle._id];
      if (!stat) {
        return;
      }
      if (!stat.lastWorkedDate || workoutDate > stat.lastWorkedDate) {
        stat.lastWorkedDate = workoutDate;
      }
      if (workoutDate >= weekAgo) {
        stat.datesThisWeek.add(workout.date);
      }
    });
  });
  return Object.values(stats).map(function (_ref) {
    var muscle = _ref.muscle,
      lastWorkedDate = _ref.lastWorkedDate,
      datesThisWeek = _ref.datesThisWeek;
    var daysSinceLastWorked = lastWorkedDate ? Math.floor((today.getTime() - lastWorkedDate.getTime()) / MILLISECONDS_PER_DAY) : Infinity;
    var timesWorkedThisWeek = datesThisWeek.size;
    return {
      muscleId: muscle._id,
      name: muscle.name,
      daysSinceLastWorked: daysSinceLastWorked,
      timesWorkedThisWeek: timesWorkedThisWeek,
      needsPriority: daysSinceLastWorked >= RECOVERY_DAYS || timesWorkedThisWeek < TARGET_TIMES_PER_WEEK
    };
  }).sort(function (first, second) {
    if (first.needsPriority !== second.needsPriority) {
      return first.needsPriority ? -1 : 1;
    }
    return second.daysSinceLastWorked - first.daysSinceLastWorked;
  });
};