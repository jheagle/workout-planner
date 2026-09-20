'use strict'

require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.string.anchor.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.anchor = void 0
const _element = require('./element.js')
const anchor = exports.anchor = function anchor () {
  const href = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#'
  const children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
  const className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ''
  const attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {}
  attributes.href = href
  return (0, _element.element)('a', children, className, attributes)
}
