import { formatLastSession } from './lastSessionDisplay.js'

describe('formatLastSession', () => {
  test('describes a real session with its weight, sets, reps and date', () => {
    const session = { _id: 1, exercise_id: 1, weight_effort: '120lbs', sets: 3, reps: 10, note: '', order: 0, date: '2024-06-05' }
    expect(formatLastSession(session)).toBe('Last time: 120lbs, 3x10 on 2024-06-05')
  })

  test('falls back to a placeholder when weight_effort is blank', () => {
    const session = { _id: 1, exercise_id: 1, weight_effort: '', sets: 3, reps: 10, note: '', order: 0, date: '2024-06-05' }
    expect(formatLastSession(session)).toBe('Last time: no weight recorded, 3x10 on 2024-06-05')
  })

  test('reports no previous session when null', () => {
    expect(formatLastSession(null)).toBe('No previous session for this exercise yet.')
  })
})
