/**
 * Import the workout history from Joshua's Google Sheets (CSV exports) into database/.
 *
 *   node scripts/import-sheets.js upper=path/upper.csv lower=path/lower.csv core=path/core.csv [--database database/] [--replace] [--dry-run]
 *
 * Each sheet's name before `=` is its body area (a category: upper, lower, core). For every exercise row it finds or
 * creates the exercise (matched by name, ignoring case and spacing; two existing exercises are matched to their sheet
 * names, see `renames`), links its category and its guessed equipment, then adds every session as workouts rows.
 * A row identical to one already stored (same date, exercise, effort, sets and reps, counted per copy) is skipped, so
 * running it again changes nothing. Muscles aren't linked here: scripts/apply-muscle-map.js does that.
 *
 * --replace first deletes every workout dated on or after the sheets' earliest date, so the sheets are imported
 * fresh: use it after a change to how cells are read. Workouts before that date (the 2024 seed) are kept.
 *
 * It prints a report: what was added, every cell it couldn't fully read (their text is kept in the workout's note),
 * and the equipment it guessed, for review.
 */
import fs from 'fs'
import { configure, query, quote } from 'json-fs-query'
import { parseSheet, nameKey, guessEquipment } from '../assets/js/data/sheetImport.js'

/** Existing exercises whose stored names differ from the sheets' (stored name -> sheet name). */
const renames = { 'bench press': 'Barbell bench press', squat: 'Barbell Squat' }

/**
 * Sheet names that are another exercise (sheet name -> stored name), decided with Joshua (WP-1, 2026-11-26). Their
 * workouts go to that exercise, and an exercise already stored under the sheet name is merged into it.
 */
const aliases = { 'incline bench press': 'Barbell Incline Press' }

/** Single cells corrected by hand (WP-1, 2026-11-26); see parseSheet. */
const cellFixes = [
  // In a core column with no date, between 2025-08-04 and 2025-07-23: the dumbbell and bodyweight day, no machines
  { area: 'core', exercise: 'Hand-to-Foot ball pass', text: '3x10', date: '2025-07-31' },
  // Chin-ups done holding an L, logged under the hold
  { area: 'core', exercise: 'Hanging L Sit', text: '3x10 chin-ups', moveTo: 'L-sit Chin-ups', moveArea: 'upper' }
]

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

const args = process.argv.slice(2)
const option = name => {
  const index = args.indexOf(name)
  return index === -1 ? null : args[index + 1]
}
const dryRun = args.includes('--dry-run')
const replace = args.includes('--replace')
const databasePath = option('--database') || 'database/'
const sheets = args.filter(arg => arg.includes('=')).map(arg => {
  const [area, file] = arg.split('=')
  return { area, file }
})
if (!sheets.length) {
  console.error('Usage: node scripts/import-sheets.js upper=upper.csv lower=lower.csv core=core.csv [--database database/] [--dry-run]')
  process.exit(1)
}

const parsed = { exercises: [], workouts: [], problems: [] }
for (const { area, file } of sheets) {
  const result = parseSheet(fs.readFileSync(file, 'utf8'), area, cellFixes)
  for (const key of Object.keys(parsed)) parsed[key].push(...result[key])
}
const aliased = name => aliases[nameKey(name)] ?? name
parsed.exercises.forEach(exercise => { exercise.name = aliased(exercise.name) })
parsed.workouts.forEach(workout => { workout.exercise = aliased(workout.exercise) })

