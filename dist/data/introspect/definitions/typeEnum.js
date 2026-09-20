'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.typeEnum = void 0
require('core-js/modules/es.array.includes.js')
require('core-js/modules/es.string.includes.js')
const typeEnum = exports.typeEnum = function typeEnum () {
  const values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  const optional = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false
  if (values.includes(value)) {
    return true
  }
  return typeof value === 'undefined' && optional
}
