import { buildPlanContext } from './planContext.js'
import { checkGoal, checkPlan, formatErrors } from './planChecks.js'
import { fixtureGoal, fixtureProfile, fixtureRows, fixtureToday, validPlan } from './planFixture.js'

const contextFor = ({ goal = fixtureGoal(), profile = fixtureProfile() } = {}) =>
  buildPlanContext({ goal, profile, rows: fixtureRows(), today: fixtureToday() })

// The valid plan with one change made to it
const planWith = change => {
  const plan = validPlan()
  change(plan)
  return plan
}

const paths = errors => errors.map(error => error.path)

describe('checkGoal', () => {
  test('a realistic goal on an exercise the gym allows passes', () => {
    expect(checkGoal(fixtureGoal(), contextFor())).toEqual([])
  })

  test('rejects an exercise the gym can\'t do, and weeks, reps or weight out of range', () => {
    const goal = { exerciseId: 'treadmill-sprint', weight: { amount: 0, unit: 'stone' }, reps: 25, weeks: 2 }
    expect(paths(checkGoal(goal, contextFor({ goal })))).toEqual(['goal.exerciseId', 'goal.weeks', 'goal.reps', 'goal.weight'])
  })

  test('rejects a goal too far above the estimated max for its weeks', () => {
    // 225 x 5 needs about 262; 192.5 now, 4 weeks reach about 208
    const goal = { ...fixtureGoal(), weight: { amount: 225, unit: 'lbs' } }
    const errors = checkGoal(goal, contextFor({ goal }))
    expect(paths(errors)).toEqual(['goal'])
    expect(errors[0].message).toMatch(/about 262\.5 lbs.*192\.5.*about 207\.9/)
  })

  test('pace depends on the phase: a cut climbs slowly', () => {
    const profile = { ...fixtureProfile(), phases: [{ phase: 'cut', from: '2026-11-01' }] }
    const errors = checkGoal(fixtureGoal(), contextFor({ profile }))
    expect(errors[0].message).toMatch(/4 weeks \(all cut\) can realistically reach about 196\.4/)
    // 180 x 5 needs about 210: out of reach in maintain (about 207.9), in reach in a bulk (about 211.8)
    const goal = { ...fixtureGoal(), weight: { amount: 180, unit: 'lbs' } }
    expect(paths(checkGoal(goal, contextFor({ goal })))).toEqual(['goal'])
    const bulk = { ...fixtureProfile(), phases: [{ phase: 'bulk', from: '2026-11-01' }] }
    expect(checkGoal(goal, contextFor({ goal, profile: bulk }))).toEqual([])
  })

  test('a goal with no history to estimate from is not judged on pace', () => {
    const goal = { exerciseId: 'pullup', weight: { amount: 25, unit: 'lbs' }, reps: 8, weeks: 6 }
    expect(checkGoal(goal, contextFor({ goal }))).toEqual([])
  })
})

