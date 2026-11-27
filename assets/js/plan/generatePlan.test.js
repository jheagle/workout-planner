import { generatePlan } from './generatePlan.js'
import { fakePlanModel } from './planModel.js'
import { fixtureGoal, fixtureProfile, fixtureRows, fixtureToday, validPlan } from './planFixture.js'

const run = (model, overrides = {}) => generatePlan({
  goal: fixtureGoal(), profile: fixtureProfile(), rows: fixtureRows(), today: fixtureToday(), model, ...overrides
})

// The valid plan with the bench at 167.5 in week 1: one error, a weight the barbell can't make
const brokenPlan = () => {
  const plan = validPlan()
  plan.weeks[0].days[0].exercises[0].weight.amount = 167.5
  return plan
}

describe('generatePlan', () => {
  test('a plan that passes on the first try is returned after one call', async () => {
    const model = fakePlanModel([validPlan()])
    const result = await run(model)
    expect(result.status).toBe('ok')
    expect(result.plan).toEqual(validPlan())
    expect(result.rounds).toHaveLength(1)
    expect(model.requests).toHaveLength(1)
  })

  test('the request has the instructions, the context and the plan\'s schema', async () => {
    const model = fakePlanModel([validPlan()])
    await run(model)
    const [request] = model.requests
    expect(request.system).toMatch(/strength training plans/)
    expect(request.schema.required).toEqual(['summary', 'weeks'])
    expect(request.messages[0].content[0].text).toMatch(/^Context:\n\{"today":"2026-11-26"/)
  })

  test('errors go back once with the reply unchanged; a fixed plan is ok', async () => {
    const model = fakePlanModel([brokenPlan(), validPlan()])
    const result = await run(model)
    expect(result.status).toBe('ok')
    expect(result.rounds.map(round => round.errors.length)).toEqual([1, 0])
    const second = model.requests[1].messages
    expect(second).toHaveLength(3)
    expect(second[1]).toEqual({ role: 'assistant', content: [{ type: 'text', text: JSON.stringify(brokenPlan()) }] })
    expect(second[2].content).toMatch(/- weeks\[0\]\.days\[0\]\.exercises\[0\]\.weight: the barbell can't make 167\.5 lbs/)
  })

  test('still broken after the fix round: failed, with the last plan and its errors', async () => {
    const model = fakePlanModel([brokenPlan(), brokenPlan()])
    const result = await run(model)
    expect(result.status).toBe('failed')
    expect(result.plan).toEqual(brokenPlan())
    expect(result.errors).toHaveLength(1)
    expect(model.requests).toHaveLength(2)
  })

  test('a reply that isn\'t JSON counts as an error and gets the fix round', async () => {
    const model = fakePlanModel(['Here is your plan!', validPlan()])
    const result = await run(model)
    expect(result.status).toBe('ok')
    expect(result.rounds[0]).toMatchObject({ plan: null, errors: [{ path: '', message: 'the reply was not a JSON plan' }] })
  })

  test('fixRounds: 0 asks once', async () => {
    const model = fakePlanModel([brokenPlan()])
    expect((await run(model, { fixRounds: 0 })).status).toBe('failed')
    expect(model.requests).toHaveLength(1)
  })

  test('an unrealistic goal never reaches the model', async () => {
    const model = fakePlanModel([])
    const result = await run(model, { goal: { ...fixtureGoal(), weight: { amount: 225, unit: 'lbs' } } })
    expect(result.status).toBe('goal-rejected')
    expect(result.errors[0].path).toBe('goal')
    expect(model.requests).toHaveLength(0)
  })

  test('a chosen start date moves the schedule; a past one is rejected', async () => {
    const later = await run(fakePlanModel([validPlan()]), { goal: { ...fixtureGoal(), startDate: '2026-12-09' } })
    expect(later.context.schedule[0].startDate).toBe('2026-12-14')
    const past = await run(fakePlanModel([]), { goal: { ...fixtureGoal(), startDate: '2026-11-01' } })
    expect(past.errors).toEqual([{ path: 'goal.startDate', message: '2026-11-01 is in the past; today is 2026-11-26' }])
    const bad = await run(fakePlanModel([]), { goal: { ...fixtureGoal(), startDate: '2026-02-30' } })
    expect(bad.errors[0].path).toBe('goal.startDate')
  })
})
