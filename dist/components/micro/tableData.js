'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.tableData = void 0
var _element = require('./element.js')
var tableData = exports.tableData = function tableData () {
  var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
  return (0, _element.element)('td', children, className, attributes)
}
