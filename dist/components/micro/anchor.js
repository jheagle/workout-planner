'use strict'

require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.string.anchor.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.anchor = void 0
var _element = require('./element.js')
var anchor = exports.anchor = function anchor () {
  var href = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#'
  var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
  var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ''
  var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {}
  attributes.href = href
  return (0, _element.element)('a', children, className, attributes)
}
