"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.musclePriorityList = void 0;
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _responsiveTable = require("../macro/responsiveTable.js");
// A muscle never worked carries Infinity here, but Infinity has no JSON representation -
// it crosses the API as `null` (JSON.stringify(Infinity) === 'null'), not the number itself.
var formatDaysSinceWorked = function formatDaysSinceWorked(daysSinceLastWorked) {
  return daysSinceLastWorked === Infinity || daysSinceLastWorked === null ? 'Never' : "".concat(daysSinceLastWorked);
};

/**
 * Generates a table ranking muscles by how much they need attention right now.
 * @param {Array} priorityRows - musclePriority()'s shape: [{ muscleId, name, daysSinceLastWorked, timesWorkedThisWeek, needsPriority }]
 * @returns {Object.<DomItem>}
 */
var musclePriorityList = exports.musclePriorityList = function musclePriorityList() {
  var priorityRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return (0, _responsiveTable.responsiveTable)(priorityRows.map(function (row) {
    return {
      data: [{
        text: row.name,
        className: ''
      }, {
        text: formatDaysSinceWorked(row.daysSinceLastWorked),
        className: ''
      }, {
        text: "".concat(row.timesWorkedThisWeek),
        className: ''
      }, {
        text: row.needsPriority ? 'Needs priority' : 'Recovered',
        className: ''
      }],
      className: row.needsPriority ? 'needs-priority' : ''
    };
  }), [{
    text: 'Muscle',
    className: ''
  }, {
    text: 'Days Since Worked',
    className: ''
  }, {
    text: 'Times This Week',
    className: ''
  }, {
    text: 'Status',
    className: ''
  }]);
};