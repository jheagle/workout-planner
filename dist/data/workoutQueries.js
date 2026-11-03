"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateWorkout = exports.logWorkout = exports.getMusclePriority = exports.getLastSession = exports.getExercisesForMuscle = exports.addExercise = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _index = require("./index.js");
var _musclePriority = require("./musclePriority.js");
var _localDate = require("./localDate.js");
/**
 * Rank every muscle by how much it needs attention right now, from a real read of the database.
 * @param today - injectable for testing; defaults to the real current time
 */
const getMusclePriority = async (today = new Date()) => {
  const [muscles] = await (0, _index.query)('read muscles');
  const joinQueryString = 'read workouts.muscles' + ' on workouts.exercise_id = exercises._id' + ' and on exercises._id = exercise_muscle.exercise_id' + ' and on exercise_muscle.muscle_id = muscles._id' + ' merge muscles._id with exercise_muscle.muscle_id';
  const [workoutsWithMuscles] = await (0, _index.query)(joinQueryString);
  return (0, _musclePriority.musclePriority)(muscles, workoutsWithMuscles, today);
};

/**
 * Every exercise linked to a given muscle, via exercise_muscle.
 * @param muscleId
 */
exports.getMusclePriority = getMusclePriority;
const getExercisesForMuscle = async muscleId => {
  const queryString = 'read exercise_muscle.exercises' + ' on exercise_muscle.exercise_id = exercises._id' + ` where muscle_id = ${muscleId}`;
  const [rows] = await (0, _index.query)(queryString);
  return rows.map(row => row.exercises[0]);
};

/**
 * The most recently logged workout for a given exercise, or null if it's never been logged.
 * @param exerciseId
 */
exports.getExercisesForMuscle = getExercisesForMuscle;
const getLastSession = async exerciseId => {
  const queryString = `read workouts where exercise_id = ${exerciseId} sort date desc limit 1`;
  const [rows] = await (0, _index.query)(queryString);
  return rows[0] ?? null;
};

/**
 * Log a new workout entry.
 * @param exerciseId
 * @param weightEffort
 * @param sets
 * @param reps
 * @param note
 * @param date - defaults to today (the local date, see localDate), in the same 'YYYY-MM-DD' shape the rest of the data uses
 * @param order - where this entry falls among others logged the same day (defaults to first)
 */
exports.getLastSession = getLastSession;
const logWorkout = async ({
  exerciseId,
  weightEffort = '',
  sets,
  reps,
  note = '',
  date = (0, _localDate.localDate)(),
  order = 0
}) => {
  const queryString = 'insert workouts values ' + `exercise_id = ${exerciseId}, ` + `weight_effort = ${(0, _index.quote)(weightEffort)}, ` + `sets = ${sets}, ` + `reps = ${reps}, ` + `note = ${(0, _index.quote)(note)}, ` + `order = ${order}, ` + `date = '${date}'`;
  const [rows] = await (0, _index.query)(queryString);
  return rows[0];
};

/**
 * Update an existing workout entry - e.g. correcting the plan with what was actually done.
 * @param workoutId
 * @param changes - any subset of weightEffort/sets/reps/note to change
 */
exports.logWorkout = logWorkout;
const updateWorkout = async (workoutId, {
  weightEffort,
  sets,
  reps,
  note
} = {}) => {
  const assignments = [];
  if (typeof weightEffort !== 'undefined') {
    assignments.push(`weight_effort = ${(0, _index.quote)(weightEffort)}`);
  }
  if (typeof sets !== 'undefined') {
    assignments.push(`sets = ${sets}`);
  }
  if (typeof reps !== 'undefined') {
    assignments.push(`reps = ${reps}`);
  }
  if (typeof note !== 'undefined') {
    assignments.push(`note = ${(0, _index.quote)(note)}`);
  }
  if (!assignments.length) {
    return null;
  }
  const queryString = `update workouts set ${assignments.join(', ')} where _id = ${workoutId}`;
  const [rows] = await (0, _index.query)(queryString);
  return rows[0] ?? null;
};

/**
 * Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).
 * @param name
 * @param description
 * @param {Array<{muscleId: number, rank: number}>} muscleAssignments - one row per muscle this exercise works
 */
exports.updateWorkout = updateWorkout;
const addExercise = async ({
  name,
  description = ''
}, muscleAssignments = []) => {
  const insertExerciseQuery = 'insert exercises values ' + `name = ${(0, _index.quote)(name)}, ` + `description = ${(0, _index.quote)(description)}`;
  const [exerciseRows] = await (0, _index.query)(insertExerciseQuery);
  const exercise = exerciseRows[0];
  for (const {
    muscleId,
    rank
  } of muscleAssignments) {
    const insertLinkQuery = 'insert exercise_muscle values ' + `exercise_id = '${exercise._id}', ` + `muscle_id = ${muscleId}, ` + `muscle_rank = ${rank}`;
    await (0, _index.query)(insertLinkQuery);
  }
  return exercise;
};
exports.addExercise = addExercise;