/**
 * Ask Claude for a plan toward one goal, on the real database and the gym profile, and print what happened: the
 * goal check, each round's errors, the token usage, and the plan (or save it with --out). A real model call: it
 * needs ANTHROPIC_API_KEY and costs money (roughly 20k tokens in and 10-20k out per round). Nothing is saved to
 * the database. While the model works (minutes, at high effort) it shows which round it is on, how long it has
 * taken and how much of the plan is written.
 *
 * The key: npm run plan reads ANTHROPIC_API_KEY from ~/.config/anthropic/env (a line ANTHROPIC_API_KEY=...),
 * outside the project so it can't be committed; a key already in the environment wins.
 *
 *   node scripts/generate-plan.js --exercise "Barbell bench press" --weight 225 --unit lbs --reps 1 --weeks 12
 *     [--start 2026-12-07] [--effort high] [--model claude-opus-5-5] [--out plan.json] [--database database/]
 *
 * --exercise takes an exercise's name (any case) or its id. --start picks the week the plan starts (its Monday);
 * without it, the Monday after today.
 */
import { writeFile } from 'node:fs/promises'
import { configure, query } from 'json-fs-query'
import { readPlanRows } from '../assets/js/plan/planContext.js'
import { placeholderProfile } from '../assets/js/plan/gymProfile.js'
import { generatePlan } from '../assets/js/plan/generatePlan.js'
import { claudePlanModel } from '../assets/js/plan/planModel.js'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}

configure({ databasePath: option('database', 'database/') })

/**
 * Shows the model's progress on one line: rewritten in place in a terminal, one line per change of phase otherwise
 * (a log file shouldn't fill with updates).
 * @returns {{onProgress: Function, done: Function}}
 */
const progressLine = () => {
  const live = process.stdout.isTTY
  let round = 0
  let started = 0
  let lastPhase = ''
  let lastShown = 0
  const show = (text, force) => {
    if (live && (force || Date.now() - lastShown >= 1000)) {
      process.stdout.write(`\r\x1b[K${text}`)
      lastShown = Date.now()
    } else if (!live && force) console.log(text)
  }
  return {
    onProgress: ({ phase, characters }) => {
      if (phase === 'sent') {
        round++
        started = Date.now()
      }
      const seconds = Math.round((Date.now() - started) / 1000)
      const what = { sent: 'waiting for the model', thinking: 'thinking', writing: `writing the plan (${characters.toLocaleString()} characters)` }[phase]
      show(`Round ${round}: ${what}, ${seconds}s`, phase !== lastPhase)
      lastPhase = phase
    },
    done: () => {
      if (live && lastShown) process.stdout.write('\r\x1b[K')
    }
  }
}

const main = async () => {
  const rows = await readPlanRows(query)
  const wanted = String(option('exercise', '')).toLowerCase()
  const exercise = rows.exercises.find(row => String(row._id) === wanted || String(row.name).toLowerCase() === wanted)
  if (!exercise) throw new Error(`No exercise named "${option('exercise', '')}"; give its exact name or id`)

  const goal = {
    exerciseId: String(exercise._id),
    weight: { amount: Number(option('weight')), unit: option('unit', placeholderProfile.unit) },
    reps: Number(option('reps', 1)),
    weeks: Number(option('weeks', 8)),
    startDate: option('start')
  }
  const progress = progressLine()
  const model = claudePlanModel({ model: option('model', 'claude-opus-5-5'), effort: option('effort', 'high'), onProgress: progress.onProgress })
  const result = await generatePlan({ goal, profile: placeholderProfile, rows, model })
  progress.done()

  console.log(`Goal: ${exercise.name}, ${goal.reps} x ${goal.weight.amount} ${goal.weight.unit} in ${goal.weeks} weeks`)
  console.log(`Schedule: ${result.context.schedule.map(week => `${week.week} ${week.startDate} ${week.phase} ${week.kind}`).join(' | ')}`)
  result.rounds.forEach((round, index) => {
    const usage = round.usage || {}
    const tokens = name => (usage[name] || 0).toLocaleString()
    // Input is three parts: uncached, written to the cache (first round) and read from it (the fix round)
    console.log(`Round ${index + 1} (${round.model}): ${round.errors.length} errors; tokens in ${tokens('input_tokens')} ` +
      `+ cache write ${tokens('cache_creation_input_tokens')} + cache read ${tokens('cache_read_input_tokens')}, out ${tokens('output_tokens')}`)
  })
  console.log(`Status: ${result.status}${result.reason ? ` (${result.reason})` : ''}`)
  result.errors.forEach(({ path, message }) => console.log(`  - ${path || 'plan'}: ${message}`))
  if (result.status !== 'ok') process.exitCode = 1
  if (!result.plan) return
  const json = JSON.stringify(result.plan, null, 2)
  const out = option('out')
  if (out) {
    await writeFile(out, `${json}\n`)
    console.log(`Plan saved to ${out}`)
  } else {
    console.log(json)
  }
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
