"use strict";

require("core-js/modules/es.symbol.iterator.js");
require("core-js/modules/es.array.from.js");
require("core-js/modules/es.array.is-array.js");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.function.bind.js");
require("core-js/modules/es.object.create.js");
require("core-js/modules/es.object.define-property.js");
require("core-js/modules/es.object.get-prototype-of.js");
require("core-js/modules/es.object.set-prototype-of.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.test.js");
require("core-js/modules/es.regexp.to-string.js");
require("core-js/modules/es.string.iterator.js");
require("core-js/modules/web.dom-collections.iterator.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateWorkout = exports.logWorkout = exports.getMusclePriority = exports.getLastSession = exports.getExercisesForMuscle = exports.addExercise = void 0;
require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.array.concat.js");
require("core-js/modules/es.array.join.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.array.slice.js");
require("core-js/modules/es.date.to-iso-string.js");
require("core-js/modules/es.date.to-string.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _index = require("./index.js");
var _musclePriority = require("./musclePriority.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// These values only ever get interpolated into a query string, never executed as code - stripping
// a stray quote is enough to keep that string's own syntax intact for this single-user, local tool.
var escapeQuoted = function escapeQuoted() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return String(value).replace(/'/g, '');
};

/**
 * Rank every muscle by how much it needs attention right now, from a real read of the database.
 * @param today - injectable for testing; defaults to the real current time
 */
var getMusclePriority = exports.getMusclePriority = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var today,
      _yield$query,
      _yield$query2,
      muscles,
      joinQueryString,
      _yield$query3,
      _yield$query4,
      workoutsWithMuscles,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          today = _args.length > 0 && _args[0] !== undefined ? _args[0] : new Date();
          _context.n = 1;
          return (0, _index.query)('read muscles');
        case 1:
          _yield$query = _context.v;
          _yield$query2 = _slicedToArray(_yield$query, 1);
          muscles = _yield$query2[0];
          joinQueryString = 'read workouts.muscles' + ' on workouts.exercise_id = exercises._id' + ' and on exercises._id = exercise_muscle.exercise_id' + ' and on exercise_muscle.muscle_id = muscles._id' + ' merge muscles._id with exercise_muscle.muscle_id';
          _context.n = 2;
          return (0, _index.query)(joinQueryString);
        case 2:
          _yield$query3 = _context.v;
          _yield$query4 = _slicedToArray(_yield$query3, 1);
          workoutsWithMuscles = _yield$query4[0];
          return _context.a(2, (0, _musclePriority.musclePriority)(muscles, workoutsWithMuscles, today));
      }
    }, _callee);
  }));
  return function getMusclePriority() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Every exercise linked to a given muscle, via exercise_muscle.
 * @param muscleId
 */
var getExercisesForMuscle = exports.getExercisesForMuscle = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(muscleId) {
    var queryString, _yield$query5, _yield$query6, rows;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          queryString = 'read exercise_muscle.exercises' + ' on exercise_muscle.exercise_id = exercises._id' + " where muscle_id = ".concat(muscleId);
          _context2.n = 1;
          return (0, _index.query)(queryString);
        case 1:
          _yield$query5 = _context2.v;
          _yield$query6 = _slicedToArray(_yield$query5, 1);
          rows = _yield$query6[0];
          return _context2.a(2, rows.map(function (row) {
            return row.exercises[0];
          }));
      }
    }, _callee2);
  }));
  return function getExercisesForMuscle(_x) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * The most recently logged workout for a given exercise, or null if it's never been logged.
 * @param exerciseId
 */
