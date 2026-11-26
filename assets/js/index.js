import { musclePriorityList } from './components/templates/musclePriorityList.js'
import { exercisePicker, wireExercisePickerEvents } from './components/templates/exercisePicker.js'
import { lastSessionDisplay, formatLastSession } from './components/templates/lastSessionDisplay.js'
import { logWorkoutForm, wireLogWorkoutFormEvents } from './components/templates/logWorkoutForm.js'
import { addExerciseForm, wireAddExerciseFormEvents } from './components/templates/addExerciseForm.js'
import { getMusclePriority, getExercisesForMuscle, getLastSession } from './data/browserReads.js'
import { WEIGHT_UNITS, defaultUnit, formatSeconds, workoutWeight } from './data/units.js'

/* global treeloom, treeloomComponents -- both loaded as plain scripts in muscles.html before this native ES module runs, not npm imports */
window.treeloom = treeloom
const { option, select, text, main, header, heading } = treeloomComponents

// Reads run here, on json-fs-query's browser build: it reads database/ from this page's own origin (see
// data/browserReads.js), so the page works with no server running. Writes need real filesystem access, which a page
// never has, so they still go to server/server.js (`npm run serve:api`).
const API_BASE = 'http://localhost:3001'

let picker
let lastSessionItem
let logForm
let addForm
let lastSessionId = null
let lastSession = null
let unitPicker

// Weights show in the viewer's unit, remembered in this browser (a convenience: without storage it starts from the
// browser's language each time)
const UNIT_KEY = 'workoutPlanner.unit'
const readPreferredUnit = () => {
  try {
    const stored = window.localStorage.getItem(UNIT_KEY)
    if (WEIGHT_UNITS.includes(stored)) return stored
  } catch (error) {}
  return defaultUnit(navigator.language)
}
let preferredUnit = readPreferredUnit()
const savePreferredUnit = (unit) => {
  preferredUnit = unit
  try {
    window.localStorage.setItem(UNIT_KEY, unit)
  } catch (error) {}
}

// The form starts from the last session as entered, in the unit that exercise's equipment uses (a machine's unit
// doesn't change); with no last session, in the viewer's unit
const fillFormFrom = (session) => {
  const weight = session ? workoutWeight(session) : null
  logForm.weightInput.element.value = weight ? String(weight.amount) : ''
  logForm.unitSelect.element.value = weight ? weight.unit : preferredUnit
  logForm.secondsInput.element.value = session && session.seconds ? formatSeconds(session.seconds) : ''
  logForm.setsInput.element.value = session ? session.sets : ''
  logForm.repsInput.element.value = session ? session.reps : ''
  logForm.noteInput.element.value = session ? session.note || '' : ''
}

const updateLastSession = (session) => {
  lastSessionId = session ? session._id : null
  lastSession = session
  fillFormFrom(session)
  showLastSession()
}

const showLastSession = () => {
  lastSessionItem.children = [text(formatLastSession(lastSession, preferredUnit))]
  treeloom.updateChildNodes(lastSessionItem)
}

const onExerciseChange = (exerciseId) => {
  if (!exerciseId) {
    updateLastSession(null)
    return
  }
  getLastSession(exerciseId).then(updateLastSession)
}

const onLogWorkout = ({ weight, unit, seconds, sets, reps, note, date }) => {
  const exerciseId = picker.exerciseSelect.element.value
  if (!exerciseId) {
    return
  }
  fetch(`${API_BASE}/api/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      exerciseId,
      weight,
      unit,
      seconds,
      sets: sets || 0,
      reps: reps || 0,
      note,
      date
    })
  })
    .then((response) => response.json())
    .then(() => onExerciseChange(exerciseId))
}

const onUpdateWorkout = ({ weight, unit, seconds, sets, reps, note }) => {
  if (!lastSessionId) {
    return
  }
  const exerciseId = picker.exerciseSelect.element.value
  fetch(`${API_BASE}/api/workouts/${lastSessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weight, unit, seconds, sets: sets || 0, reps: reps || 0, note })
  })
    .then((response) => response.json())
    .then(() => onExerciseChange(exerciseId))
}

