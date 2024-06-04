'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.element = void 0
var _node = require('./node.js')
/**
 * Create the template of a DomItem
 * @param {string} nodeName
 * @param {array} [children=[]]
 * @param {string} [className='']
 * @param {object} [attributes={}]
 * @returns {DomItem}
 */
var element = exports.element = function element (nodeName) {
  var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
  var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ''
  var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {}
  attributes.className = className
  return (0, _node.node)(nodeName, null, children, attributes)
}
