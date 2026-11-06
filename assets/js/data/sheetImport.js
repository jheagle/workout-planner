/**
 * Importing Joshua's workout history from his Google Sheets ("Workout Progress - Upper Body / Lower Body / Core",
 * exported as CSV). Each sheet is a grid: the first row is session dates (newest first), each later row an exercise,
 * and each cell what was done that day, as `;`-separated groups of `weight, reps`:
 *
 *   300lbs, 10            one set of 10 at 300 lbs
 *   60lbs, 2x5            2 sets of 5
 *   50lbs, 6,10           a set of 6, then a set of 10
 *   3x8                   bodyweight: 3 sets of 8
 *   02:00:00 / 2x 30 seconds / 5x0:30   timed holds (Sheets turns 2:00 into 02:00:00)
 *
 * Anything else is read as far as it can be, and the cell's own text is kept in the workout's note so nothing is lost.
 * This module only parses; scripts/import-sheets.js writes to the database.
 * @module sheetImport
 */

/**
 * Parse CSV text (RFC 4180: quoted fields, "" for a quote, commas and line breaks inside quotes, CRLF, a BOM).
 * @param {string} text
 * @returns {string[][]}
 */
export const parseCsv = text => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const source = text.replace(/^\uFEFF/, '')
  for (let index = 0; index < source.length; index++) {
    const character = source[index]
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"'
        index++
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && source[index + 1] === '\n') index++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** Known misspellings in the sheets, fixed on import (the original text goes in the report). */
const spellingFixes = [[/pullldown/i, 'pulldown']]

/**
 * An exercise name as stored: trimmed, single-spaced, known typos fixed.
 * @param {string} name
 * @returns {string}
 */
export const cleanName = name => spellingFixes.reduce((text, [pattern, fix]) => text.replace(pattern, fix), name.trim().replace(/\s+/g, ' '))

/**
 * The key two names are matched by: case and spacing don't matter ("Seated leg curl" is "Seated Leg Curl").
 * @param {string} name
 * @returns {string}
 */
export const nameKey = name => cleanName(name).toLowerCase()

/**
 * A timed effort as written in the sheet, or null when the text isn't a time: `02:00:00` (Sheets' reading of 2:00)
 * becomes `2:00`, `00:20` becomes `0:20`, `30 seconds` stays.
 * @param {string} text
 * @returns {string|null}
 */
export const readDuration = text => {
  const value = text.trim()
  const secondsOnly = value.match(/^(\d+)\s*(?:seconds?|secs?|s)$/i)
  if (secondsOnly) return `${Number(secondsOnly[1])} seconds`
  const clock = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!clock) return null
  // Sheets turns "2:00" into "02:00:00" (hh:mm:ss); a hold is minutes:seconds, so hh:mm:00 reads as mm:ss
  const [minutes, seconds] = clock[3] === '00' || clock[3] === undefined ? [clock[1], clock[2]] : [String(Number(clock[1]) * 60 + Number(clock[2])), clock[3]]
  return `${Number(minutes)}:${seconds}`
}

/**
 * Read a list of reps like `10`, `2x5`, `6,10`, `2x6, 4` into set groups.
 * @param {string} text
 * @returns {Array<{sets: number, reps: number}>|null} null when any part isn't a rep count.
 */
export const readReps = text => {
  const parts = text.split(',').map(part => part.trim()).filter(Boolean)
  if (!parts.length) return null
  const groups = []
  for (const part of parts) {
    const multiple = part.match(/^(\d+)\s*x\s*(\d+)$/i)
    if (multiple) groups.push({ sets: Number(multiple[1]), reps: Number(multiple[2]) })
    else if (/^\d+$/.test(part)) groups.push({ sets: 1, reps: Number(part) })
    else return null
  }
  return groups
}

/**
 * One `;`-separated group of a cell: a weight (optional) and its reps, or a timed hold.
 * @param {string} text
 * @returns {{rows: Array<{weightEffort: (string|null), sets: (number|null), reps: (number|null)}>, exact: boolean}}
 * exact is false when part of the text couldn't be read (the cell's text then goes in the note).
 */
