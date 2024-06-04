import { table } from '../micro/table.js'
import { tableBody } from '../micro/tableBody.js'
import { tableData } from '../micro/tableData.js'
import { tableHead } from '../micro/tableHead.js'
import { tableHeading } from '../micro/tableHeading.js'
import { tableRow } from '../micro/tableRow.js'
import { text } from '../micro/text.js'
import { style } from '../micro/style.js'

const tableStyle = '/* \n' +
  'Max width before this PARTICULAR table gets nasty\n' +
  'This query will take effect for any screen smaller than 760px\n' +
  'and also iPads specifically.\n' +
  '*/\n' +
  '@media \n' +
  'only screen and (max-width: 760px),\n' +
  '(min-device-width: 768px) and (max-device-width: 1024px)  {\n'

const addLabelStyle = (label, index, tableId) => `\t.${tableId} td:nth-of-type(${index}):before { content: "${label}"; }\n`

/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {Array} tableRows
 * @param {Array} tableHeadings
 * @param {string} tableClass
 * @returns {Object.<DomItem>}
 */
export const responsiveTable = (tableRows = [], tableHeadings = [], tableClass = '') => {
  let headingCount = 1
  let styles = tableStyle

  const tableId = 'table_' + (100 + Math.floor(Math.random() * 899))

  const tableHeadItem = tableHead(
    [
      tableRow(
        tableHeadings.map((heading) => {
          styles += addLabelStyle(heading.text, headingCount++, tableId)
          return tableHeading([text(heading.text)], heading.className)
        })
      )
    ]
  )
  return {
    table: table(
      [
        tableHeadItem,
        tableBody(
          tableRows.map((rowItem) => tableRow(
            rowItem.data.map((data) => tableData([text(data.text)], data.className)),
            rowItem.className
          ))
        )
      ],
      `${tableClass} ${tableId}`
    ),
    style: style(`${styles}}`)
  }
}
