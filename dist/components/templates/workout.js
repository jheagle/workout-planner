"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workout = void 0;
var _responsiveTable = require("../macro/responsiveTable.js");
/**
 * Generates a table for a workout plan.
 * @returns {DomItem}
 */
const workout = (workoutDetails = []) => (0, _responsiveTable.responsiveTable)(workoutDetails, [{
  text: 'Muscle',
  className: ''
}, {
  text: 'Workout',
  className: ''
}, {
  text: 'Weight / Difficulty',
  className: ''
}, {
  text: 'Sets / Reps',
  className: ''
}, {
  text: 'Notes',
  className: ''
}]);
exports.workout = workout;