export const readGroup = text => {
  const value = text.trim()
  // A timed hold, possibly with sets: "02:00:00", "2x 30 seconds", "5x0:30"
  const timed = value.match(/^(?:(\d+)\s*x\s*)?(.+)$/i)
  const duration = timed && readDuration(timed[2])
  if (duration) return { rows: [{ weightEffort: duration, sets: Number(timed[1] || 1), reps: null }], exact: true }

  // A weight first: "300lbs, 10", "70.5, 8" (lbs implied), "2x100lbs, 3x8" (a pair), "130lba" (typo)
  const weighted = value.match(/^((?:\d+\s*x\s*)?\d+(?:\.\d+)?)\s*(lba|lbs?)?\s*,?\s*(.*)$/i)
  // A number with no unit is a weight only when it can't be a rep count: a decimal (70.5) or 30 and up (315)
  const bareWeight = weighted && !weighted[2] && /,/.test(value) && /^\d+(\.\d+)?$/.test(weighted[1]) && (/\./.test(weighted[1]) || Number(weighted[1]) >= 30)
  if (weighted && (weighted[2] || bareWeight)) {
    const weightEffort = `${weighted[1].replace(/\s+/g, '')}lbs`
    const rest = weighted[3].trim()
    if (!rest) return { rows: [{ weightEffort, sets: null, reps: null }], exact: false }
    const groups = readReps(rest)
    // Exact only with a real unit: a bare number or the "lba" typo is kept in the note too, for review
    if (groups) return { rows: groups.map(group => ({ weightEffort, ...group })), exact: /^lbs?$/i.test(weighted[2] || '') }
    // Reps followed by words: "10 (right leg)", "6 failed due to quads"
    const leading = rest.match(/^([\dx,\s]*\d)\b(.*)$/i)
    const leadingGroups = leading && readReps(leading[1])
    if (leadingGroups) return { rows: leadingGroups.map(group => ({ weightEffort, ...group })), exact: false }
    return { rows: [{ weightEffort, sets: null, reps: null }], exact: false }
  }

  // Bodyweight: "3x8", "20", "2x15, 10", "12,8,10"
  const groups = readReps(value)
  if (groups) return { rows: groups.map(group => ({ weightEffort: null, ...group })), exact: true }
  const leading = value.match(/^([\dx,\s]*\d)\b(.*)$/i)
  const leadingGroups = leading && readReps(leading[1])
  if (leadingGroups) return { rows: leadingGroups.map(group => ({ weightEffort: null, ...group })), exact: false }
  return { rows: [], exact: false }
}

/**
 * A whole cell: its groups, in order.
 * @param {string} text
 * @returns {{rows: Array<Object>, exact: boolean}}
 */
export const readCell = text => {
  // "120lbs, 8: 125lbs, 8" uses ":" between groups where ";" was meant (a time like 2:00 never has a comma before it)
  const groups = text.split(/;|:(?=\s*\d+(?:\.\d+)?\s*lbs)/i).map(group => group.trim()).filter(Boolean)
  const read = groups.map(readGroup)
  return { rows: read.flatMap(group => group.rows), exact: read.every(group => group.exact) && read.length > 0 }
}

/**
 * A sheet's CSV as workouts.
 * @param {string} text
 * @param {string} area The sheet's body area, e.g. 'upper'.
 * @returns {{exercises: Array<{name: string, area: string, original: string}>, workouts: Array<Object>, problems: string[]}}
 */
