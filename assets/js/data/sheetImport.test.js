import { parseCsv, cleanName, nameKey, readDuration, readReps, readCell, parseSheet, guessEquipment } from './sheetImport'

describe('sheetImport', () => {
  test('parseCsv handles quoted commas, doubled quotes, CRLF and a BOM', () => {
    expect(parseCsv('﻿,2026-10-30\r\n"Ab Core, twist","115lbs, 12"\r\n')).toEqual([['', '2026-10-30'], ['Ab Core, twist', '115lbs, 12']])
  })

  test('names are cleaned, and matched without case or spacing', () => {
    expect(cleanName('  Front pullldown ')).toBe('Front pulldown')
    expect(nameKey('Seated leg curl')).toBe(nameKey('Seated  Leg Curl'))
  })

  test.each([
    ['02:00:00', '2:00'],
    ['00:02:00', '2:00'],
    ['00:01:30', '1:30'],
    ['00:20', '0:20'],
    ['0:30', '0:30'],
    ['30 seconds', '30 seconds'],
    ['10', null]
  ])('readDuration(%p) is %p', (text, expected) => {
    expect(readDuration(text)).toBe(expected)
  })

  test('readReps reads single sets, multiples and lists, and refuses words', () => {
    expect(readReps('2x6, 4')).toEqual([{ sets: 2, reps: 6 }, { sets: 1, reps: 4 }])
    expect(readReps('6,10')).toEqual([{ sets: 1, reps: 6 }, { sets: 1, reps: 10 }])
    expect(readReps('8 slow')).toBeNull()
  })

  test.each([
    ['300lbs, 10; 320lbs, 8', [['300lbs', 1, 10], ['320lbs', 1, 8]], true],
    ['60lbs, 2x5', [['60lbs', 2, 5]], true],
    ['50lbs, 6,10', [['50lbs', 1, 6], ['50lbs', 1, 10]], true],
    ['3x8', [[null, 3, 8]], true],
    ['12, 8, 6', [[null, 1, 12], [null, 1, 8], [null, 1, 6]], true],
    ['2x 30 seconds', [['30 seconds', 2, null]], true],
    ['5x0:30', [['0:30', 5, null]], true],
    ['02:00:00', [['2:00', 1, null]], true],
    ['2x100lbs, 3x8', [['2x100lbs', 3, 8]], true],
    ['120lbs, 8: 125lbs, 8', [['120lbs', 1, 8], ['125lbs', 1, 8]], true],
    // Read as far as possible, and flagged so the text is kept in the note
    ['14, 8 slow; 45lbs, 2', [[null, 1, 14], [null, 1, 8], ['45lbs', 1, 2]], false],
    ['70.5, 8', [['70.5lbs', 1, 8]], false],
    ['130lba, 3x10', [['130lbs', 3, 10]], false],
    ['140lbs, 10 (right leg)', [['140lbs', 1, 10]], false],
    // Unfinished sets are dropped; the rest of the cell is kept
    ['160lbs,', [], false],
    ['150lbs, 10; 160lbs,', [['150lbs', 1, 10]], false],
    // A weight typed twice, a remark in brackets, bars out and back
    ['15lbs, 10; 20lbs, 20lbs, 10; 25lbs, 8', [['15lbs', 1, 10], ['20lbs', 1, 10], ['25lbs', 1, 8]], false],
    ['(other arm assist) 4', [[null, 1, 4]], false],
    ['9 bars x 2', [[null, 1, 18]], false],
    // Shapes from the 2026-11 sheets
    ['45lbs, 12, 6', [['45lbs', 1, 12], ['45lbs', 1, 6]], true],
    ['10,4', [[null, 1, 10], [null, 1, 4]], true],
    ['55lbs, 2 barely ', [['55lbs', 1, 2]], false]
  ])('readCell(%p)', (text, rows, exact) => {
    const read = readCell(text)
    expect(read.rows.map(row => [row.weightEffort, row.sets, row.reps])).toEqual(rows)
    expect(read.exact).toBe(exact)
  })

  test('parseSheet reads a grid, fixes a date typo it can place, and reports what needs checking', () => {
    const csv = [
      ',2026-02-18,2025-02-14,2026-02-11,2025-08-17.,',
      'Leg Press,"300lbs, 10",,"310lbs, 2x8",,"3x10"',
      'Front pullldown ,,"50lbs, 10 (slow)",,,',
      'Hip Thrust,"315lbs,",,,,',
      ',,,,,'
    ].join('\n')
    const { exercises, workouts, problems } = parseSheet(csv, 'lower')
    expect(exercises).toEqual([
      { name: 'Leg Press', area: 'lower', original: 'Leg Press' },
      { name: 'Front pulldown', area: 'lower', original: 'Front pullldown' },
      { name: 'Hip Thrust', area: 'lower', original: 'Hip Thrust' }
    ])
    expect(workouts.map(workout => [workout.date, workout.exercise, workout.weightEffort, workout.sets, workout.reps, workout.note])).toEqual([
      ['2026-02-18', 'Leg Press', '300lbs', 1, 10, null],
      ['2026-02-11', 'Leg Press', '310lbs', 2, 8, null],
      ['2026-02-14', 'Front pulldown', '50lbs', 1, 10, '50lbs, 10 (slow)']
    ])
    expect(problems).toEqual([
      'lower: date "2025-08-17." read as 2025-08-17',
      'lower: date 2025-02-14 is out of order between 2026-02-18 and 2026-02-11; read as 2026-02-14',
      'lower: "Leg Press" has "3x10" under column 6, which has no date; skipped',
      'lower: 2026-02-14 Front pulldown: "50lbs, 10 (slow)" read as 50lbs 1x10; the cell\'s text is kept in the note',
      'lower: 2026-02-18 Hip Thrust: "315lbs," read as nothing; skipped'
    ])
  })

  test('parseSheet applies fixes by hand: a date for an undated cell, a cell moved to another exercise', () => {
    const csv = [
      ',2025-12-11,,2025-07-23',
      'Hanging L Sit,"3x10 chin-ups",,"30 seconds"',
      'Hand-to-Foot ball pass,,3x10,'
    ].join('\n')
    const fixes = [
      { area: 'core', exercise: 'Hand-to-Foot ball pass', text: '3x10', date: '2025-07-31' },
      { area: 'core', exercise: 'Hanging L Sit', text: '3x10 chin-ups', moveTo: 'L-sit Chin-ups', moveArea: 'upper' }
    ]
    const { exercises, workouts, problems } = parseSheet(csv, 'core', fixes)
    expect(exercises.map(each => [each.name, each.area])).toEqual([['Hanging L Sit', 'core'], ['L-sit Chin-ups', 'upper'], ['Hand-to-Foot ball pass', 'core']])
    expect(workouts.map(workout => [workout.date, workout.exercise, workout.area, workout.weightEffort, workout.sets, workout.reps])).toEqual([
      ['2025-12-11', 'L-sit Chin-ups', 'upper', null, 3, 10],
      ['2025-07-23', 'Hanging L Sit', 'core', '30 seconds', 1, null],
      ['2025-07-31', 'Hand-to-Foot ball pass', 'core', null, 3, 10]
    ])
    expect(problems).toEqual([
      'core: 2025-12-11 Hanging L Sit: "3x10 chin-ups" logged under L-sit Chin-ups by hand',
      'core: 2025-12-11 L-sit Chin-ups: "3x10 chin-ups" read as bodyweight 3x10; the cell\'s text is kept in the note',
      'core: "Hand-to-Foot ball pass" has "3x10" under column 3, which has no date; dated 2025-07-31 by hand'
    ])
  })

  test.each([
    ['Dumbbell Incline Press', ['dumbbells', 'bench']],
    ['Dumbbell Chest Press', ['dumbbells', 'bench']],
    ['MTS Chest Press', ['machine']],
    ['Cable Triceps Extension', ['cable machine']],
    ['Smith Bulgarian Split Squats', ['Smith machine', 'bench']],
    ['Triceps Dips', ['dip bars']],
    ['Hanging Knee raise', ['pull-up bar']],
    ["Captain's chair leg raises", ["captain's chair"]],
    ['Plank', []]
  ])('guessEquipment(%p)', (name, expected) => {
    expect(guessEquipment(name)).toEqual(expected)
  })
})
