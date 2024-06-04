'use strict'

var _pageNavigation = require('./components/templates/pageNavigation.js')
var _workout = require('./components/templates/workout.js')
window.jsonDom = jsonDom
var mainHeader = (0, _pageNavigation.pageNavigation)()
var workoutTable = (0, _workout.workout)()
var documentItem = jsonDom.documentItem
jsonDom.updateDomItems(documentItem)
documentItem.head.children.push(workoutTable.style)

// Add the menu as the first child of body
documentItem.body.children.unshift(mainHeader)
documentItem.body.children.push(workoutTable.table)

// Update the body child node list to include the header
jsonDom.updateChildNodes(documentItem.head)
// Update the style for the table
jsonDom.updateElements(workoutTable.style)
jsonDom.updateChildNodes(documentItem.body)
// Update the header to generate the elements
jsonDom.updateElements(mainHeader)
// Update the table to generate the elements
jsonDom.updateElements(workoutTable.table)
