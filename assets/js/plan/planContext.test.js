import { buildPlanContext, estimateMax } from './planContext.js'
import { fixtureGoal, fixtureProfile, fixtureRows, fixtureToday } from './planFixture.js'

const build = (overrides = {}) => buildPlanContext({
  goal: fixtureGoal(),
  profile: fixtureProfile(),
  rows: fixtureRows(),
  today: fixtureToday(),
  ...overrides
})

describe('estimateMax', () => {
  test('Epley: weight x (1 + reps / 30); one rep is the weight', () => {
    expect(estimateMax(150, 10)).toBe(200)
    expect(estimateMax(200, 1)).toBe(200)
  })
})

describe('buildPlanContext', () => {
  test('keeps only exercises the gym has all the equipment for, by name', () => {
    expect(build().exercises.map(exercise => exercise.id)).toEqual(['bench', 'squat', 'pullup'])
  })

  test('leaves out the no-go exercises', () => {
    const profile = { ...fixtureProfile(), avoid: ['squat'] }
    expect(build({ profile }).exercises.map(exercise => exercise.id)).toEqual(['bench', 'pullup'])
  })

  test('names the loaded equipment, or null for bodyweight', () => {
    const { exercises } = build()
    expect(exercises.find(exercise => exercise.id === 'bench')).toMatchObject({ equipment: ['barbell', 'bench'], loadedEquipment: 'barbell' })
    expect(exercises.find(exercise => exercise.id === 'pullup')).toMatchObject({ equipment: ['pull_up_bar'], loadedEquipment: null })
  })

  test('lists muscles by share, regions under their muscle\'s name', () => {
    const bench = build().exercises.find(exercise => exercise.id === 'bench')
    expect(bench.muscles).toEqual([
      { muscleId: '15', name: 'Pectorals: Mid and lower chest', share: 100 },
      { muscleId: '14', name: 'Triceps', share: 50 }
    ])
  })

  test('the last session and estimated max ignore workouts after today', () => {
    const bench = build().exercises.find(exercise => exercise.id === 'bench')
    expect(bench.last).toEqual({ date: '2026-11-23', sets: 3, reps: 5, weight: { amount: 165, unit: 'lbs' } })
    // 165 x (1 + 5/30) = 192.5
    expect(bench.estimatedMax).toEqual({ amount: 192.5, unit: 'lbs' })
  })

  test('estimated maxes are in the profile\'s unit', () => {
    const squat = build().exercises.find(exercise => exercise.id === 'squat')
    // 100 kg = 220.46 lbs, x (1 + 8/30)
    expect(squat.estimatedMax).toEqual({ amount: 279.3, unit: 'lbs' })
    expect(build().exercises.find(exercise => exercise.id === 'pullup').estimatedMax).toBeNull()
  })

  test('the goal carries its exercise, the max now and the max it needs', () => {
    expect(build().goal).toMatchObject({
      exerciseId: 'bench',
      name: 'Barbell bench press',
      estimatedMax: { amount: 192.5, unit: 'lbs' },
      targetMax: { amount: 204.2, unit: 'lbs' }
    })
  })

  test('includes muscle priority for every muscle the plan can target', () => {
    const { musclePriority } = build()
    expect(musclePriority.map(row => row.name)).toEqual(expect.arrayContaining(['Pectorals: Mid and lower chest', 'Quadriceps', 'Latissimus Dorsi', 'Triceps']))
    // a parent with regions is ranked by its regions
    expect(musclePriority.map(row => row.name)).not.toContain('Pectorals')
    musclePriority.forEach(row => expect(typeof row.muscleId).toBe('string'))
  })
})
