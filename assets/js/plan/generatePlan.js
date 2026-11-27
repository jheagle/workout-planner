/**
 * The plan generator: the model proposes, code checks. Build the context, check the goal (an unrealistic goal never
 * reaches the model), ask for a plan, check it, and when it breaks rules send the exact errors back for one fix
 * round. The result says what happened in every round, for the evals and for showing why a plan was refused.
 * LJS-2, 2026-11-27.
 * @module generatePlan
 */

import { buildPlanContext } from './planContext.js'
import { checkGoal, checkPlan } from './planChecks.js'
import { buildPrompt, fixMessage } from './planPrompt.js'
import { planSchema } from './planSchema.js'

/**
 * @typedef {Object} PlanResult
 * @property {string} status - 'ok' (the plan passes every check), 'failed' (still errors after the fix rounds),
 * 'goal-rejected' (the goal can't be planned; no model call) or 'model-error' (the model gave no plan: it declined, ran
 * out of room, or the request failed; the rounds before it are kept)
 * @property {(Plan|null)} plan - the last plan the model gave
 * @property {PlanError[]} errors - what's still wrong (none when ok)
 * @property {Array<{plan: (Plan|null), errors: PlanError[], usage: Object, model: string}>} rounds
 * @property {PlanContext} context
 * @property {string} [reason] - with 'model-error': 'refusal', 'max_tokens' or 'request'
 */

/**
 * A plan for one goal.
 * @param {Object} options
 * @param {Goal} options.goal
 * @param {GymProfile} options.profile
 * @param {PlanRows} options.rows
 * @param {{propose: Function}} options.model - see planModel.js
 * @param {Date} [options.today]
 * @param {number} [options.fixRounds] - how many times errors go back to the model (default 1)
 * @returns {Promise<PlanResult>}
 */
export const generatePlan = async ({ goal, profile, rows, model, today = new Date(), fixRounds = 1 }) => {
  const context = buildPlanContext({ goal, profile, rows, today })
  const goalErrors = checkGoal(goal, context)
  if (goalErrors.length) return { status: 'goal-rejected', plan: null, errors: goalErrors, rounds: [], context }

  const { system, messages } = buildPrompt(context)
  const rounds = []
  for (let round = 0; round <= fixRounds; round++) {
    let reply
    try {
      reply = await model.propose({ system, messages, schema: planSchema })
    } catch (error) {
      // Keep what the earlier rounds found and cost; a decline in the fix round shouldn't hide the first round
      const last = rounds[rounds.length - 1]
      return {
        status: 'model-error',
        reason: error.reason || 'request',
        plan: last ? last.plan : null,
        errors: [{ path: '', message: error.message }],
        rounds,
        context
      }
    }
    const errors = reply.plan ? checkPlan(reply.plan, context) : [{ path: '', message: 'the reply was not a JSON plan' }]
    rounds.push({ plan: reply.plan, errors, usage: reply.usage, model: reply.model })
    if (!errors.length) return { status: 'ok', plan: reply.plan, errors, rounds, context }
    // The reply goes back exactly as it came (thinking blocks included), then the errors
    if (round < fixRounds) messages.push({ role: 'assistant', content: reply.content }, fixMessage(errors))
  }
  const last = rounds[rounds.length - 1]
  return { status: 'failed', plan: last.plan, errors: last.errors, rounds, context }
}
