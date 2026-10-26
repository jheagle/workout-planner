import { localDate } from './localDate.js'

describe('localDate', () => {
  // Dates built from local parts, so these hold in any timezone; off UTC, the UTC date
  // (toISOString) differs from one of them - in the evening west of UTC, the morning east of it
  test('is the local date at both ends of the day', () => {
    expect(localDate(new Date(2026, 9, 26, 0, 1))).toBe('2026-10-26')
    expect(localDate(new Date(2026, 9, 26, 23, 59))).toBe('2026-10-26')
  })

  test('pads the month and day', () => {
    expect(localDate(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05')
  })
})
