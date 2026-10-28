"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wireLogWorkoutFormEvents = exports.readFormValues = exports.logWorkoutForm = void 0;
var _localDate = require("../../data/localDate.js");
/* global jsonDom, jsonDomComponents -- both loaded as plain scripts in muscles.html before this native ES module runs, not npm imports */

var _jsonDomComponents = jsonDomComponents,
  div = _jsonDomComponents.div,
  input = _jsonDomComponents.input,
  button = _jsonDomComponents.button;

/**
 * Builds the log-workout form's DOM structure. No event wiring here - see exercisePicker.js's
 * own note on why that has to happen after this is attached into the real document and rendered.
 * @returns {{ container: DomItem, weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem }}
 */
var logWorkoutForm = exports.logWorkoutForm = function logWorkoutForm() {
  var weightEffortInput = input('text', '', null, [], undefined, {
    placeholder: 'Weight / effort (e.g. 120lbs)'
  });
  var setsInput = input('number', '', null, [], undefined, {
    placeholder: 'Sets',
    min: '0'
  });
  var repsInput = input('number', '', null, [], undefined, {
    placeholder: 'Reps',
    min: '0'
  });
  var noteInput = input('text', '', null, [], undefined, {
    placeholder: 'Notes (optional)'
  });
  var dateInput = input('date', '', (0, _localDate.localDate)());
  var submitButton = button('Log this workout');
  var updateButton = button('Update last entry');
  return {
    container: div([weightEffortInput, setsInput, repsInput, noteInput, dateInput, submitButton, updateButton], 'log-workout-form'),
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