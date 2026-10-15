"use strict";

require("core-js/modules/es.symbol.iterator.js");
require("core-js/modules/es.array.is-array.js");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.array.slice.js");
require("core-js/modules/es.date.to-string.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.regexp.test.js");
require("core-js/modules/es.regexp.to-string.js");
require("core-js/modules/web.dom-collections.iterator.js");
require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.array.concat.js");
require("core-js/modules/es.array.for-each.js");
require("core-js/modules/es.array.from.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.date.to-json.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.string.iterator.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.for-each.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/web.dom-collections.for-each.js");
var _musclePriorityList = require("./components/templates/musclePriorityList.js");
var _exercisePicker = require("./components/templates/exercisePicker.js");
var _lastSessionDisplay = require("./components/templates/lastSessionDisplay.js");
var _logWorkoutForm = require("./components/templates/logWorkoutForm.js");
var _addExerciseForm = require("./components/templates/addExerciseForm.js");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/* global jsonDom, jsonDomComponents -- both loaded as plain scripts in muscles.html before this native ES module runs, not npm imports */
window.jsonDom = jsonDom;
var _jsonDomComponents = jsonDomComponents,
  option = _jsonDomComponents.option,
  text = _jsonDomComponents.text,
  main = _jsonDomComponents.main,
  header = _jsonDomComponents.header,
  heading = _jsonDomComponents.heading;

