/**
 * The shape of a plan's weeks, decided by code before the model sees anything: when each week starts, which
 * training phase it falls in (cut, maintain or bulk), and what kind of week it is. The model fills the weeks in;
 * the checks hold it to this schedule. LJS-2, 2026-11-27.
 *
 * Kinds of week:
 * - `build`: normal training, weights climb.
 * - `lighter`: a planned easier week every `deloadEvery` weeks (Joshua's history dips about every 3-4 weeks, so plan
 *   it instead of hitting it). Fewer sets, no heavier than the last build week.
 * - `taper`: the week before the goal test. Fewer sets, weights may still climb a little.
 * - `test`: the last week, where the goal is tested.
 *
 * Phases set the pace: strength climbs faster in a bulk than in a cut. A phase comes from the profile's calendar;
 * a week outside every phase is `maintain`.
 * @module planSchedule
 */

import { localDate } from '../data/localDate.js'

/**
 * How fast strength can climb in each phase: `gainPerWeek` is how much the estimated max can grow a week (for
 * judging a goal), `maxJump` how much a lift's top weight may rise from one week to the next. Starting points, to
 * tune from real history (WP-12).
 */
export const PHASE_PACE = {
  bulk: { gainPerWeek: 0.025, maxJump: 0.1 },
  maintain: { gainPerWeek: 0.02, maxJump: 0.1 },
  cut: { gainPerWeek: 0.005, maxJump: 0.05 }
}

export const PHASES = Object.keys(PHASE_PACE)

export const DEFAULT_DELOAD_EVERY = 4

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * A 'YYYY-MM-DD' date as local midnight, or null when it isn't a real date.
 * @param {string} text
 * @returns {(Date|null)}
 */
export const parseDate = text => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text))
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return localDate(date) === text ? date : null
}

/**
 * The first day of a plan. With a start date (travel, a vacation), the Monday on or after it; without one, the
 * next Monday after today (a plan made on a Monday starts a week later, so there's time to read it).
 * @param {Date} today
 * @param {string} [startDate] - 'YYYY-MM-DD'
 * @returns {Date} local midnight
 */
export const planStart = (today, startDate) => {
  const chosen = startDate ? parseDate(startDate) : null
  const start = chosen || new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const daysToMonday = chosen ? (8 - start.getDay()) % 7 : ((8 - start.getDay()) % 7) || 7
  start.setDate(start.getDate() + daysToMonday)
  return start
}

/**
 * The phase on a date, from the profile's calendar; `maintain` when no phase covers it. Dates are 'YYYY-MM-DD'
 * and both ends count; a phase with no `to` runs on.
 * @param {Array<{phase: string, from: string, to: (string|undefined)}>} phases
 * @param {string} date
 * @returns {string}
 */
export const phaseOn = (phases, date) => {
  const found = (phases || []).find(({ from, to }) => from <= date && (!to || date <= to))
  return found && PHASE_PACE[found.phase] ? found.phase : 'maintain'
}

/**
 * Which weeks are lighter: every `deloadEvery`-th week, but none in the last three (the taper is light already,
 * and two light weeks in a row lose ground). Off when `deloadEvery` is 0, null or below 2.
 * @param {number} week - counts from 1
 * @param {number} weeks - the plan's length
 * @param {(number|null)} deloadEvery
 * @returns {boolean}
 */
const isLighter = (week, weeks, deloadEvery) =>
  Number.isInteger(deloadEvery) && deloadEvery >= 2 && week % deloadEvery === 0 && week <= weeks - 3

/**
 * @typedef {Object} ScheduleWeek
 * @property {number} week - counts from 1
 * @property {string} startDate - its Monday, 'YYYY-MM-DD'
 * @property {string} phase - 'cut', 'maintain' or 'bulk'
 * @property {string} kind - 'build', 'lighter', 'taper' or 'test'
 */

/**
 * The schedule for a plan of `weeks` weeks, starting on `startDate`'s Monday or the Monday after `today`.
 * @param {Object} options
 * @param {number} options.weeks
 * @param {GymProfile} options.profile - reads `deloadEvery` (default 4) and `phases`
 * @param {Date} options.today
 * @param {string} [options.startDate] - 'YYYY-MM-DD'
 * @returns {ScheduleWeek[]}
 */
export const buildSchedule = ({ weeks, profile, today, startDate }) => {
  const count = Number.isInteger(weeks) && weeks > 0 ? weeks : 0
  const deloadEvery = profile.deloadEvery === undefined ? DEFAULT_DELOAD_EVERY : profile.deloadEvery
  const start = planStart(today, startDate)
  return Array.from({ length: count }, (_, index) => {
    const week = index + 1
    // Noon, so a daylight-saving change never moves the date
    const monday = localDate(new Date(start.getTime() + index * 7 * MILLISECONDS_PER_DAY + MILLISECONDS_PER_DAY / 2))
    let kind = 'build'
    if (week === count) kind = 'test'
    else if (week === count - 1) kind = 'taper'
    else if (isLighter(week, count, deloadEvery)) kind = 'lighter'
    return { week, startDate: monday, phase: phaseOn(profile.phases, monday), kind }
  })
}

/**
 * How far the estimated max can realistically climb over the schedule: each week adds its phase's gain.
 * @param {number} estimatedMax
 * @param {ScheduleWeek[]} schedule
 * @returns {number}
 */
export const reachableMax = (estimatedMax, schedule) =>
  estimatedMax * (1 + schedule.reduce((total, { phase }) => total + PHASE_PACE[phase].gainPerWeek, 0))
