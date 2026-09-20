import { responsiveTable } from '../macro/responsiveTable.js'

/**
 * Generates a table for a workout plan.
 * @returns {DomItem}
 */
export const workout = (workoutDetails = []) => responsiveTable(
  workoutDetails,
  [
    {
      text: 'Muscle',
      className: '',
    },
    {
      text: 'Workout',
      className: '',
    },
    {
      text: 'Weight / Difficulty',
      className: '',
    },
    {
      text: 'Sets / Reps',
      className: '',
    },
    {
      text: 'Notes',
      className: '',
    },
  ]
)
