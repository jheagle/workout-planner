import { claudePlanModel, PlanModelError } from './planModel.js'

// A stand-in for the Anthropic client: records the request, replies with the given message, and plays its content
// blocks to the stream's listeners first (a block start, then its text in two halves), like a real stream
const fakeStream = message => {
  const listeners = { streamEvent: [], text: [] }
  const emit = (name, value) => listeners[name].forEach(listener => listener(value))
  return {
    on (name, listener) {
      listeners[name].push(listener)
      return this
    },
    finalMessage: async () => {
      message.content.forEach(block => {
        emit('streamEvent', { type: 'content_block_start', content_block: block })
        if (block.type !== 'text') return
        const half = Math.ceil(block.text.length / 2)
        emit('text', block.text.slice(0, half))
        emit('text', block.text.slice(half))
      })
      return message
    }
  }
}

const fakeClient = message => {
  const calls = []
  return {
    calls,
    beta: { messages: { stream: params => { calls.push(params); return fakeStream(message) } } }
  }
}

const reply = (overrides = {}) => ({
  model: 'claude-opus-5-5',
  stop_reason: 'end_turn',
  usage: { input_tokens: 100, output_tokens: 50 },
  content: [{ type: 'thinking', thinking: '', signature: 'abc' }, { type: 'text', text: '{"summary":"s","weeks":[]}' }],
  ...overrides
})

const request = { system: 'rules', messages: [{ role: 'user', content: 'go' }], schema: { type: 'object' } }

describe('claudePlanModel', () => {
  test('asks for structured output with the schema, the effort and the fallback', async () => {
    const client = fakeClient(reply())
    await claudePlanModel({ client }).propose(request)
    expect(client.calls[0]).toEqual({
      model: 'claude-opus-5-5',
      max_tokens: 64000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'high', format: { type: 'json_schema', schema: { type: 'object' } } },
      system: 'rules',
      messages: request.messages
    })
  })

  test('returns the parsed plan and the content exactly as it came', async () => {
    const result = await claudePlanModel({ client: fakeClient(reply()) }).propose(request)
    expect(result.plan).toEqual({ summary: 's', weeks: [] })
    expect(result.content).toEqual(reply().content)
    expect(result).toMatchObject({ model: 'claude-opus-5-5', usage: { input_tokens: 100, output_tokens: 50 } })
  })

  test('a decline or running out of tokens is a PlanModelError with the reason', async () => {
    const declined = claudePlanModel({ client: fakeClient(reply({ stop_reason: 'refusal', stop_details: { explanation: 'no' } })) })
    await expect(declined.propose(request)).rejects.toMatchObject({ name: 'PlanModelError', reason: 'refusal', message: 'the model declined: no' })
    const cut = claudePlanModel({ client: fakeClient(reply({ stop_reason: 'max_tokens' })), maxTokens: 10 })
    await expect(cut.propose(request)).rejects.toBeInstanceOf(PlanModelError)
  })

  test('a reply that isn\'t JSON gives a null plan', async () => {
    const client = fakeClient(reply({ content: [{ type: 'text', text: 'not json' }] }))
    expect((await claudePlanModel({ client }).propose(request)).plan).toBeNull()
  })

  test('onProgress hears the request go out, the thinking, and the plan being written', async () => {
    const heard = []
    const model = claudePlanModel({ client: fakeClient(reply()), onProgress: progress => heard.push(progress) })
    await model.propose(request)
    const text = '{"summary":"s","weeks":[]}'
    expect(heard).toEqual([
      { phase: 'sent', characters: 0 },
      { phase: 'thinking', characters: 0 },
      { phase: 'writing', characters: 0 },
      { phase: 'writing', characters: Math.ceil(text.length / 2) },
      { phase: 'writing', characters: text.length }
    ])
  })
})
