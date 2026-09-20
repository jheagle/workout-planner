'use strict'

const _pageNavigation = require('./components/templates/pageNavigation.js')
const _workout = require('./components/templates/workout.js')
const _main = require('./components/micro/main.js')
window.jsonDom = jsonDom
const mainHeader = (0, _pageNavigation.pageNavigation)()
const workoutTable = (0, _workout.workout)()
const documentItem = jsonDom.documentItem
jsonDom.updateDomItems(documentItem)
documentItem.head.children.push(workoutTable.style)

// Add the menu as the first child of body
documentItem.body.children.unshift(mainHeader)
const mainContent = (0, _main.main)([workoutTable.table])
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
