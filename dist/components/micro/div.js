'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.div = void 0
const _element = require('./element.js')
const div = exports.div = function div () {
  const children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  const attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
  return (0, _element.element)('div', children, className, attributes)
}
