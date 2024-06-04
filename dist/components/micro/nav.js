'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.navigation = void 0
var _element = require('./element.js')
/**
 * Create a nav DomItem
 * @param {array} [children=[]]
 * @param {string} [className='']
 * @param {object} [attributes={}]
 * @returns {DomItem}
 */
var navigation = exports.navigation = function navigation () {
  var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
  return (0, _element.element)('nav', children, className, attributes)
}
