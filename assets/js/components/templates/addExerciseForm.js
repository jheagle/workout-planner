import { div } from '../micro/div.js'
import { input } from '../micro/input.js'
import { select } from '../micro/select.js'
import { option } from '../micro/option.js'
import { button } from '../micro/button.js'

/**
 * Builds the add-exercise form's DOM structure. No event wiring here - see exercisePicker.js's
 * own note on why that has to happen after this is attached into the real document and rendered.
 * Primary and secondary are two separate multi-selects (rather than one picker with a per-muscle
 * rank) - a real exercise's muscles split cleanly into those two buckets, and a plain multi-select
 * needs no dynamic add/remove row UI to support picking several of each.
 * @param {Array} muscles - musclePriority()'s shape (every real muscle, not just priority ones) - becomes both selects' options
 * @returns {{ container: DomItem, nameInput: DomItem, descriptionInput: DomItem, primaryMusclesSelect: DomItem, secondaryMusclesSelect: DomItem, submitButton: DomItem }}
 */
export const addExerciseForm = (muscles = []) => {
  const nameInput = input('text', { placeholder: 'Exercise name' })
  const descriptionInput = input('text', { placeholder: 'Description (optional)' })
  const muscleOptions = () => muscles.map((muscle) => option(String(muscle.muscleId), muscle.name))
  const selectSize = String(Math.min(muscles.length, 6) || 1)
  const primaryMusclesSelect = select(muscleOptions(), '', { multiple: true, size: selectSize })
  const secondaryMusclesSelect = select(muscleOptions(), '', { multiple: true, size: selectSize })
  const submitButton = button('Add exercise')

  return {
    container: div(
      [nameInput, descriptionInput, primaryMusclesSelect, secondaryMusclesSelect, submitButton],
      'add-exercise-form'
    ),
    nameInput,
    descriptionInput,
    primaryMusclesSelect,
    secondaryMusclesSelect,
    submitButton
  }
}

const selectedValues = (selectItem) => Array.from(selectItem.element.selectedOptions).map((option) => option.value)

export const readAddExerciseValues = (form) => ({
  name: form.nameInput.element.value,
  description: form.descriptionInput.element.value,
  primaryMuscleIds: selectedValues(form.primaryMusclesSelect),
  secondaryMuscleIds: selectedValues(form.secondaryMusclesSelect)
})

/**
 * Wires the form's submit button - see addExerciseForm's own note on timing.
 * @param {{ nameInput: DomItem, descriptionInput: DomItem, primaryMusclesSelect: DomItem, secondaryMusclesSelect: DomItem, submitButton: DomItem }} form
 * @param {Function} onSubmit - ({ name, description, primaryMuscleIds, secondaryMuscleIds }) => void
 */
export const wireAddExerciseFormEvents = (form, onSubmit = () => {}) => {
  jsonDom.fullAddEventListener(
    'click',
    () => onSubmit(readAddExerciseValues(form)),
    'onAddExercise',
    null,
    null,
    form.submitButton
  )
}