configure({ databasePath })
const run = async () => {
  await query(`create if not exists categories (_id string, name string, kind string, primary key (_id));
    create if not exists exercise_category (_id string auto, exercise_id string, category_id string, primary key (_id),
      foreign key (exercise_id) references exercises (_id), foreign key (category_id) references categories (_id));
    create if not exists equipment (_id string, name string, primary key (_id));
    create if not exists exercise_equipment (_id string auto, exercise_id string, equipment_id string, primary key (_id),
      foreign key (exercise_id) references exercises (_id), foreign key (equipment_id) references equipment (_id))`)

  const report = { exercisesAdded: [], exercisesRenamed: [], workoutsAdded: 0, workoutsSkipped: 0, equipment: [] }

  // Exercises: existing ones by name (renamed where the sheet calls them something else), new ones created
  const [storedExercises] = await query('read exercises')
  const byKey = new Map(storedExercises.map(exercise => [nameKey(exercise.name), exercise]))
  for (const [storedKey, sheetName] of Object.entries(renames)) {
    const exercise = byKey.get(storedKey)
    if (!exercise || byKey.has(nameKey(sheetName))) continue
    if (!dryRun) await query(`update exercises set name = ${quote(sheetName)} where _id = ${quote(String(exercise._id))}`)
    report.exercisesRenamed.push(`${exercise.name} -> ${sheetName}`)
    byKey.delete(storedKey)
    byKey.set(nameKey(sheetName), { ...exercise, name: sheetName })
  }
  // Merge an exercise stored under an alias into the exercise it is: its workouts move, its links go
  report.exercisesMerged = []
  for (const [aliasKey, targetName] of Object.entries(aliases)) {
    const alias = byKey.get(aliasKey)
    const target = byKey.get(nameKey(targetName))
    if (!alias || !target) continue
    const aliasId = quote(String(alias._id))
    if (!dryRun) {
      await query(`update workouts set exercise_id = ${quote(String(target._id))} where exercise_id = ${aliasId}`)
      for (const link of ['exercise_category', 'exercise_equipment', 'exercise_muscle']) await query(`delete ${link} where exercise_id = ${aliasId}`)
      await query(`delete exercises where _id = ${aliasId}`)
    }
    report.exercisesMerged.push(`${alias.name} -> ${target.name}`)
    byKey.delete(aliasKey)
  }

  if (replace) {
    const earliest = parsed.workouts.map(workout => workout.date).sort()[0]
    const [old] = await query(`read workouts where date >= ${quote(earliest)}`)
    if (!dryRun) await query(`delete workouts where date >= ${quote(earliest)}`)
    report.workoutsReplaced = old.length
  }

  const seen = new Set()
  for (const { name, area, original } of parsed.exercises) {
    const key = nameKey(name)
    if (!byKey.has(key)) {
      const [rows] = dryRun ? [[{ _id: `new:${key}`, name }]] : await query(`insert exercises values name = ${quote(name)}, description = ''`)
      byKey.set(key, rows[0])
      report.exercisesAdded.push(name === original ? name : `${name} (sheet: "${original}")`)
    }
    if (seen.has(`${key}|${area}`)) continue
    seen.add(`${key}|${area}`)
    const exerciseId = String(byKey.get(key)._id)
    if (dryRun) continue
    const [category] = await query(`read categories where _id = ${quote(area)}`)
    if (!category.length) await query(`insert categories values _id = ${quote(area)}, name = ${quote(area[0].toUpperCase() + area.slice(1))}, kind = 'area'`)
    const [linked] = await query(`read exercise_category where exercise_id = ${quote(exerciseId)}`)
    if (!linked.some(link => link.category_id === area)) await query(`insert exercise_category values exercise_id = ${quote(exerciseId)}, category_id = ${quote(area)}`)
  }

  // Equipment: guessed from names, only for exercises that have none linked yet (so Joshua's corrections stay)
  for (const exercise of byKey.values()) {
    const guesses = guessEquipment(exercise.name)
    report.equipment.push(`${exercise.name}: ${guesses.length ? guesses.join(', ') : '(none guessed: bodyweight?)'}`)
    if (dryRun || !guesses.length) continue
    const exerciseId = String(exercise._id)
    const [linked] = await query(`read exercise_equipment where exercise_id = ${quote(exerciseId)}`)
    if (linked.length) continue
    for (const name of guesses) {
      const [known] = await query(`read equipment where _id = ${quote(slug(name))}`)
      if (!known.length) await query(`insert equipment values _id = ${quote(slug(name))}, name = ${quote(name)}`)
      await query(`insert exercise_equipment values exercise_id = ${quote(exerciseId)}, equipment_id = ${quote(slug(name))}`)
    }
  }

  // Workouts: one row per set group, ordered within a day by sheet (upper, lower, core) then row. A dry run with
  // --replace counts as if the replaced rows were gone
  const [readExisting] = await query('read workouts')
  const earliest = parsed.workouts.map(workout => workout.date).sort()[0]
  const existing = replace ? readExisting.filter(workout => workout.date < earliest) : readExisting
  const identity = workout => [workout.date, String(workout.exercise_id), workout.weight_effort || '', workout.sets ?? '', workout.reps ?? ''].join('|')
  // How many of each identical row are already stored: the sheet can hold the same set twice in a session
  // ("50lbs, 10; 50lbs, 10"), so a row is skipped only while the database still has an unmatched copy of it
  const stored = new Map()
  for (const workout of existing) stored.set(identity(workout), (stored.get(identity(workout)) || 0) + 1)
  const order = new Map()
  const areaRank = Object.fromEntries(sheets.map(({ area }, index) => [area, index]))
  const sorted = [...parsed.workouts].sort((a, b) => a.date.localeCompare(b.date) || areaRank[a.area] - areaRank[b.area] || a.row - b.row)
  for (const workout of sorted) {
    const row = {
      date: workout.date,
      exercise_id: String(byKey.get(nameKey(workout.exercise))._id),
      weight_effort: workout.weightEffort,
      sets: workout.sets,
      reps: workout.reps
    }
    if (stored.get(identity(row))) {
      stored.set(identity(row), stored.get(identity(row)) - 1)
      report.workoutsSkipped++
      continue
    }
    const position = (order.get(row.date) ?? existing.filter(each => each.date === row.date).length)
    order.set(row.date, position + 1)
    report.workoutsAdded++
    if (dryRun) continue
    // Optional fields are left out when there's nothing to store (the schema allows leaving them out, not null)
    const values = [`exercise_id = ${quote(row.exercise_id)}`, `order = ${position}`, `date = ${quote(row.date)}`]
    if (row.weight_effort) values.push(`weight_effort = ${quote(row.weight_effort)}`)
    if (row.sets !== null && row.sets !== undefined) values.push(`sets = ${row.sets}`)
    if (row.reps !== null && row.reps !== undefined) values.push(`reps = ${row.reps}`)
    if (workout.note) values.push(`note = ${quote(workout.note)}`)
    await query(`insert workouts values ${values.join(', ')}`)
  }

  console.log(`${dryRun ? 'Dry run: would add' : 'Added'} ${report.exercisesAdded.length} exercises and ${report.workoutsAdded} workouts (${report.workoutsSkipped} already stored, skipped).`)
  if (report.workoutsReplaced !== undefined) console.log(`${dryRun ? 'Would replace' : 'Replaced'} ${report.workoutsReplaced} workouts dated ${earliest} or later.`)
  if (report.exercisesMerged.length) console.log(`\nMerged:\n  ${report.exercisesMerged.join('\n  ')}`)
  if (report.exercisesRenamed.length) console.log(`\nRenamed to match the sheets:\n  ${report.exercisesRenamed.join('\n  ')}`)
  if (report.exercisesAdded.some(name => name.includes('(sheet:'))) console.log(`\nNames cleaned up:\n  ${report.exercisesAdded.filter(name => name.includes('(sheet:')).join('\n  ')}`)
  console.log(`\nCells to check (${parsed.problems.length}):\n  ${parsed.problems.join('\n  ')}`)
  console.log(`\nEquipment guessed from names (review; an exercise's links are only set while it has none):\n  ${report.equipment.join('\n  ')}`)
}

run().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
