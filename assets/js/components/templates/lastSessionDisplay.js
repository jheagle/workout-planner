/* global treeloomComponents */
import { workoutWeight, showWeight, formatSeconds } from '../../data/units.js'

const { div, text } = treeloomComponents

/**
 * A session in one line, its weight in the viewer's unit and, when the equipment's unit differs, the weight as
 * entered in brackets: "Last time: 81.6 kg (180 lbs), 3x10 on 2024-06-05". A hold shows its time instead.
 * @param {Object|null} session - getLastSession()'s shape, or null if never logged
 * @param {string} [preferredUnit='kg'] - 'kg' or 'lbs'
 * @returns {string}
 */
export const formatLastSession = (session, preferredUnit = 'kg') => {
  if (!session) return 'No previous session for this exercise yet.'
  const shown = showWeight(workoutWeight(session), preferredUnit)
  const effort = shown
    ? (shown.entered ? `${shown.text} (${shown.entered})` : shown.text)
    : session.seconds ? `held ${formatSeconds(session.seconds)}` : 'no weight recorded'
  const work = session.reps ? `${session.sets}x${session.reps}` : `${session.sets} sets`
  return `Last time: ${effort}, ${work} on ${session.date}`
}

/**
 * @param {Object|null} session - getLastSession()'s shape, or null if never logged
 * @param {string} [preferredUnit='kg'] - 'kg' or 'lbs'
 * @returns {DomItem}
 */
export const lastSessionDisplay = (session = null, preferredUnit = 'kg') => div([text(formatLastSession(session, preferredUnit))], 'last-session')