// The query layer needs real Node filesystem access, which this page's own JS never has - see
// server/server.js, which exposes it as JSON endpoints this page talks to instead.
var API_BASE = 'http://localhost:3001';
var picker;
var lastSessionItem;
var logForm;
var addForm;
var lastSessionId = null;
var fillFormFrom = function fillFormFrom(session) {
  logForm.weightEffortInput.element.value = session ? session.weight_effort || '' : '';
  logForm.setsInput.element.value = session ? session.sets : '';
  logForm.repsInput.element.value = session ? session.reps : '';
  logForm.noteInput.element.value = session ? session.note || '' : '';
};
var updateLastSession = function updateLastSession(session) {
  lastSessionId = session ? session._id : null;
  fillFormFrom(session);
  lastSessionItem.children = [text((0, _lastSessionDisplay.formatLastSession)(session))];
  jsonDom.updateChildNodes(lastSessionItem);
};
var onExerciseChange = function onExerciseChange(exerciseId) {
  if (!exerciseId) {
    updateLastSession(null);
    return;
  }
  fetch("".concat(API_BASE, "/api/last-session?exerciseId=").concat(exerciseId)).then(function (response) {
    return response.json();
  }).then(updateLastSession);
};
var onLogWorkout = function onLogWorkout(_ref) {
  var weightEffort = _ref.weightEffort,
    sets = _ref.sets,
    reps = _ref.reps,
    note = _ref.note,
    date = _ref.date;
  var exerciseId = picker.exerciseSelect.element.value;
  if (!exerciseId) {
    return;
  }
  fetch("".concat(API_BASE, "/api/workouts"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      exerciseId: exerciseId,
      weightEffort: weightEffort,
      sets: sets || 0,
      reps: reps || 0,
      note: note,
      date: date
    })
  }).then(function (response) {
    return response.json();
  }).then(function () {
    return onExerciseChange(exerciseId);
  });
};
var onUpdateWorkout = function onUpdateWorkout(_ref2) {
  var weightEffort = _ref2.weightEffort,
    sets = _ref2.sets,
    reps = _ref2.reps,
    note = _ref2.note;
  if (!lastSessionId) {
    return;
  }
  var exerciseId = picker.exerciseSelect.element.value;
  fetch("".concat(API_BASE, "/api/workouts/").concat(lastSessionId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      weightEffort: weightEffort,
      sets: sets || 0,
      reps: reps || 0,
      note: note
    })
  }).then(function (response) {
    return response.json();
  }).then(function () {
    return onExerciseChange(exerciseId);
  });
};
var onAddExercise = function onAddExercise(_ref3) {
  var name = _ref3.name,
    description = _ref3.description,
    primaryMuscleIds = _ref3.primaryMuscleIds,
    secondaryMuscleIds = _ref3.secondaryMuscleIds;
  if (!name) {
    return;
  }
  var muscleAssignments = [].concat(_toConsumableArray(primaryMuscleIds.map(function (muscleId) {
    return {
      muscleId: muscleId,
      rank: 100
    };
  })), _toConsumableArray(secondaryMuscleIds.map(function (muscleId) {
    return {
      muscleId: muscleId,
      rank: 50
    };
  })));
  fetch("".concat(API_BASE, "/api/exercises"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      description: description,
      muscleAssignments: muscleAssignments
    })
  }).then(function (response) {
    return response.json();
  }).then(function () {
    addForm.nameInput.element.value = '';
    addForm.descriptionInput.element.value = '';
    Array.from(addForm.primaryMusclesSelect.element.options).forEach(function (opt) {
      opt.selected = false;
    });
    Array.from(addForm.secondaryMusclesSelect.element.options).forEach(function (opt) {
      opt.selected = false;
    });
    // The new exercise may apply to whichever muscle is currently selected - refresh its list.
    onMuscleChange(picker.muscleSelect.element.value);
  });
};
var onMuscleChange = function onMuscleChange(muscleId) {
  fetch("".concat(API_BASE, "/api/exercises-for-muscle?muscleId=").concat(muscleId)).then(function (response) {
    return response.json();
  }).then(function (exercises) {
    picker.exerciseSelect.children = exercises.length ? exercises.map(function (exercise) {
      return option(String(exercise._id), exercise.name);
    }) : [option('', 'No exercises for this muscle yet')];
    picker.exerciseSelect.element.disabled = exercises.length === 0;
    jsonDom.updateChildNodes(picker.exerciseSelect);
    if (!exercises.length) {
      updateLastSession(null);
      return;
    }
    var firstExerciseId = String(exercises[0]._id);
    picker.exerciseSelect.element.value = firstExerciseId;
    onExerciseChange(firstExerciseId);
  });
};
var renderPage = function renderPage(priorityRows) {
  var mainHeader = header([heading(1, [text('Workout Planner')])]);
  var priorityTable = (0, _musclePriorityList.musclePriorityList)(priorityRows);
  picker = (0, _exercisePicker.exercisePicker)(priorityRows);
  lastSessionItem = (0, _lastSessionDisplay.lastSessionDisplay)(null);
  logForm = (0, _logWorkoutForm.logWorkoutForm)();
  addForm = (0, _addExerciseForm.addExerciseForm)(priorityRows);
  var documentItem = jsonDom.documentItem;
  jsonDom.updateDomItems(documentItem);
  documentItem.head.children.push(priorityTable.style);

  // Add the header as the first child of body
  documentItem.body.children.unshift(mainHeader);
  var mainContent = main([priorityTable.table, picker.container, lastSessionItem, logForm.container, addForm.container]);
  documentItem.body.children.push(mainContent);

  // Update the body child node list to include the header
  jsonDom.updateChildNodes(documentItem.head);
  // Update the style for the table
  jsonDom.updateElements(priorityTable.style);
  jsonDom.updateChildNodes(documentItem.body);
  // Update the header to generate the elements
  jsonDom.updateElements(mainHeader);
  // Update the table to generate the elements
  jsonDom.updateElements(mainContent);

  // Only now does every new node have both a real element and a complete parentItem chain up to
  // documentItem - fullAddEventListener needs both, so event wiring has to happen after this.
  jsonDom.setParentItemReferences(documentItem);
  (0, _exercisePicker.wireExercisePickerEvents)(picker, onMuscleChange, onExerciseChange);
  (0, _logWorkoutForm.wireLogWorkoutFormEvents)(logForm, onLogWorkout, onUpdateWorkout);
  (0, _addExerciseForm.wireAddExerciseFormEvents)(addForm, onAddExercise);
  if (priorityRows.length) {
    onMuscleChange(String(priorityRows[0].muscleId));
  }
};
fetch("".concat(API_BASE, "/api/muscle-priority")).then(function (response) {
  return response.json();
}).then(renderPage)["catch"](function (error) {
  console.error('Could not load muscle priority from the API - is `npm run serve:api` running?', error);
  renderPage([]);
});