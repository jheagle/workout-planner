"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastSessionDisplay = exports.formatLastSession = void 0;
require("core-js/modules/es.array.concat.js");
var _div = require("../micro/div.js");
var _text = require("../micro/text.js");
var formatLastSession = exports.formatLastSession = function formatLastSession(session) {
  return session ? "Last time: ".concat(session.weight_effort || 'no weight recorded', ", ").concat(session.sets, "x").concat(session.reps, " on ").concat(session.date) : 'No previous session for this exercise yet.';
};

/**
 * @param {Object|null} session - getLastSession()'s shape, or null if never logged
 * @returns {DomItem}
 */
var lastSessionDisplay = exports.lastSessionDisplay = function lastSessionDisplay() {
  var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  return (0, _div.div)([(0, _text.text)(formatLastSession(session))], 'last-session');
};