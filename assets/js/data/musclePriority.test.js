import { musclePriority } from './musclePriority'

const muscle = (id, name) => ({ _id: id, name, alias: '', image: '' })
const workout = (date, muscles) => ({ date, muscles })

describe('musclePriority', () => {
  // Built from local parts: only the local date of "today" counts, so this holds in any timezone
  const today = new Date(2024, 5, 10, 12, 0)

  test('a muscle with no workout history at all needs priority, with no days-since value', () => {
    const [result] = musclePriority([muscle(1, 'Chest')], [], today)
    expect(result.daysSinceLastWorked).toBe(Infinity)
    expect(result.timesWorkedThisWeek).toBe(0)
    expect(result.needsPriority).toBe(true)
  })

  test('a muscle worked today, for the first time this week, still needs priority (under the 2x/week target)', () => {
    const workouts = [workout('2024-06-10', [muscle(1, 'Chest')])]
    const [result] = musclePriority([muscle(1, 'Chest')], workouts, today)
    expect(result.daysSinceLastWorked).toBe(0)
    expect(result.timesWorkedThisWeek).toBe(1)
    expect(result.needsPriority).toBe(true)
  })

  test('a muscle worked on two distinct days this week, most recently today, does not need priority', () => {
    const workouts = [
      workout('2024-06-10', [muscle(1, 'Chest')]),
      workout('2024-06-08', [muscle(1, 'Chest')])
    ]
    const [result] = musclePriority([muscle(1, 'Chest')], workouts, today)
    expect(result.daysSinceLastWorked).toBe(0)
    expect(result.timesWorkedThisWeek).toBe(2)
    expect(result.needsPriority).toBe(false)
  })

  test('three sets logged on the same day count as one day worked, not three', () => {
    const workouts = [
      workout('2024-06-10', [muscle(1, 'Chest')]),
      workout('2024-06-10', [muscle(1, 'Chest')]),
      workout('2024-06-10', [muscle(1, 'Chest')]),
      workout('2024-06-08', [muscle(1, 'Chest')])
    ]
    const [result] = musclePriority([muscle(1, 'Chest')], workouts, today)
    expect(result.timesWorkedThisWeek).toBe(2)
    expect(result.needsPriority).toBe(false)
  })

  test('a muscle last worked within the recovery window, but already met this week\'s target, does not need priority', () => {
    const workouts = [
      workout('2024-06-09', [muscle(1, 'Chest')]),
      workout('2024-06-06', [muscle(1, 'Chest')])
    ]
    const [result] = musclePriority([muscle(1, 'Chest')], workouts, today)
    expect(result.daysSinceLastWorked).toBe(1)
    expect(result.needsPriority).toBe(false)
  })

  test('a muscle past its recovery window needs priority even if it already met the weekly target', () => {
    const workouts = [
      workout('2024-06-05', [muscle(1, 'Chest')]),
      workout('2024-06-04', [muscle(1, 'Chest')])
    ]
    const [result] = musclePriority([muscle(1, 'Chest')], workouts, today)
    expect(result.daysSinceLastWorked).toBeGreaterThanOrEqual(3)
    expect(result.needsPriority).toBe(true)
  })

  test('counts calendar days: late in the evening, yesterday\'s workout is 1 day ago, not 2 (dates used to be UTC midnight)', () => {
    const lateEvening = new Date(2024, 5, 10, 23, 30)
    const [result] = musclePriority([muscle(1, 'Chest')], [workout('2024-06-09', [muscle(1, 'Chest')])], lateEvening)
    expect(result.daysSinceLastWorked).toBe(1)
  })

  test('counts calendar days: just after midnight, yesterday\'s workout is 1 day ago, not 0', () => {
    const justAfterMidnight = new Date(2024, 5, 10, 0, 5)
    const [result] = musclePriority([muscle(1, 'Chest')], [workout('2024-06-09', [muscle(1, 'Chest')])], justAfterMidnight)
    expect(result.daysSinceLastWorked).toBe(1)
  })

  test('this week means the last 7 calendar days, today included', () => {
    const workouts = [workout('2024-06-03', [muscle(1, 'Chest')]), workout('2024-06-02', [muscle(1, 'Chest')])]
    const [result] = musclePriority([muscle(1, 'Chest')], workouts, new Date(2024, 5, 10, 23, 30))
    expect(result.timesWorkedThisWeek).toBe(1)
  })

  test('one workout can carry multiple muscles (a compound exercise), crediting all of them', () => {
    const workouts = [workout('2024-06-10', [muscle(1, 'Chest'), muscle(2, 'Triceps')])]
    const result = musclePriority([muscle(1, 'Chest'), muscle(2, 'Triceps')], workouts, today)
    expect(result.find(row => row.muscleId === 1).daysSinceLastWorked).toBe(0)
    expect(result.find(row => row.muscleId === 2).daysSinceLastWorked).toBe(0)
  })

  test('sorts muscles that need priority first, longest-neglected first, never-worked ahead of worked-long-ago', () => {
    const muscles = [muscle(1, 'NeverWorked'), muscle(2, 'WorkedLongAgo'), muscle(3, 'WorkedToday')]
    const workouts = [
      workout('2024-05-01', [muscle(2, 'WorkedLongAgo')]),
      workout('2024-06-10', [muscle(3, 'WorkedToday')]),
      workout('2024-06-08', [muscle(3, 'WorkedToday')])
    ]
    const result = musclePriority(muscles, workouts, today)
    expect(result.map(row => row.name)).toEqual(['NeverWorked', 'WorkedLongAgo', 'WorkedToday'])
    expect(result[2].needsPriority).toBe(false)
  })
})
