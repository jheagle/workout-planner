"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastSessionDisplay = exports.formatLastSession = void 0;
/* global jsonDomComponents */
const {
  div,
  text
} = jsonDomComponents;
const formatLastSession = session => session ? `Last time: ${session.weight_effort || 'no weight recorded'}, ${session.sets}x${session.reps} on ${session.date}` : 'No previous session for this exercise yet.';

/**
 * @param {Object|null} session - getLastSession()'s shape, or null if never logged
 * @returns {DomItem}
 */
exports.formatLastSession = formatLastSession;
const lastSessionDisplay = (session = null) => div([text(formatLastSession(session))], 'last-session');
exports.lastSessionDisplay = lastSessionDisplay;