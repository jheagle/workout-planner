'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.responsiveTable = void 0
require('core-js/modules/es.array.concat.js')
require('core-js/modules/es.array.map.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.map.js')
const _table = require('../micro/table.js')
const _tableBody = require('../micro/tableBody.js')
const _tableData = require('../micro/tableData.js')
const _tableHead = require('../micro/tableHead.js')
const _tableHeading = require('../micro/tableHeading.js')
const _tableRow = require('../micro/tableRow.js')
const _text = require('../micro/text.js')
const _style = require('../micro/style.js')
const tableStyle = '/* \n' + 'Max width before this PARTICULAR table gets nasty\n' + 'This query will take effect for any screen smaller than 760px\n' + 'and also iPads specifically.\n' + '*/\n' + '@media \n' + 'only screen and (max-width: 760px),\n' + '(min-device-width: 768px) and (max-device-width: 1024px)  {\n'
const addLabelStyle = function addLabelStyle (label, index, tableId) {
  return '\t.'.concat(tableId, ' td:nth-of-type(').concat(index, '):before { content: "').concat(label, '"; }\n')
}

/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {Array} tableRows
 * @param {Array} tableHeadings
 * @param {string} tableClass
 * @returns {Object.<DomItem>}
 */
const responsiveTable = exports.responsiveTable = function responsiveTable () {
  const tableRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const tableHeadings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
  const tableClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ''
  let headingCount = 1
  let styles = tableStyle
  const tableId = 'table_' + (100 + Math.floor(Math.random() * 899))
  const tableHeadItem = (0, _tableHead.tableHead)([(0, _tableRow.tableRow)(tableHeadings.map(function (heading) {
    styles += addLabelStyle(heading.text, headingCount++, tableId)
    return (0, _tableHeading.tableHeading)([(0, _text.text)(heading.text)], heading.className)
  }))])
  return {
    table: (0, _table.table)([tableHeadItem, (0, _tableBody.tableBody)(tableRows.map(function (rowItem) {
      return (0, _tableRow.tableRow)(rowItem.data.map(function (data) {
        return (0, _tableData.tableData)([(0, _text.text)(data.text)], data.className)
      }), rowItem.className)
    }))], ''.concat(tableClass, ' ').concat(tableId)),
    style: (0, _style.style)(''.concat(styles, '}'))
  }
}
