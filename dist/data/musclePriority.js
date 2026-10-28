"use strict";

require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.symbol.iterator.js");
require("core-js/modules/es.array.from.js");
require("core-js/modules/es.array.slice.js");
require("core-js/modules/es.object.define-property.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.regexp.test.js");
require("core-js/modules/es.regexp.to-string.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.musclePriority = void 0;
require("core-js/modules/es.array.for-each.js");
require("core-js/modules/es.array.is-array.js");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.array.sort.js");
require("core-js/modules/es.date.to-string.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.number.constructor.js");
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
var _localDate = require("./localDate.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
var RECOVERY_DAYS = 3; // a muscle is considered recovered 72 hours after it was last worked
var TARGET_TIMES_PER_WEEK = 2; // strength goal: work each muscle at least this many distinct days per week

/**
 * A 'YYYY-MM-DD' date as a whole day number, so two dates are compared as calendar days, never as moments: a
 * workout's date has no time of day, and new Date('YYYY-MM-DD') is midnight UTC, which in the evening west of UTC
 * is already more than a day before the local "now" (21:30 in Toronto counted yesterday's workout as 2 days ago).
 * @param date
 */
var dayNumber = function dayNumber(date) {
  var _date$split$map = date.split('-').map(Number),
    _date$split$map2 = _slicedToArray(_date$split$map, 3),
    year = _date$split$map2[0],
    month = _date$split$map2[1],
    day = _date$split$map2[2];
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
  var todayNumber = dayNumber((0, _localDate.localDate)(today));
  var weekAgo = todayNumber - 7;
  workoutsWithMuscles.forEach(function (workout) {
    var workoutDate = dayNumber(workout.date);
    (workout.muscles || []).forEach(function (muscle) {
      var stat = stats[muscle._id];
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
  return Object.values(stats).map(function (_ref) {
    var muscle = _ref.muscle,
      lastWorkedDate = _ref.lastWorkedDate,
      datesThisWeek = _ref.datesThisWeek;
    var daysSinceLastWorked = lastWorkedDate !== null ? todayNumber - lastWorkedDate : Infinity;
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