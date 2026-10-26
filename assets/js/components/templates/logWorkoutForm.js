/* global jsonDom, jsonDomComponents -- both loaded as plain scripts in muscles.html before this native ES module runs, not npm imports */
import { localDate } from '../../data/localDate.js'

const { div, input, button } = jsonDomComponents

/**
 * Builds the log-workout form's DOM structure. No event wiring here - see exercisePicker.js's
 * own note on why that has to happen after this is attached into the real document and rendered.
 * @returns {{ container: DomItem, weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem }}
 */
export const logWorkoutForm = () => {
  const weightEffortInput = input('text', '', null, [], undefined, { placeholder: 'Weight / effort (e.g. 120lbs)' })
  const setsInput = input('number', '', null, [], undefined, { placeholder: 'Sets', min: '0' })
  const repsInput = input('number', '', null, [], undefined, { placeholder: 'Reps', min: '0' })
  const noteInput = input('text', '', null, [], undefined, { placeholder: 'Notes (optional)' })
  const dateInput = input('date', '', localDate())
  const submitButton = button('Log this workout')
  const updateButton = button('Update last entry')

  return {
    container: div(
      [weightEffortInput, setsInput, repsInput, noteInput, dateInput, submitButton, updateButton],
      'log-workout-form'
    ),
    weightEffortInput,
    setsInput,
    repsInput,
    noteInput,
    dateInput,
    submitButton,
    updateButton
  }
}

/**
 * Reads the form's current field values, independent of which button triggered it.
 * @param {{ weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem }} form
 */
export const readFormValues = (form) => ({
  weightEffort: form.weightEffortInput.element.value,
  sets: form.setsInput.element.value,
  reps: form.repsInput.element.value,
  note: form.noteInput.element.value,
  date: form.dateInput.element.value
})

/**
 * Wires the form's submit and update buttons - see logWorkoutForm's own note on timing.
 * @param {{ weightEffortInput: DomItem, setsInput: DomItem, repsInput: DomItem, noteInput: DomItem, dateInput: DomItem, submitButton: DomItem, updateButton: DomItem }} form
 * @param {Function} onSubmit - ({ weightEffort, sets, reps, note, date }) => void, logs a brand new entry
 * @param {Function} onUpdate - ({ weightEffort, sets, reps, note, date }) => void, corrects the most recently shown entry
 */
export const wireLogWorkoutFormEvents = (form, onSubmit = () => {}, onUpdate = () => {}) => {
  jsonDom.fullAddEventListener(
    'click',
    () => onSubmit(readFormValues(form)),
    'onLogWorkout',
    null,
    null,
    form.submitButton
  )
  jsonDom.fullAddEventListener(
    'click',
    () => onUpdate(readFormValues(form)),
    'onUpdateWorkout',
    null,
    null,
    form.updateButton
  )
}
