import { pageNavigation } from './components/templates/pageNavigation.js'
import { workout } from './components/templates/workout.js'
import { main } from './components/micro/main.js'

window.jsonDom = jsonDom
const mainHeader = pageNavigation()
const workoutTable = workout()
const documentItem = jsonDom.documentItem
jsonDom.updateDomItems(documentItem)

documentItem.head.children.push(workoutTable.style)

// Add the menu as the first child of body
documentItem.body.children.unshift(mainHeader)

const mainContent = main([workoutTable.table])

documentItem.body.children.push(mainContent)

// Update the body child node list to include the header
jsonDom.updateChildNodes(documentItem.head)
// Update the style for the table
jsonDom.updateElements(workoutTable.style)

jsonDom.updateChildNodes(documentItem.body)
// Update the header to generate the elements
jsonDom.updateElements(mainHeader)
// Update the table to generate the elements
jsonDom.updateElements(mainContent)