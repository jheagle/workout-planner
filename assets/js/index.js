import { pageNavigation } from './components/templates/pageNavigation.js'
import { musclePriorityList } from './components/templates/musclePriorityList.js'
import { exercisePicker, wireExercisePickerEvents } from './components/templates/exercisePicker.js'
import { lastSessionDisplay, formatLastSession } from './components/templates/lastSessionDisplay.js'
import { logWorkoutForm, wireLogWorkoutFormEvents } from './components/templates/logWorkoutForm.js'
import { option } from './components/micro/option.js'
import { text } from './components/micro/text.js'
import { main } from './components/micro/main.js'

window.jsonDom = jsonDom

// The query layer needs real Node filesystem access, which this page's own JS never has - see
// server/server.js, which exposes it as JSON endpoints this page talks to instead.
const API_BASE = 'http://localhost:3001'

let picker
let lastSessionItem
let logForm

const updateLastSession = (session) => {
  lastSessionItem.children = [text(formatLastSession(session))]
  jsonDom.updateChildNodes(lastSessionItem)
}

const onExerciseChange = (exerciseId) => {
  if (!exerciseId) {
    updateLastSession(null)
    return
  }
  fetch(`${API_BASE}/api/last-session?exerciseId=${exerciseId}`)
    .then((response) => response.json())
    .then(updateLastSession)
}

const onLogWorkout = ({ weightEffort, sets, reps, note, date }) => {
  const exerciseId = picker.exerciseSelect.element.value
  if (!exerciseId) {
    return
  }
  fetch(`${API_BASE}/api/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      exerciseId,
      weightEffort,
      sets: sets || 0,
      reps: reps || 0,
      note,
      date
    })
  })
    .then((response) => response.json())
    .then(() => onExerciseChange(exerciseId))
}

const onMuscleChange = (muscleId) => {
  fetch(`${API_BASE}/api/exercises-for-muscle?muscleId=${muscleId}`)
    .then((response) => response.json())
    .then((exercises) => {
      picker.exerciseSelect.children = exercises.length
        ? exercises.map((exercise) => option(String(exercise._id), exercise.name))
        : [option('', 'No exercises for this muscle yet')]
      picker.exerciseSelect.element.disabled = exercises.length === 0
      jsonDom.updateChildNodes(picker.exerciseSelect)
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
  const mainHeader = pageNavigation()
  const priorityTable = musclePriorityList(priorityRows)
  picker = exercisePicker(priorityRows)
  lastSessionItem = lastSessionDisplay(null)
  logForm = logWorkoutForm()
  const documentItem = jsonDom.documentItem
  jsonDom.updateDomItems(documentItem)

  documentItem.head.children.push(priorityTable.style)

  // Add the menu as the first child of body
  documentItem.body.children.unshift(mainHeader)

  const mainContent = main([priorityTable.table, picker.container, lastSessionItem, logForm.container])

  documentItem.body.children.push(mainContent)

  // Update the body child node list to include the header
  jsonDom.updateChildNodes(documentItem.head)
  // Update the style for the table
  jsonDom.updateElements(priorityTable.style)

  jsonDom.updateChildNodes(documentItem.body)
  // Update the header to generate the elements
  jsonDom.updateElements(mainHeader)
  // Update the table to generate the elements
  jsonDom.updateElements(mainContent)

  // Only now does every new node have both a real element and a complete parentItem chain up to
  // documentItem - fullAddEventListener needs both, so event wiring has to happen after this.
  jsonDom.setParentItemReferences(documentItem)
  wireExercisePickerEvents(picker, onMuscleChange, onExerciseChange)
  wireLogWorkoutFormEvents(logForm, onLogWorkout)

  if (priorityRows.length) {
    onMuscleChange(String(priorityRows[0].muscleId))
  }
}

fetch(`${API_BASE}/api/muscle-priority`)
  .then((response) => response.json())
  .then(renderPage)
  .catch((error) => {
    console.error('Could not load muscle priority from the API - is `npm run serve:api` running?', error)
    renderPage([])
  })
