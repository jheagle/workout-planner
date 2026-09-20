'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.span = void 0
const _element = require('./element.js')
const span = exports.span = function span () {
  const children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  const attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
  return (0, _element.element)('span', children, className, attributes)
}
