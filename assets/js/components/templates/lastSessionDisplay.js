import { div } from '../micro/div.js'
import { text } from '../micro/text.js'

export const formatLastSession = (session) => session
  ? `Last time: ${session.weight_effort || 'no weight recorded'}, ${session.sets}x${session.reps} on ${session.date}`
  : 'No previous session for this exercise yet.'

/**
 * @param {Object|null} session - getLastSession()'s shape, or null if never logged
 * @returns {DomItem}
 */
export const lastSessionDisplay = (session = null) => div([text(formatLastSession(session))], 'last-session')
