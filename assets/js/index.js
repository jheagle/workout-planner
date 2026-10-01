import { pageNavigation } from './components/templates/pageNavigation.js'
import { musclePriorityList } from './components/templates/musclePriorityList.js'
import { main } from './components/micro/main.js'

window.jsonDom = jsonDom

// The query layer needs real Node filesystem access, which this page's own JS never has - see
// server/server.js, which exposes it as JSON endpoints this page talks to instead.
const API_BASE = 'http://localhost:3001'

const renderPage = (priorityRows) => {
  const mainHeader = pageNavigation()
  const priorityTable = musclePriorityList(priorityRows)
  const documentItem = jsonDom.documentItem
  jsonDom.updateDomItems(documentItem)

  documentItem.head.children.push(priorityTable.style)

  // Add the menu as the first child of body
  documentItem.body.children.unshift(mainHeader)

  const mainContent = main([priorityTable.table])

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
}

fetch(`${API_BASE}/api/muscle-priority`)
  .then((response) => response.json())
  .then(renderPage)
  .catch((error) => {
    console.error('Could not load muscle priority from the API - is `npm run serve:api` running?', error)
    renderPage([])
  })