describe('checkPlan', () => {
  test('the valid plan passes', () => {
    expect(checkPlan(validPlan(), contextFor())).toEqual([])
  })

  test('the number of weeks must match the goal, numbered from 1', () => {
    expect(paths(checkPlan(planWith(plan => plan.weeks.pop()), contextFor()))).toEqual(['weeks'])
    expect(paths(checkPlan(planWith(plan => { plan.weeks[1].week = 5 }), contextFor()))).toEqual(['weeks[1].week'])
  })

  test('no more training days than the profile allows, each on its own weekday', () => {
    const tooMany = planWith(plan => plan.weeks[0].days.push({ ...plan.weeks[0].days[0], dayOfWeek: 7 }))
    expect(paths(checkPlan(tooMany, contextFor()))).toContain('weeks[0].days')
    const twice = planWith(plan => { plan.weeks[0].days[1].dayOfWeek = 1 })
    expect(paths(checkPlan(twice, contextFor()))).toContain('weeks[0].days[1].dayOfWeek')
    const sunday8 = planWith(plan => { plan.weeks[0].days[2].dayOfWeek = 8 })
    expect(paths(checkPlan(sunday8, contextFor()))).toContain('weeks[0].days[2].dayOfWeek')
  })

  test('only exercises from the context (no-gos are left out of it)', () => {
    const unknown = planWith(plan => { plan.weeks[0].days[0].exercises[2].exerciseId = 'treadmill-sprint' })
    expect(paths(checkPlan(unknown, contextFor()))).toEqual(['weeks[0].days[0].exercises[2].exerciseId'])
  })

  test('sets and reps in range', () => {
    const plan = planWith(plan => {
      plan.weeks[0].days[0].exercises[2].sets = 0
      plan.weeks[0].days[0].exercises[2].reps = 2.5
    })
    expect(paths(checkPlan(plan, contextFor()))).toEqual(['weeks[0].days[0].exercises[2].sets', 'weeks[0].days[0].exercises[2].reps'])
  })

  test('a weight the equipment can\'t make names the nearest it can', () => {
    const plan = planWith(plan => { plan.weeks[0].days[0].exercises[0].weight.amount = 167.5 })
    const errors = checkPlan(plan, contextFor())
    expect(paths(errors)).toEqual(['weeks[0].days[0].exercises[0].weight'])
    expect(errors[0].message).toMatch(/can't make 167\.5 lbs.*steps of 5.*nearest is 170 lbs/)
  })

  test('a weight in the wrong unit is an error, even when it converts close', () => {
    const plan = planWith(plan => { plan.weeks[0].days[0].exercises[1].weight = { amount: 102.5, unit: 'kg' } })
    expect(paths(checkPlan(plan, contextFor()))).toEqual(['weeks[0].days[0].exercises[1].weight'])
  })

  test('loaded exercises need their equipment and a weight; bodyweight ones take neither', () => {
    const plan = planWith(plan => {
      plan.weeks[0].days[0].exercises[0].weight = null
      plan.weeks[0].days[0].exercises[0].equipmentId = 'bench'
      plan.weeks[0].days[0].exercises[2].weight = { amount: 10, unit: 'lbs' }
    })
    expect(paths(checkPlan(plan, contextFor()))).toEqual([
      'weeks[0].days[0].exercises[0].equipmentId',
      'weeks[0].days[0].exercises[0].weight',
      'weeks[0].days[0].exercises[2].weight'
    ])
  })

  test('a session must fit its time', () => {
    const profile = { ...fixtureProfile(), sessionMinutes: 30 }
    // 9 sets: 10 + 22.5 minutes (the taper week's 6 sets fit)
    const errors = checkPlan(validPlan(), contextFor({ profile }))
    expect(errors).toHaveLength(9)
    expect(errors[0]).toEqual({ path: 'weeks[0].days[0].exercises', message: '9 sets take about 32.5 minutes; the session is 30' })
  })

  test('at most the weekly sets per muscle, counting each muscle\'s share', () => {
    const plan = planWith(plan => plan.weeks[0].days.forEach(day => { day.exercises[2].sets = 8 }))
    const errors = checkPlan(plan, contextFor())
    expect(errors.find(error => /Latissimus/.test(error.message))).toEqual({
      path: 'weeks[0]', message: 'Latissimus Dorsi gets 24 weighted sets; at most 20 a week'
    })
  })

  test('no muscle worked hard on two days in a row, across weeks too', () => {
    const backToBack = planWith(plan => { plan.weeks[1].days[1].dayOfWeek = 2 })
    expect(checkPlan(backToBack, contextFor()).map(error => error.message)).toEqual(expect.arrayContaining([
      expect.stringMatching(/Quadriceps is worked hard .* two days in a row \(day 2\)/)
    ]))
    // Sunday then Monday
    const overTheWeekend = planWith(plan => { plan.weeks[0].days[2].dayOfWeek = 7 })
    expect(paths(checkPlan(overTheWeekend, contextFor()))).toContain('weeks[1]')
    // Triceps get 1.5 weighted sets a day from the bench: not a hard day
    expect(checkPlan(backToBack, contextFor()).some(error => /Triceps/.test(error.message))).toBe(false)
  })

  test('the top weight may rise at most 10% (or one step) a week, from the last session', () => {
    const jump = planWith(plan => plan.weeks[2].days.forEach(day => { day.exercises[0].weight.amount = 195 }))
    const errors = checkPlan(jump, contextFor())
    expect(errors[0]).toEqual({
      path: 'weeks[2].days[0].exercises[0].weight',
      message: 'Barbell bench press jumps from 170 to 195 lbs after week 2; at most 187 lbs in a maintain week'
    })
    const fromHistory = planWith(plan => plan.weeks[0].days.forEach(day => { day.exercises[0].weight.amount = 185 }))
    expect(checkPlan(fromHistory, contextFor())[0].message).toMatch(/jumps from 165 to 185 lbs after the last session; at most 181\.5/)
  })

  test('one step is always allowed, even above 10%', () => {
    const profile = { ...fixtureProfile(), equipment: { ...fixtureProfile().equipment, barbell: { unit: 'lbs', min: 45, step: 25 } } }
    const plan = planWith(plan => plan.weeks.forEach((week, index) => week.days.forEach(day => {
      day.exercises[0].weight.amount = [170, 170, 195, 195][index]
      day.exercises[1].weight.amount = 220
    })))
    const goal = { ...fixtureGoal(), weight: { amount: 170, unit: 'lbs' } }
    expect(checkPlan(plan, contextFor({ goal, profile }))).toEqual([])
  })

  test('the last week must test the goal', () => {
    const short = planWith(plan => plan.weeks[3].days.forEach(day => { day.exercises[0].weight.amount = 170 }))
    expect(checkPlan(short, contextFor())).toEqual([{
      path: 'weeks[3]', message: 'the last week must test the goal: Barbell bench press for 5 reps at 175 lbs or more'
    }])
  })

  test('the taper week has at most 70% of the sets of the build week before it', () => {
    const plan = planWith(plan => plan.weeks[2].days.forEach(day => day.exercises.forEach(item => { item.sets = 3 })))
    expect(checkPlan(plan, contextFor())).toEqual([{ path: 'weeks[2]', message: 'week 3 is a taper week: at most 18 sets (70% of week 2\'s 27); it has 27' }])
  })

  test('the weights may climb more slowly in a cut', () => {
    const profile = { ...fixtureProfile(), phases: [{ phase: 'cut', from: '2026-11-01' }] }
    // 165 to 170 is one step: allowed; 170 to 180 is above 5% and above one step
    const plan = planWith(plan => [2, 3].forEach(week => plan.weeks[week].days.forEach(day => { day.exercises[0].weight.amount = 180 })))
    const goal = { ...fixtureGoal(), weight: { amount: 160, unit: 'lbs' } }
    expect(checkPlan(plan, contextFor({ goal, profile }))[0]).toEqual({
      path: 'weeks[2].days[0].exercises[0].weight',
      message: 'Barbell bench press jumps from 170 to 180 lbs after week 2; at most 178.5 lbs in a cut week'
    })
  })

  test('must-include exercises appear every week', () => {
    const profile = { ...fixtureProfile(), mustInclude: ['pullup'] }
    const plan = planWith(plan => plan.weeks[2].days.forEach(day => day.exercises.pop()))
    expect(checkPlan(plan, contextFor({ profile }))).toEqual([{ path: 'weeks[2].days', message: 'must include Pull-up every week' }])
  })

  test('a plan with no weeks at all is an error, not a crash', () => {
    expect(paths(checkPlan({ summary: '' }, contextFor()))).toEqual(['weeks'])
    expect(paths(checkPlan(null, contextFor()))).toEqual(['weeks'])
  })
})

describe('checkPlan with lighter weeks', () => {
  const goal = { ...fixtureGoal(), weeks: 8 }
  const context = () => contextFor({ goal })
  // Week 4 is lighter, 7 the taper, 8 the test
  const longPlan = () => ({
    summary: 'Eight weeks with a lighter week 4.',
    weeks: [
      [165, 225, 3], [170, 230, 3], [170, 235, 3], [165, 230, 1],
      [175, 240, 3], [175, 245, 3], [175, 250, 2], [175, 250, 3]
    ].map(([bench, squat, sets], index) => ({
      week: index + 1,
      days: validPlan().weeks[0].days.map(day => ({
        dayOfWeek: day.dayOfWeek,
        exercises: day.exercises.map(item => ({
          ...item,
          sets,
          weight: item.weight && { ...item.weight, amount: item.exerciseId === 'bench' ? bench : squat }
        }))
      }))
    }))
  })
  const longPlanWith = change => {
    const plan = longPlan()
    change(plan)
    return plan
  }

  test('a plan that follows the schedule passes', () => {
    expect(context().schedule.map(week => week.kind)).toEqual(['build', 'build', 'build', 'lighter', 'build', 'build', 'taper', 'test'])
    expect(checkPlan(longPlan(), context())).toEqual([])
  })

  test('a lighter week has at most 60% of the sets', () => {
    const plan = longPlanWith(plan => plan.weeks[3].days.forEach(day => day.exercises.forEach(item => { item.sets = 2 })))
    expect(checkPlan(plan, context())).toEqual([{ path: 'weeks[3]', message: 'week 4 is a lighter week: at most 16 sets (60% of week 3\'s 27); it has 18' }])
  })

  test('a lighter week is no heavier than the build week before it', () => {
    const plan = longPlanWith(plan => plan.weeks[3].days.forEach(day => { day.exercises[0].weight.amount = 175 }))
    expect(checkPlan(plan, context())).toEqual(expect.arrayContaining([{
      path: 'weeks[3].days[0].exercises[0].weight',
      message: 'Barbell bench press is heavier than in week 3 (170 lbs); a lighter week keeps it there or below'
    }]))
  })

  test('after a lighter week the climb carries on from the build week before it', () => {
    // 135 in the lighter week; 175 in week 5 is a jump from 170 (week 3), not from 135
    const plan = longPlanWith(plan => plan.weeks[3].days.forEach(day => { day.exercises[0].weight.amount = 135 }))
    expect(checkPlan(plan, context())).toEqual([])
  })
})

describe('formatErrors', () => {
  test('one line each, the field first', () => {
    expect(formatErrors([{ path: 'weeks[0]', message: 'too much' }, { path: '', message: 'empty' }])).toBe('- weeks[0]: too much\n- plan: empty')
  })
})
