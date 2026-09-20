'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.groupBy = void 0
require('core-js/modules/es.array.reduce.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
const groupBy = exports.groupBy = function groupBy () {
  const dataSet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const groupProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  if (!groupProperty) {
    return dataSet
  }
  return dataSet.reduce(function (groupedData, data) {
    const property = data[groupProperty]
    if (!groupedData.hasOwnProperty(property)) {
      groupedData[property] = []
    }
    groupedData[property].push(data)
    return groupedData
  }, {})
}
