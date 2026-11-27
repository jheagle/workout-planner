import { buildSchedule, parseDate, phaseOn, planStart, reachableMax } from './planSchedule.js'
import { localDate } from '../data/localDate.js'

const kinds = schedule => schedule.map(week => week.kind)

describe('planStart', () => {
  test('is the next Monday', () => {
    expect(localDate(planStart(new Date(2026, 10, 26)))).toBe('2026-11-30') // a Thursday
    expect(localDate(planStart(new Date(2026, 10, 29)))).toBe('2026-11-30') // a Sunday
  })

  test('a plan made on a Monday starts a week later', () => {
    expect(localDate(planStart(new Date(2026, 10, 30, 21, 30)))).toBe('2026-12-07')
  })

  test('a chosen start date starts on its Monday, or the Monday after it', () => {
    const today = new Date(2026, 10, 26)
    expect(localDate(planStart(today, '2026-12-07'))).toBe('2026-12-07') // a Monday: that day
    expect(localDate(planStart(today, '2026-12-05'))).toBe('2026-12-07') // a Saturday
  })
})

describe('parseDate', () => {
  test('reads real YYYY-MM-DD dates only', () => {
    expect(localDate(parseDate('2027-02-28'))).toBe('2027-02-28')
    expect(parseDate('2027-02-30')).toBeNull()
    expect(parseDate('Feb 3')).toBeNull()
  })
})

describe('phaseOn', () => {
  const phases = [{ phase: 'cut', from: '2027-03-01', to: '2027-06-30' }, { phase: 'bulk', from: '2027-08-01' }]

  test('finds the phase covering a date, both ends included', () => {
    expect(phaseOn(phases, '2027-03-01')).toBe('cut')
    expect(phaseOn(phases, '2027-06-30')).toBe('cut')
    expect(phaseOn(phases, '2028-01-01')).toBe('bulk') // no end: runs on
  })

  test('maintain outside every phase, with no calendar, or for an unknown phase', () => {
    expect(phaseOn(phases, '2027-07-15')).toBe('maintain')
    expect(phaseOn(undefined, '2027-07-15')).toBe('maintain')
    expect(phaseOn([{ phase: 'shred', from: '2027-01-01' }], '2027-07-15')).toBe('maintain')
  })
})

describe('buildSchedule', () => {
  const today = new Date(2026, 10, 26)

  test('the last week tests the goal, the one before is the taper', () => {
    expect(kinds(buildSchedule({ weeks: 4, profile: {}, today }))).toEqual(['build', 'build', 'taper', 'test'])
  })

  test('a lighter week every 4th week by default, none in the last three weeks', () => {
    expect(kinds(buildSchedule({ weeks: 8, profile: {}, today }))).toEqual(['build', 'build', 'build', 'lighter', 'build', 'build', 'taper', 'test'])
    // week 8 would be lighter, but it's two weeks before the test: the taper is enough
    expect(kinds(buildSchedule({ weeks: 10, profile: {}, today }))).toEqual([
      'build', 'build', 'build', 'lighter', 'build', 'build', 'build', 'build', 'taper', 'test'
    ])
    expect(kinds(buildSchedule({ weeks: 12, profile: {}, today })).filter(kind => kind === 'lighter')).toHaveLength(2)
  })

  test('deloadEvery sets the rhythm; 0 or null turns lighter weeks off', () => {
    expect(kinds(buildSchedule({ weeks: 6, profile: { deloadEvery: 3 }, today }))).toEqual(['build', 'build', 'lighter', 'build', 'taper', 'test'])
    expect(kinds(buildSchedule({ weeks: 8, profile: { deloadEvery: 0 }, today }))).not.toContain('lighter')
    expect(kinds(buildSchedule({ weeks: 8, profile: { deloadEvery: null }, today }))).not.toContain('lighter')
  })

  test('each week starts on a Monday, across a daylight-saving change, in the phase of that Monday', () => {
    const profile = { phases: [{ phase: 'bulk', from: '2026-08-01', to: '2027-02-28' }, { phase: 'cut', from: '2027-03-01' }] }
    const schedule = buildSchedule({ weeks: 6, profile, today: new Date(2027, 1, 10) })
    expect(schedule.map(week => week.startDate)).toEqual(['2027-02-15', '2027-02-22', '2027-03-01', '2027-03-08', '2027-03-15', '2027-03-22'])
    expect(schedule.map(week => week.phase)).toEqual(['bulk', 'bulk', 'cut', 'cut', 'cut', 'cut'])
  })

  test('no weeks for a goal with no valid length', () => {
    expect(buildSchedule({ weeks: undefined, profile: {}, today })).toEqual([])
  })
})

describe('reachableMax', () => {
  test('each week adds its phase\'s gain', () => {
    const weeks = phases => phases.map(phase => ({ phase }))
    expect(reachableMax(200, weeks(['bulk', 'bulk', 'bulk', 'bulk']))).toBeCloseTo(220)
    expect(reachableMax(200, weeks(['maintain', 'maintain', 'cut', 'cut']))).toBeCloseTo(210)
  })
})
