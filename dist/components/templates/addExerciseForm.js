"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wireAddExerciseFormEvents = exports.readAddExerciseValues = exports.addExerciseForm = void 0;
require("core-js/modules/es.array.from.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.string.iterator.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
/* global jsonDom, jsonDomComponents -- both loaded as plain scripts in muscles.html before this native ES module runs, not npm imports */
var _jsonDomComponents = jsonDomComponents,
  div = _jsonDomComponents.div,
  input = _jsonDomComponents.input,
  select = _jsonDomComponents.select,
  option = _jsonDomComponents.option,
  button = _jsonDomComponents.button;

/**
 * Builds the add-exercise form's DOM structure. No event wiring here - see exercisePicker.js's
 * own note on why that has to happen after this is attached into the real document and rendered.
 * Primary and secondary are two separate multi-selects (rather than one picker with a per-muscle
 * rank) - a real exercise's muscles split cleanly into those two buckets, and a plain multi-select
 * needs no dynamic add/remove row UI to support picking several of each.
 * @param {Array} muscles - musclePriority()'s shape (every real muscle, not just priority ones) - becomes both selects' options
 * @returns {{ container: DomItem, nameInput: DomItem, descriptionInput: DomItem, primaryMusclesSelect: DomItem, secondaryMusclesSelect: DomItem, submitButton: DomItem }}
 */
var addExerciseForm = exports.addExerciseForm = function addExerciseForm() {
  var muscles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var nameInput = input('text', '', null, [], undefined, {
    placeholder: 'Exercise name'
  });
  var descriptionInput = input('text', '', null, [], undefined, {
    placeholder: 'Description (optional)'
  });
  var muscleOptions = function muscleOptions() {
    return muscles.map(function (muscle) {
      return option(String(muscle.muscleId), muscle.name);
    });
  };
  var selectSize = String(Math.min(muscles.length, 6) || 1);
  var primaryMusclesSelect = select(muscleOptions(), '', {
    multiple: true,
    size: selectSize
  });
  var secondaryMusclesSelect = select(muscleOptions(), '', {
    multiple: true,
    size: selectSize
  });
  var submitButton = button('Add exercise');
  return {
    container: div([nameInput, descriptionInput, primaryMusclesSelect, secondaryMusclesSelect, submitButton], 'add-exercise-form'),
    nameInput: nameInput,
    descriptionInput: descriptionInput,
    primaryMusclesSelect: primaryMusclesSelect,
    secondaryMusclesSelect: secondaryMusclesSelect,
    submitButton: submitButton
  };
};
var selectedValues = function selectedValues(selectItem) {
  return Array.from(selectItem.element.selectedOptions).map(function (option) {
    return option.value;
  });
};
var readAddExerciseValues = exports.readAddExerciseValues = function readAddExerciseValues(form) {
  return {
    name: form.nameInput.element.value,
    description: form.descriptionInput.element.value,
    primaryMuscleIds: selectedValues(form.primaryMusclesSelect),
    secondaryMuscleIds: selectedValues(form.secondaryMusclesSelect)
  };
};

/**
 * Wires the form's submit button - see addExerciseForm's own note on timing.
 * @param {{ nameInput: DomItem, descriptionInput: DomItem, primaryMusclesSelect: DomItem, secondaryMusclesSelect: DomItem, submitButton: DomItem }} form
 * @param {Function} onSubmit - ({ name, description, primaryMuscleIds, secondaryMuscleIds }) => void
 */
var wireAddExerciseFormEvents = exports.wireAddExerciseFormEvents = function wireAddExerciseFormEvents(form) {
  var onSubmit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  jsonDom.fullAddEventListener('click', function () {
    return onSubmit(readAddExerciseValues(form));
  }, 'onAddExercise', null, null, form.submitButton);
};