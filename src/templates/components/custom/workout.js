import { responsiveTable } from '../macro/responsiveTable.js'

/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {number} currentIndex
 * @returns {DomItem}
 */
export const workout = (currentIndex = 1) => {
  return responsiveTable(
    [
      {
        data: [
          {
            text: 'Pecs',
            className: '',
          },
          {
            text: 'Bench Press',
            className: '',
          },
          {
            text: '115lbs',
            className: '',
          },
          {
            text: '3x10',
            className: '',
          },
          {
            text: '',
            className: '',
          },
        ],
        className: ''
      },
      {
        data: [
          {
            text: 'Quads',
            className: '',
          },
          {
            text: 'Squat',
            className: '',
          },
          {
            text: '155lbs',
            className: '',
          },
          {
            text: '3x10',
            className: '',
          },
          {
            text: '',
            className: '',
          },
        ],
        className: ''
      },
      {
        data: [
          {
            text: 'Hamstrings',
            className: '',
          },
          {
            text: 'Deadlift',
            className: '',
          },
          {
            text: '155lbs',
            className: '',
          },
          {
            text: '3x10',
            className: '',
          },
          {
            text: '',
            className: '',
          },
        ],
        className: ''
      }
    ],
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
}
