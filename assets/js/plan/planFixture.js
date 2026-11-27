/**
 * A small gym and history for the plan tests (and later the evals' mocks): rows as the database holds them, a goal,
 * and a plan that passes every check, to break one rule at a time.
 * @module planFixture
 */

export const fixtureRows = () => ({
  muscles: [
    { _id: 11, name: 'Pectorals' },
    { _id: 15, name: 'Mid and lower chest', parent_id: 11 },
    { _id: 12, name: 'Quadriceps' },
    { _id: 9, name: 'Latissimus Dorsi' },
    { _id: 14, name: 'Triceps' }
  ],
  exercises: [
    { _id: 'bench', name: 'Barbell bench press' },
    { _id: 'squat', name: 'Barbell squat' },
    { _id: 'pullup', name: 'Pull-up' },
    { _id: 'treadmill-sprint', name: 'Treadmill sprint' }
  ],
  exerciseMuscle: [
    { exercise_id: 'bench', muscle_id: '15', muscle_rank: 100 },
    { exercise_id: 'bench', muscle_id: '14', muscle_rank: 50 },
    { exercise_id: 'squat', muscle_id: '12', muscle_rank: 100 },
    { exercise_id: 'pullup', muscle_id: '9', muscle_rank: 100 }
  ],
  exerciseEquipment: [
    { exercise_id: 'bench', equipment_id: 'barbell' },
    { exercise_id: 'bench', equipment_id: 'bench' },
    { exercise_id: 'squat', equipment_id: 'barbell' },
    { exercise_id: 'pullup', equipment_id: 'pull_up_bar' },
    { exercise_id: 'treadmill-sprint', equipment_id: 'treadmill' } // not in the gym
  ],
  workouts: [
    { exercise_id: 'bench', date: '2026-11-16', sets: 3, reps: 5, weight: '160', unit: 'lbs' },
    { exercise_id: 'bench', date: '2026-11-23', sets: 3, reps: 5, weight: '165', unit: 'lbs' },
    { exercise_id: 'squat', date: '2026-11-23', sets: 3, reps: 8, weight: '100', unit: 'kg' },
    { exercise_id: 'pullup', date: '2026-11-23', sets: 3, reps: 8 },
    { exercise_id: 'bench', date: '2026-12-30', sets: 3, reps: 5, weight: '300', unit: 'lbs' } // after "today": ignored
  ]
})

export const fixtureProfile = () => ({
  unit: 'lbs',
  daysPerWeek: 3,
  sessionMinutes: 60,
  bodyweight: null,
  equipment: {
    barbell: { unit: 'lbs', min: 45, step: 5 },
    bench: {},
    pull_up_bar: {}
  },
  mustInclude: [],
  avoid: []
})

// 175 x 5 is a max of about 204; the last bench (165 x 5) is about 192.5, and 4 weeks allow about 208
export const fixtureGoal = () => ({ exerciseId: 'bench', weight: { amount: 175, unit: 'lbs' }, reps: 5, weeks: 4 })

export const fixtureToday = () => new Date(2026, 10, 26)

const day = (dayOfWeek, bench, squat) => ({
  dayOfWeek,
  exercises: [
    { exerciseId: 'bench', equipmentId: 'barbell', sets: 3, reps: 5, weight: { amount: bench, unit: 'lbs' } },
    { exerciseId: 'squat', equipmentId: 'barbell', sets: 3, reps: 8, weight: { amount: squat, unit: 'lbs' } },
    { exerciseId: 'pullup', equipmentId: null, sets: 3, reps: 8, weight: null }
  ]
})

// Mon, Wed, Fri; the bench climbs 165 -> 170 -> 175 -> 175 and the squat from about 220 lbs (100 kg)
export const validPlan = () => ({
  summary: 'Three full-body days a week, adding 5 lbs to the bench each week until the goal week.',
  weeks: [[165, 225], [170, 230], [175, 235], [175, 240]].map(([bench, squat], index) => ({
    week: index + 1,
    days: [day(1, bench, squat), day(3, bench, squat), day(5, bench, squat)]
  }))
})
