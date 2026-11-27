/**
 * Ask Claude for a plan toward one goal, on the real database and the gym profile, and print what happened: the
 * goal check, each round's errors, the token usage, and the plan (or save it with --out). A real model call: it
 * needs ANTHROPIC_API_KEY and costs money (roughly 20k tokens in and 10-20k out per round). Nothing is saved to
 * the database.
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
  const model = claudePlanModel({ model: option('model', 'claude-opus-5-5'), effort: option('effort', 'high') })
  const result = await generatePlan({ goal, profile: placeholderProfile, rows, model })

  console.log(`Goal: ${exercise.name}, ${goal.reps} x ${goal.weight.amount} ${goal.weight.unit} in ${goal.weeks} weeks`)
  console.log(`Schedule: ${result.context.schedule.map(week => `${week.week} ${week.startDate} ${week.phase} ${week.kind}`).join(' | ')}`)
  result.rounds.forEach((round, index) => {
    const { input_tokens: input = 0, output_tokens: output = 0, cache_read_input_tokens: cached = 0 } = round.usage || {}
    console.log(`Round ${index + 1} (${round.model}): ${round.errors.length} errors; tokens in ${input} (cached ${cached}), out ${output}`)
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
