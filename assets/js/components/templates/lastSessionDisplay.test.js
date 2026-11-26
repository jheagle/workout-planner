// formatLastSession is pure, but importing this module also destructures the treeloomComponents global at the
// top level (for the DomItem-building lastSessionDisplay export this file doesn't test) - a lightweight stub is
// enough, no need to load the real package. require(), not import, so this assignment actually runs first -
// import statements are hoisted ahead of any other top-level code, which would run too late here.
global.treeloomComponents = { div: () => {}, text: () => {} }
const { formatLastSession } = require('./lastSessionDisplay.js')

describe('formatLastSession', () => {
  const session = { _id: 1, exercise_id: 1, weight: '120', unit: 'lbs', sets: 3, reps: 10, note: '', order: 0, date: '2024-06-05' }

  test('shows the weight in the preferred unit, with the weight as entered in brackets', () => {
    expect(formatLastSession(session, 'kg')).toBe('Last time: 54.4 kg (120 lbs), 3x10 on 2024-06-05')
  })

  test('shows the weight once when it was entered in the preferred unit', () => {
    expect(formatLastSession(session, 'lbs')).toBe('Last time: 120 lbs, 3x10 on 2024-06-05')
    expect(formatLastSession({ ...session, weight: '20', unit: 'kg' }, 'kg')).toBe('Last time: 20 kg, 3x10 on 2024-06-05')
  })

  test('still reads a row from before the change (weight_effort)', () => {
    expect(formatLastSession({ ...session, weight: undefined, unit: undefined, weight_effort: '120lbs' }, 'lbs')).toBe('Last time: 120 lbs, 3x10 on 2024-06-05')
  })

  test('shows a hold\'s time, and a placeholder when there is no weight', () => {
    expect(formatLastSession({ ...session, weight: undefined, unit: undefined, seconds: 30, sets: 5, reps: undefined })).toBe('Last time: held 0:30, 5 sets on 2024-06-05')
    expect(formatLastSession({ ...session, weight: undefined, unit: undefined })).toBe('Last time: no weight recorded, 3x10 on 2024-06-05')
  })

  test('reports no previous session when null', () => {
    expect(formatLastSession(null)).toBe('No previous session for this exercise yet.')
  })
})
