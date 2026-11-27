import { buildPrompt, fixMessage, planInstructions } from './planPrompt.js'
import { LIMITS } from './planChecks.js'

describe('planInstructions', () => {
  test('states the rules with the checks\' own numbers', () => {
    const text = planInstructions()
    expect(text).toContain(`at most ${LIMITS.maxWeeklySets} a week`)
    expect(text).toContain('10% in a bulk week')
    expect(text).toContain('5% in a cut week')
    expect(text).toContain('at most 60% of the sets')
    expect(text).toContain('at most 70% of the sets')
  })
})

describe('buildPrompt', () => {
  test('the context goes first, marked for the prompt cache', () => {
    const { system, messages } = buildPrompt({ today: '2026-11-26' })
    expect(system).toBe(planInstructions())
    expect(messages).toEqual([{
      role: 'user',
      content: [
        { type: 'text', text: 'Context:\n{"today":"2026-11-26"}', cache_control: { type: 'ephemeral' } },
        { type: 'text', text: 'Write the plan.' }
      ]
    }])
  })
})

describe('fixMessage', () => {
  test('lists each error with its field', () => {
    expect(fixMessage([{ path: 'weeks[0]', message: 'too much' }]).content).toMatch(/^The checks found these problems:\n- weeks\[0\]: too much\n/)
  })
})
