"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wireLogWorkoutFormEvents = exports.readFormValues = exports.logWorkoutForm = void 0;
require("core-js/modules/es.array.slice.js");
require("core-js/modules/es.date.to-iso-string.js");
require("core-js/modules/es.date.to-string.js");
var _div = require("../micro/div.js");
var _input = require("../micro/input.js");
var _button = require("../micro/button.js");
/* global jsonDom -- loaded as a plain script in muscles.html before this native ES module runs, not an npm import */

var todayDate = function todayDate() {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Builds the log-workout form's DOM structure. No event wiring here - see exercisePicker.js's
 * own note on why that has to happen after this is attached into the real document and rendered.
 * @returns {{ container: DomItem, weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem }}
 */
var logWorkoutForm = exports.logWorkoutForm = function logWorkoutForm() {
  var weightEffortInput = (0, _input.input)('text', {
    placeholder: 'Weight / effort (e.g. 120lbs)'
  });
  var setsInput = (0, _input.input)('number', {
    placeholder: 'Sets',
    min: '0'
  });
  var repsInput = (0, _input.input)('number', {
    placeholder: 'Reps',
    min: '0'
  });
  var noteInput = (0, _input.input)('text', {
    placeholder: 'Notes (optional)'
  });
  var dateInput = (0, _input.input)('date', {
    value: todayDate()
  });
  var submitButton = (0, _button.button)('Log this workout');
  var updateButton = (0, _button.button)('Update last entry');
  return {
    container: (0, _div.div)([weightEffortInput, setsInput, repsInput, noteInput, dateInput, submitButton, updateButton], 'log-workout-form'),
    weightEffortInput: weightEffortInput,
    setsInput: setsInput,
    repsInput: repsInput,
    noteInput: noteInput,
    dateInput: dateInput,
    submitButton: submitButton,
    updateButton: updateButton
  };
};

/**
 * Reads the form's current field values, independent of which button triggered it.
 * @param {{ weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem }} form
 */
var readFormValues = exports.readFormValues = function readFormValues(form) {
  return {
    weightEffort: form.weightEffortInput.element.value,
    sets: form.setsInput.element.value,
    reps: form.repsInput.element.value,
    note: form.noteInput.element.value,
    date: form.dateInput.element.value
  };
};

/**
 * Wires the form's submit and update buttons - see logWorkoutForm's own note on timing.
 * @param {{ weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem, updateButton: DomItem }} form
 * @param {Function} onSubmit - ({ weightEffort, sets, reps, note, date }) => void, logs a brand new entry
 * @param {Function} onUpdate - ({ weightEffort, sets, reps, note, date }) => void, corrects the most recently shown entry
 */
var wireLogWorkoutFormEvents = exports.wireLogWorkoutFormEvents = function wireLogWorkoutFormEvents(form) {
  var onSubmit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  var onUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  jsonDom.fullAddEventListener('click', function () {
    return onSubmit(readFormValues(form));
  }, 'onLogWorkout', null, null, form.submitButton);
  jsonDom.fullAddEventListener('click', function () {
    return onUpdate(readFormValues(form));
  }, 'onUpdateWorkout', null, null, form.updateButton);
};