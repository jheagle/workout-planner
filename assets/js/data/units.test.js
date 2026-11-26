import { convertWeight, formatAmount, workoutWeight, readWeightText, showWeight, formatSeconds, defaultUnit } from './units'

describe('units', () => {
  test('converts between lbs and kg exactly, and back', () => {
    expect(convertWeight(100, 'lbs', 'kg')).toBeCloseTo(45.359237, 6)
    expect(convertWeight(convertWeight(225, 'lbs', 'kg'), 'kg', 'lbs')).toBeCloseTo(225, 9)
    expect(convertWeight(60, 'kg', 'kg')).toBe(60)
  })

  test.each([[67.5, '67.5'], [81.64663, '81.6'], [225, '225'], [99.96, '100']])('formatAmount(%p) is %p', (amount, expected) => {
    expect(formatAmount(amount)).toBe(expected)
  })

  test.each([
    ['180lbs', { amount: 180, unit: 'lbs' }, null],
    ['67.5lbs', { amount: 67.5, unit: 'lbs' }, null],
    ['2x40lbs', { amount: 80, unit: 'lbs' }, null],
    ['20kg', { amount: 20, unit: 'kg' }, null],
    ['0:30', null, 30],
    ['2:00', null, 120],
    ['30 seconds', null, 30],
    ['', null, null],
    ['heavy', null, null]
  ])('readWeightText(%p)', (text, weight, seconds) => {
    expect(readWeightText(text)).toEqual({ weight, seconds })
  })

  test('a workout\'s weight comes from weight and unit, or from the old weight_effort text', () => {
    expect(workoutWeight({ weight: '67.5', unit: 'lbs' })).toEqual({ amount: 67.5, unit: 'lbs' })
    expect(workoutWeight({ weight: '20', unit: 'kg' })).toEqual({ amount: 20, unit: 'kg' })
    expect(workoutWeight({ weight_effort: '180lbs' })).toEqual({ amount: 180, unit: 'lbs' })
    expect(workoutWeight({ seconds: 30 })).toBeNull()
  })

  test('shows a weight in the preferred unit, with the entered one alongside when they differ', () => {
    expect(showWeight({ amount: 180, unit: 'lbs' }, 'kg')).toEqual({ text: '81.6 kg', entered: '180 lbs' })
    expect(showWeight({ amount: 20, unit: 'kg' }, 'kg')).toEqual({ text: '20 kg', entered: null })
    expect(showWeight({ amount: 20, unit: 'kg' }, 'lbs')).toEqual({ text: '44.1 lbs', entered: '20 kg' })
    expect(showWeight(null, 'kg')).toBeNull()
  })

  test.each([[30, '0:30'], [125, '2:05'], [60, '1:00']])('formatSeconds(%p) is %p', (seconds, expected) => {
    expect(formatSeconds(seconds)).toBe(expected)
  })

  test('defaults to lbs only where it is the everyday unit', () => {
    expect(defaultUnit('en-US')).toBe('lbs')
    expect(defaultUnit('en-CA')).toBe('kg')
    expect(defaultUnit('fr-FR')).toBe('kg')
    expect(defaultUnit()).toBe('kg')
  })
})
