'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.workout = void 0
var _responsiveTable = require('../macro/responsiveTable.js')
/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {number} currentIndex
 * @returns {DomItem}
 */
var workout = exports.workout = function workout () {
  var currentIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1
  return (0, _responsiveTable.responsiveTable)([{
    data: [{
      text: 'Pecs',
      className: ''
    }, {
      text: 'Bench Press',
      className: ''
    }, {
      text: '115lbs',
      className: ''
    }, {
      text: '3x10',
      className: ''
    }, {
      text: '',
      className: ''
    }],
    className: ''
  }, {
    data: [{
      text: 'Quads',
      className: ''
    }, {
      text: 'Squat',
      className: ''
    }, {
      text: '155lbs',
      className: ''
    }, {
      text: '3x10',
      className: ''
    }, {
      text: '',
      className: ''
    }],
    className: ''
  }, {
    data: [{
      text: 'Hamstrings',
      className: ''
    }, {
      text: 'Deadlift',
      className: ''
    }, {
      text: '155lbs',
      className: ''
    }, {
      text: '3x10',
      className: ''
    }, {
      text: '',
      className: ''
    }],
    className: ''
  }], [{
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