export const parseSheet = (text, area) => {
  const [header = [], ...rows] = parseCsv(text)
  const problems = []
  const dates = header.map((cell, column) => {
    if (column === 0) return null
    const value = cell.trim()
    const date = value.match(/^(\d{4}-\d{2}-\d{2})\.?$/)
    if (date && date[1] !== value) problems.push(`${area}: date "${value}" read as ${date[1]}`)
    if (!date && value) problems.push(`${area}: column ${column + 1} has "${value}", not a date; its cells are skipped`)
    return date ? date[1] : null
  })
  // Dates run newest first. One that breaks the order while its neighbours keep it (2026-02-18, 2025-02-14,
  // 2026-02-11) is a typo: when the neighbours' year makes it fit, that's the date used, and it's reported
  const columns = dates.map((date, column) => date ? column : null).filter(column => column !== null)
  columns.forEach((column, index) => {
    const date = dates[column]
    const previous = dates[columns[index - 1]]
    const next = dates[columns[index + 1]]
    const outOfOrder = (previous && date > previous) || (next && date < next)
    if (!outOfOrder || (previous && next && previous < next)) return
    const neighbourYear = (previous || next).slice(0, 4)
    const fixed = `${neighbourYear}${date.slice(4)}`
    if ((!previous || fixed <= previous) && (!next || fixed >= next)) {
      problems.push(`${area}: date ${date} is out of order between ${previous} and ${next}; read as ${fixed}`)
      dates[column] = fixed
    } else {
      problems.push(`${area}: date ${date} is out of order between ${previous} and ${next}; kept as written`)
    }
  })
  const exercises = []
  const workouts = []
  rows.forEach((row, rowIndex) => {
    const original = (row[0] || '').trim()
    if (!original) return
    const name = cleanName(original)
    exercises.push({ name, area, original })
    row.slice(1).forEach((cell, index) => {
      const text = cell.trim()
      if (!text) return
      const date = dates[index + 1]
      if (!date) {
        problems.push(`${area}: "${name}" has "${text}" under column ${index + 2}, which has no date; skipped`)
        return
      }
      const { rows: read, exact } = readCell(text)
      if (!exact) problems.push(`${area}: ${date} ${name}: "${text}" read as ${read.length ? read.map(each => `${each.weightEffort || 'bodyweight'} ${each.sets ?? '?'}x${each.reps ?? '?'}`).join(', ') : 'nothing'}; the cell's text is kept in the note`)
      read.forEach(each => workouts.push({ date, exercise: name, area, row: rowIndex, ...each, note: exact ? null : text }))
      if (!read.length) workouts.push({ date, exercise: name, area, row: rowIndex, weightEffort: null, sets: null, reps: null, note: text })
    })
  })
  return { exercises, workouts, problems }
}

/** Equipment guessed from an exercise's name, checked in order; a name can match several. */
const equipmentRules = [
  [/dumbbell|zottman|hammer curl|arnold press(?!.*cable)|wrist curl|shoulder 6 ways/i, 'dumbbells'],
  [/barbell|romanian deadlift(?!.*dumbbell)|hip thrust/i, 'barbell'],
  [/ez-bar/i, 'EZ bar'],
  [/t-bar/i, 'T-bar row'],
  [/kettlebell|kickstand rdl/i, 'kettlebell'],
  [/cable|pulley|pushdown|face pull(?!.*trx)/i, 'cable machine'],
  [/smith/i, 'Smith machine'],
  [/trx/i, 'suspension trainer (TRX)'],
  [/\bmts\b|machine|chest press|leg press|leg extension|leg curl|pec fly|pulldown|abduction|adduction|hack squat|v-squat|horizontal calf|seated calf|ab core|abdominal crunch|rear delt(?!.*cable)|mid row|high row|iso-lateral|lat pulldown|shoulder press(?!.*dumbbell)/i, 'machine'],
  [/incline|decline press|bench press|chest press(?!.*machine)|preacher|seated dip|triceps extension|dumbbell rows|bulgarian/i, 'bench'],
  [/dips?\b/i, 'dip bars'],
  [/pull-?ups?|chin|hanging|monkey bars|mixed grip leg raises/i, 'pull-up bar'],
  [/captain'?s chair/i, "captain's chair"],
  [/ab wheel/i, 'ab wheel'],
  [/back extension/i, 'back extension bench'],
  [/decline crunch/i, 'decline bench'],
  [/ball pass/i, 'exercise ball']
]

/**
 * Equipment an exercise probably uses, from its name. A guess for Joshua to review; an empty list means bodyweight
 * or unknown.
 * @param {string} name
 * @returns {string[]}
 */
export const guessEquipment = name => {
  const found = []
  for (const [pattern, equipment] of equipmentRules) {
    if (pattern.test(name) && !found.includes(equipment)) found.push(equipment)
  }
  const saysMachine = /\bmts\b|machine|iso-lateral/i.test(name)
  // Free weights only count as a machine exercise when the name says so ("Dumbbell Chest Press" isn't)
  if (found.includes('machine') && !saysMachine && (found.includes('dumbbells') || found.includes('barbell'))) found.splice(found.indexOf('machine'), 1)
  // Cable work is done standing at the machine, not on a bench
  if (found.includes('cable machine') && found.includes('bench')) found.splice(found.indexOf('bench'), 1)
  // A machine press isn't also a bench exercise
  if (found.includes('machine') && found.includes('bench') && (saysMachine || /chest press/i.test(name))) found.splice(found.indexOf('bench'), 1)
  return found
}
