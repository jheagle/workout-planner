import { claudePlanModel, PlanModelError } from './planModel.js'

// A stand-in for the Anthropic client: records the request, replies with the given message
const fakeClient = message => {
  const calls = []
  return {
    calls,
    beta: { messages: { stream: params => { calls.push(params); return { finalMessage: async () => message } } } }
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
})
