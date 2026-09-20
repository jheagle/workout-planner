'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.workout = void 0
const _responsiveTable = require('../macro/responsiveTable.js')
/**
 * Generates a table for a workout plan.
 * @returns {DomItem}
 */
const workout = exports.workout = function workout () {
  const workoutDetails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
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
  }])
}
