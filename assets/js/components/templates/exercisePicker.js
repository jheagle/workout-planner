import { div } from '../micro/div.js'
import { select } from '../micro/select.js'
import { option } from '../micro/option.js'

/**
 * Builds the muscle -> exercise picker's DOM structure. No event wiring here - fullAddEventListener
 * needs a complete parentItem chain up to the real document root (it throws otherwise), which a
 * freshly-built, not-yet-attached DomItem doesn't have yet. Call wireExercisePickerEvents once this
 * is attached into the real document and rendered.
 * @param {Array} priorityRows - musclePriority()'s shape, ordered by priority - becomes the muscle dropdown's options, top priority first
 * @returns {{ container: DomItem, muscleSelect: DomItem, exerciseSelect: DomItem }}
 */
export const exercisePicker = (priorityRows = []) => {
  const muscleSelect = select(
    priorityRows.map((row) => option(String(row.muscleId), row.name))
  )
  const exerciseSelect = select(
    [option('', 'Pick a muscle first')],
    '',
    { disabled: true }
  )

  return {
    container: div([muscleSelect, exerciseSelect], 'exercise-picker'),
    muscleSelect,
    exerciseSelect
  }
}

/**
 * Wires the picker's change events, once it's attached into the real document and rendered -
 * see exercisePicker's own note on why this can't happen at construction time.
 * @param {{ muscleSelect: DomItem, exerciseSelect: DomItem }} picker
 * @param {Function} onMuscleChange - (muscleId: string) => void
 * @param {Function} onExerciseChange - (exerciseId: string) => void
 */
export const wireExercisePickerEvents = (picker, onMuscleChange = () => {}, onExerciseChange = () => {}) => {
  jsonDom.fullAddEventListener(
    'change',
    () => onMuscleChange(picker.muscleSelect.element.value),
    'onMuscleChange',
    null,
    null,
    picker.muscleSelect
  )
  jsonDom.fullAddEventListener(
    'change',
    () => onExerciseChange(picker.exerciseSelect.element.value),
    'onExerciseChange',
    null,
    null,
    picker.exerciseSelect
  )
}