var getLastSession = exports.getLastSession = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(exerciseId) {
    var _rows$;
    var queryString, _yield$query7, _yield$query8, rows;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          queryString = "read workouts where exercise_id = ".concat(exerciseId, " sort date desc limit 1");
          _context3.n = 1;
          return (0, _index.query)(queryString);
        case 1:
          _yield$query7 = _context3.v;
          _yield$query8 = _slicedToArray(_yield$query7, 1);
          rows = _yield$query8[0];
          return _context3.a(2, (_rows$ = rows[0]) !== null && _rows$ !== void 0 ? _rows$ : null);
      }
    }, _callee3);
  }));
  return function getLastSession(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Log a new workout entry.
 * @param exerciseId
 * @param weightEffort
 * @param sets
 * @param reps
 * @param note
 * @param date - defaults to today, in the same 'YYYY-MM-DD' shape the rest of the data uses
 * @param order - where this entry falls among others logged the same day (defaults to first)
 */
var logWorkout = exports.logWorkout = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_ref4) {
    var exerciseId, _ref4$weightEffort, weightEffort, sets, reps, _ref4$note, note, _ref4$date, date, _ref4$order, order, queryString, _yield$query9, _yield$query0, rows;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          exerciseId = _ref4.exerciseId, _ref4$weightEffort = _ref4.weightEffort, weightEffort = _ref4$weightEffort === void 0 ? '' : _ref4$weightEffort, sets = _ref4.sets, reps = _ref4.reps, _ref4$note = _ref4.note, note = _ref4$note === void 0 ? '' : _ref4$note, _ref4$date = _ref4.date, date = _ref4$date === void 0 ? new Date().toISOString().slice(0, 10) : _ref4$date, _ref4$order = _ref4.order, order = _ref4$order === void 0 ? 0 : _ref4$order;
          queryString = 'insert workouts values ' + "exercise_id = ".concat(exerciseId, ", ") + "weight_effort = '".concat(escapeQuoted(weightEffort), "', ") + "sets = ".concat(sets, ", ") + "reps = ".concat(reps, ", ") + "note = '".concat(escapeQuoted(note), "', ") + "order = ".concat(order, ", ") + "date = '".concat(date, "'");
          _context4.n = 1;
          return (0, _index.query)(queryString);
        case 1:
          _yield$query9 = _context4.v;
          _yield$query0 = _slicedToArray(_yield$query9, 1);
          rows = _yield$query0[0];
          return _context4.a(2, rows[0]);
      }
    }, _callee4);
  }));
  return function logWorkout(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Update an existing workout entry - e.g. correcting the plan with what was actually done.
 * @param workoutId
 * @param changes - any subset of weightEffort/sets/reps/note to change
 */
var updateWorkout = exports.updateWorkout = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(workoutId) {
    var _rows$2;
    var _ref7,
      weightEffort,
      sets,
      reps,
      note,
      assignments,
      queryString,
      _yield$query1,
      _yield$query10,
      rows,
      _args5 = arguments;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _ref7 = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {}, weightEffort = _ref7.weightEffort, sets = _ref7.sets, reps = _ref7.reps, note = _ref7.note;
          assignments = [];
          if (typeof weightEffort !== 'undefined') {
            assignments.push("weight_effort = '".concat(escapeQuoted(weightEffort), "'"));
          }
          if (typeof sets !== 'undefined') {
            assignments.push("sets = ".concat(sets));
          }
          if (typeof reps !== 'undefined') {
            assignments.push("reps = ".concat(reps));
          }
          if (typeof note !== 'undefined') {
            assignments.push("note = '".concat(escapeQuoted(note), "'"));
          }
          if (assignments.length) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2, null);
        case 1:
          queryString = "update workouts set ".concat(assignments.join(', '), " where _id = ").concat(workoutId);
          _context5.n = 2;
          return (0, _index.query)(queryString);
        case 2:
          _yield$query1 = _context5.v;
          _yield$query10 = _slicedToArray(_yield$query1, 1);
          rows = _yield$query10[0];
          return _context5.a(2, (_rows$2 = rows[0]) !== null && _rows$2 !== void 0 ? _rows$2 : null);
      }
    }, _callee5);
  }));
  return function updateWorkout(_x4) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).
 * @param name
 * @param description
 * @param {Array<{muscleId: number, rank: number}>} muscleAssignments - one row per muscle this exercise works
 */
var addExercise = exports.addExercise = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(_ref8) {
    var name,
      _ref8$description,
      description,
      muscleAssignments,
      insertExerciseQuery,
      _yield$query11,
      _yield$query12,
      exerciseRows,
      exercise,
      _iterator,
      _step,
      _step$value,
      muscleId,
      rank,
      insertLinkQuery,
      _args6 = arguments,
      _t;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          name = _ref8.name, _ref8$description = _ref8.description, description = _ref8$description === void 0 ? '' : _ref8$description;
          muscleAssignments = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : [];
          insertExerciseQuery = 'insert exercises values ' + "name = '".concat(escapeQuoted(name), "', ") + "description = '".concat(escapeQuoted(description), "'");
          _context6.n = 1;
          return (0, _index.query)(insertExerciseQuery);
        case 1:
          _yield$query11 = _context6.v;
          _yield$query12 = _slicedToArray(_yield$query11, 1);
          exerciseRows = _yield$query12[0];
          exercise = exerciseRows[0];
          _iterator = _createForOfIteratorHelper(muscleAssignments);
          _context6.p = 2;
          _iterator.s();
        case 3:
          if ((_step = _iterator.n()).done) {
            _context6.n = 5;
            break;
          }
          _step$value = _step.value, muscleId = _step$value.muscleId, rank = _step$value.rank;
          insertLinkQuery = 'insert exercise_muscle values ' + "exercise_id = '".concat(exercise._id, "', ") + "muscle_id = ".concat(muscleId, ", ") + "muscle_rank = ".concat(rank);
          _context6.n = 4;
          return (0, _index.query)(insertLinkQuery);
        case 4:
          _context6.n = 3;
          break;
        case 5:
          _context6.n = 7;
          break;
        case 6:
          _context6.p = 6;
          _t = _context6.v;
          _iterator.e(_t);
        case 7:
          _context6.p = 7;
          _iterator.f();
          return _context6.f(7);
        case 8:
          return _context6.a(2, exercise);
      }
    }, _callee6, null, [[2, 6, 7, 8]]);
  }));
  return function addExercise(_x5) {
    return _ref9.apply(this, arguments);
  };
}();