const onAddExercise = ({ name, description, primaryMuscleIds, secondaryMuscleIds }) => {
  if (!name) {
    return
  }
  const muscleAssignments = [
    ...primaryMuscleIds.map((muscleId) => ({ muscleId, rank: 100 })),
    ...secondaryMuscleIds.map((muscleId) => ({ muscleId, rank: 50 }))
  ]
  fetch(`${API_BASE}/api/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, muscleAssignments })
  })
    .then((response) => response.json())
    .then(() => {
      addForm.nameInput.element.value = ''
      addForm.descriptionInput.element.value = ''
      Array.from(addForm.primaryMusclesSelect.element.options).forEach((opt) => { opt.selected = false })
      Array.from(addForm.secondaryMusclesSelect.element.options).forEach((opt) => { opt.selected = false })
      // The new exercise may apply to whichever muscle is currently selected - refresh its list.
      onMuscleChange(picker.muscleSelect.element.value)
    })
}

const onMuscleChange = (muscleId) => {
  getExercisesForMuscle(muscleId)
    .then((exercises) => {
      picker.exerciseSelect.children = exercises.length
        ? exercises.map((exercise) => option(String(exercise._id), exercise.name))
        : [option('', 'No exercises for this muscle yet')]
      picker.exerciseSelect.element.disabled = exercises.length === 0
      treeloom.updateChildNodes(picker.exerciseSelect)
      if (!exercises.length) {
        updateLastSession(null)
        return
      }
      const firstExerciseId = String(exercises[0]._id)
      picker.exerciseSelect.element.value = firstExerciseId
      onExerciseChange(firstExerciseId)
    })
}

const renderPage = (priorityRows) => {
  unitPicker = select([option('kg', 'Weights in kg'), option('lbs', 'Weights in lbs')], 'unit-picker', { 'aria-label': 'Show weights in' })
  const mainHeader = header([heading(1, [text('Workout Planner')]), unitPicker])
  const priorityTable = musclePriorityList(priorityRows)
  picker = exercisePicker(priorityRows)
  lastSessionItem = lastSessionDisplay(null, preferredUnit)
  logForm = logWorkoutForm()
  addForm = addExerciseForm(priorityRows)
  const documentItem = treeloom.documentItem
  treeloom.updateDomItems(documentItem)

  documentItem.head.children.push(priorityTable.style)

  // Add the header as the first child of body
  documentItem.body.children.unshift(mainHeader)

  const mainContent = main([
    priorityTable.table,
    picker.container,
    lastSessionItem,
    logForm.container,
    addForm.container
  ])

  documentItem.body.children.push(mainContent)

  // Update the body child node list to include the header
  treeloom.updateChildNodes(documentItem.head)
  // Update the style for the table
  treeloom.updateElements(priorityTable.style)

  treeloom.updateChildNodes(documentItem.body)
  // Update the header to generate the elements
  treeloom.updateElements(mainHeader)
  // Update the table to generate the elements
  treeloom.updateElements(mainContent)

  // Only now does every new node have both a real element and a complete parentItem chain up to
  // documentItem - fullAddEventListener needs both, so event wiring has to happen after this.
  treeloom.setParentItemReferences(documentItem)
  wireExercisePickerEvents(picker, onMuscleChange, onExerciseChange)
  wireLogWorkoutFormEvents(logForm, onLogWorkout, onUpdateWorkout)
  wireAddExerciseFormEvents(addForm, onAddExercise)
  unitPicker.element.value = preferredUnit
  treeloom.fullAddEventListener('change', () => {
    savePreferredUnit(unitPicker.element.value)
    showLastSession()
  }, 'onUnitChange', null, null, unitPicker)

  if (priorityRows.length) {
    onMuscleChange(String(priorityRows[0].muscleId))
  }
}

getMusclePriority()
  .then(renderPage)
  .catch((error) => {
    console.error('Could not read the muscle priority from database/', error)
    renderPage([])
  })
