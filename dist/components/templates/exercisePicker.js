"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wireExercisePickerEvents = exports.exercisePicker = void 0;
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _div = require("../micro/div.js");
var _select = require("../micro/select.js");
var _option = require("../micro/option.js");
/* global jsonDom -- loaded as a plain script in muscles.html before this native ES module runs, not an npm import */

/**
 * Builds the muscle -> exercise picker's DOM structure. No event wiring here - fullAddEventListener
 * needs a complete parentItem chain up to the real document root (it throws otherwise), which a
 * freshly-built, not-yet-attached DomItem doesn't have yet. Call wireExercisePickerEvents once this
 * is attached into the real document and rendered.
 * @param {Array} priorityRows - musclePriority()'s shape, ordered by priority - becomes the muscle dropdown's options, top priority first
 * @returns {{ container: DomItem, muscleSelect: DomItem, exerciseSelect: DomItem }}
 */
var exercisePicker = exports.exercisePicker = function exercisePicker() {
  var priorityRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var muscleSelect = (0, _select.select)(priorityRows.map(function (row) {
    return (0, _option.option)(String(row.muscleId), row.name);
  }));
  var exerciseSelect = (0, _select.select)([(0, _option.option)('', 'Pick a muscle first')], '', {
    disabled: true
  });
  return {
    container: (0, _div.div)([muscleSelect, exerciseSelect], 'exercise-picker'),
    muscleSelect: muscleSelect,
    exerciseSelect: exerciseSelect
  };
};

/**
 * Wires the picker's change events, once it's attached into the real document and rendered -
 * see exercisePicker's own note on why this can't happen at construction time.
 * @param {{ muscleSelect: DomItem, exerciseSelect: DomItem }} picker
 * @param {Function} onMuscleChange - (muscleId: string) => void
 * @param {Function} onExerciseChange - (exerciseId: string) => void
 */
var wireExercisePickerEvents = exports.wireExercisePickerEvents = function wireExercisePickerEvents(picker) {
  var onMuscleChange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  var onExerciseChange = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  jsonDom.fullAddEventListener('change', function () {
    return onMuscleChange(picker.muscleSelect.element.value);
  }, 'onMuscleChange', null, null, picker.muscleSelect);
  jsonDom.fullAddEventListener('change', function () {
    return onExerciseChange(picker.exerciseSelect.element.value);
  }, 'onExerciseChange', null, null, picker.exerciseSelect);
};