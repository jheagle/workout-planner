import { existsSync } from 'node:fs'
import { canMake, isLoaded, joshuaProfile, loadFor, roundToEquipment } from './gymProfile.js'

const barbell = { unit: 'lbs', min: 45, step: 5 }
const dumbbells = { unit: 'kg', min: 2.5, step: 2.5, max: 40 }

describe('isLoaded', () => {
  test('equipment with a step takes a weight; a bench does not', () => {
    expect(isLoaded(barbell)).toBe(true)
    expect(isLoaded({})).toBe(false)
    expect(isLoaded(undefined)).toBe(false)
  })
})

describe('roundToEquipment', () => {
  test('rounds to the nearest step from the lightest', () => {
    expect(roundToEquipment({ amount: 137, unit: 'lbs' }, barbell)).toEqual({ amount: 135, unit: 'lbs' })
    expect(roundToEquipment({ amount: 138, unit: 'lbs' }, barbell)).toEqual({ amount: 140, unit: 'lbs' })
  })

  test('converts to the equipment\'s unit first', () => {
    // 100 kg is 220.46 lbs
    expect(roundToEquipment({ amount: 100, unit: 'kg' }, barbell)).toEqual({ amount: 220, unit: 'lbs' })
  })

  test('stays within the lightest and the heaviest', () => {
    expect(roundToEquipment({ amount: 10, unit: 'lbs' }, barbell)).toEqual({ amount: 45, unit: 'lbs' })
    expect(roundToEquipment({ amount: 60, unit: 'kg' }, dumbbells)).toEqual({ amount: 40, unit: 'kg' })
  })

  test('handles fractional steps without floating-point noise', () => {
    expect(roundToEquipment({ amount: 18.6, unit: 'kg' }, dumbbells)).toEqual({ amount: 17.5, unit: 'kg' })
    expect(roundToEquipment({ amount: 0.7 * 3 * 10, unit: 'kg' }, dumbbells)).toEqual({ amount: 20, unit: 'kg' })
  })
})

describe('canMake', () => {
  test('only weights on the steps, in the equipment\'s unit, within its range', () => {
    expect(canMake({ amount: 135, unit: 'lbs' }, barbell)).toBe(true)
    expect(canMake({ amount: 137.5, unit: 'lbs' }, barbell)).toBe(false)
    expect(canMake({ amount: 60, unit: 'kg' }, barbell)).toBe(false)
    expect(canMake({ amount: 40, unit: 'lbs' }, barbell)).toBe(false)
    expect(canMake({ amount: 17.5, unit: 'kg' }, dumbbells)).toBe(true)
    expect(canMake({ amount: 42.5, unit: 'kg' }, dumbbells)).toBe(false)
  })
})

describe('loadFor', () => {
  const profile = {
    equipment: { barbell: { unit: 'lbs', min: 45, step: 10 }, bench: {}, machine: { unit: 'lbs', min: 10, step: 10 } },
    machines: { 'leg-curl': { equipment: 'machine', name: 'leg curl', unit: 'lbs', min: 10, step: 20 } }
  }

  test('an exercise\'s own machine comes first', () => {
    expect(loadFor(profile, 'leg-curl', ['machine'])).toEqual({ equipmentId: 'machine', load: { name: 'leg curl', unit: 'lbs', min: 10, step: 20 } })
  })

  test('otherwise the first equipment that takes a weight; none for bodyweight', () => {
    expect(loadFor(profile, 'bench-press', ['bench', 'barbell'])).toEqual({ equipmentId: 'barbell', load: profile.equipment.barbell })
    expect(loadFor(profile, 'push-up', ['bench'])).toBeNull()
    expect(loadFor({ equipment: {} }, 'push-up', [])).toBeNull()
  })
})

describe('joshuaProfile', () => {
  test('every machine is a real exercise, counted as equipment the gym has, with its weights', () => {
    Object.entries(joshuaProfile.machines).forEach(([exerciseId, machine]) => {
      expect(existsSync(`database/exercises/${exerciseId}.json`)).toBe(true)
      expect(isLoaded(joshuaProfile.equipment[machine.equipment])).toBe(true)
      expect(machine.step).toBeGreaterThan(0)
      expect(machine.max === undefined || machine.max >= machine.min).toBe(true)
    })
  })

  test('training days, other training and the first exercise fit together', () => {
    const { trainingDays, otherTraining, daysPerWeek, firstExercise, mustInclude } = joshuaProfile
    expect(trainingDays).toHaveLength(daysPerWeek)
    otherTraining.forEach(({ dayOfWeek }) => expect(trainingDays).not.toContain(dayOfWeek))
    expect(mustInclude).toContain(firstExercise)
  })

  test('every loaded piece has a unit, a lightest weight and a step', () => {
    Object.values(joshuaProfile.equipment).filter(isLoaded).forEach(equipment => {
      expect(['kg', 'lbs']).toContain(equipment.unit)
      expect(typeof equipment.min).toBe('number')
      expect(equipment.step).toBeGreaterThan(0)
    })
  })
})
