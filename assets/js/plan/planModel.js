/**
 * The model behind one small interface, so the generator, the tests and later the evals don't care which model it
 * is (Claude now; maybe a cheaper specialised model later, compared by the same evals). LJS-2, 2026-11-27.
 *
 * A plan model is `{name, propose({system, messages, schema})}`; `propose` resolves to
 * `{plan, content, usage, model}`: the parsed plan (null when the reply isn't JSON), the reply's content blocks
 * exactly as they came (the fix round sends them back unchanged), the token usage and the model that answered.
 * @module planModel
 */

/**
 * Why a model gave no plan: it declined, ran out of room, or the request failed.
 */
export class PlanModelError extends Error {
  /**
   * @param {string} reason - 'refusal', 'max_tokens' or 'request'
   * @param {string} message
   */
  constructor (reason, message) {
    super(message)
    this.name = 'PlanModelError'
    this.reason = reason
  }
}

/**
 * The plan from a reply's text, or null when it isn't JSON.
 * @param {string} text
 * @returns {(Object|null)}
 */
const parsePlan = text => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Claude as a plan model: structured output with the plan's schema, streamed (a 12-week plan is long), with the
 * server-side fallback turned on so a mistaken safety decline is retried on another model instead of failing.
 * Needs credentials in the environment (ANTHROPIC_API_KEY); the SDK is loaded only when a plan is asked for.
 * @param {Object} [options]
 * @param {Object} [options.client] - an Anthropic client; injectable for tests
 * @param {string} [options.model]
 * @param {string} [options.effort] - 'low' to 'max'
 * @param {number} [options.maxTokens]
 * @param {Function} [options.onProgress] - called as the reply comes in, with `{phase, characters}`: phase 'sent'
 * (the request is out), 'thinking' or 'writing'; characters is how much of the plan has been written so far. A plan
 * takes minutes, so this is how a caller shows it is still working.
 * @returns {{name: string, propose: Function}}
 */
export const claudePlanModel = ({ client, model = 'claude-opus-5-5', effort = 'high', maxTokens = 64000, onProgress = () => {} } = {}) => {
  let anthropic = client
  return {
    name: model,
    propose: async ({ system, messages, schema }) => {
      if (!anthropic) {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        anthropic = new Anthropic()
      }
      const stream = anthropic.beta.messages.stream({
        model,
        max_tokens: maxTokens,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort, format: { type: 'json_schema', schema } },
        system,
        messages
      })
      let characters = 0
      onProgress({ phase: 'sent', characters })
      stream.on('streamEvent', event => {
        if (event.type !== 'content_block_start') return
        if (event.content_block.type === 'thinking') onProgress({ phase: 'thinking', characters })
        if (event.content_block.type === 'text') onProgress({ phase: 'writing', characters })
      })
      stream.on('text', delta => {
        characters += delta.length
        onProgress({ phase: 'writing', characters })
      })
      const message = await stream.finalMessage()
      if (message.stop_reason === 'refusal') {
        const details = message.stop_details || {}
        throw new PlanModelError('refusal', `the model declined${details.explanation ? `: ${details.explanation}` : ''}`)
      }
      if (message.stop_reason === 'max_tokens') {
        throw new PlanModelError('max_tokens', `the plan didn't fit in ${maxTokens} tokens`)
      }
      const text = message.content.filter(block => block.type === 'text').map(block => block.text).join('')
      return { plan: parsePlan(text), content: message.content, usage: message.usage, model: message.model }
    }
  }
}

/**
 * A plan model that replies with the given plans in order, for tests and the evals' mocks. It records every
 * request it gets in `requests`.
 * @param {Array<(Object|string)>} replies - a plan, or a string for a reply that isn't JSON
 * @returns {{name: string, propose: Function, requests: Array<Object>}}
 */
export const fakePlanModel = replies => {
  const requests = []
  return {
    name: 'fake',
    requests,
    propose: async request => {
      requests.push({ ...request, messages: [...request.messages] })
      if (requests.length > replies.length) throw new PlanModelError('request', 'no more fake replies')
      const reply = replies[requests.length - 1]
      const text = typeof reply === 'string' ? reply : JSON.stringify(reply)
      return { plan: parsePlan(text), content: [{ type: 'text', text }], usage: { input_tokens: 0, output_tokens: 0 }, model: 'fake' }
    }
  }
}
