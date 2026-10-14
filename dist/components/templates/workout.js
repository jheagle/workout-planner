"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workout = void 0;
var _responsiveTable = require("../macro/responsiveTable.js");
/**
 * Generates a table for a workout plan.
 * @returns {DomItem}
 */
var workout = exports.workout = function workout() {
  var workoutDetails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return (0, _responsiveTable.responsiveTable)(workoutDetails, [{
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
};