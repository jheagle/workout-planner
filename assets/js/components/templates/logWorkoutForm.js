/* global treeloom, treeloomComponents -- both loaded as plain scripts in muscles.html before this native ES module runs, not npm imports */
import { localDate } from '../../data/localDate.js'
import { readWeightText } from '../../data/units.js'

const { div, input, button, select, option } = treeloomComponents

/**
 * Builds the log-workout form's DOM structure. No event wiring here - see exercisePicker.js's
 * own note on why that has to happen after this is attached into the real document and rendered.
 * The weight is entered in the unit the equipment shows (the unit picker starts on the exercise's last unit).
 * @returns {{ container: DomItem, weightInput: DomItem, unitSelect: DomItem, secondsInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem }}
 */
export const logWorkoutForm = () => {
  const weightInput = input('number', '', null, [], undefined, { placeholder: 'Weight', min: '0', step: 'any' })
  const unitSelect = select([option('kg', 'kg'), option('lbs', 'lbs')], '', { 'aria-label': 'Unit the equipment uses' })
  const secondsInput = input('text', '', null, [], undefined, { placeholder: 'Time for holds (m:ss)' })
  const setsInput = input('number', '', null, [], undefined, { placeholder: 'Sets', min: '0' })
  const repsInput = input('number', '', null, [], undefined, { placeholder: 'Reps', min: '0' })
  const noteInput = input('text', '', null, [], undefined, { placeholder: 'Notes (optional)' })
  const dateInput = input('date', '', localDate())
  const submitButton = button('Log this workout')
  const updateButton = button('Update last entry')

  return {
    container: div(
      [weightInput, unitSelect, secondsInput, setsInput, repsInput, noteInput, dateInput, submitButton, updateButton],
      'log-workout-form'
    ),
    weightInput,
    unitSelect,
    secondsInput,
    setsInput,
    repsInput,
    noteInput,
    dateInput,
    submitButton,
    updateButton
  }
}

/**
 * Reads the form's current field values, independent of which button triggered it. A hold's time ('0:45', '45s')
 * becomes seconds.
 * @param {{ weightInput: DomItem, unitSelect: DomItem, secondsInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem }} form
 */
export const readFormValues = (form) => ({
  weight: form.weightInput.element.value,
  unit: form.unitSelect.element.value,
  seconds: readWeightText(form.secondsInput.element.value).seconds ?? '',
  sets: form.setsInput.element.value,
  reps: form.repsInput.element.value,
  note: form.noteInput.element.value,
  date: form.dateInput.element.value
})

/**
 * Wires the form's submit and update buttons - see logWorkoutForm's own note on timing.
 * @param {{ weightInput: DomItem, unitSelect: DomItem, secondsInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem, updateButton: DomItem }} form
 * @param {Function} onSubmit - ({ weight, unit, seconds, sets, reps, note, date }) => void, logs a brand new entry
 * @param {Function} onUpdate - ({ weight, unit, seconds, sets, reps, note, date }) => void, corrects the most recently shown entry
 */
export const wireLogWorkoutFormEvents = (form, onSubmit = () => {}, onUpdate = () => {}) => {
  treeloom.fullAddEventListener(
    'click',
    () => onSubmit(readFormValues(form)),
    'onLogWorkout',
    null,
    null,
    form.submitButton
  )
  treeloom.fullAddEventListener(
    'click',
    () => onUpdate(readFormValues(form)),
    'onUpdateWorkout',
    null,
    null,
    form.updateButton
  )
}
