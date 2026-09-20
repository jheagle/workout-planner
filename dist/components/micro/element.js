'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.element = void 0
const _node = require('./node.js')
/**
 * Create the template of a DomItem
 * @param {string} nodeName
 * @param {array} [children=[]]
 * @param {string} [className='']
 * @param {object} [attributes={}]
 * @returns {DomItem}
 */
const element = exports.element = function element (nodeName) {
  const children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
  const className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ''
  const attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {}
  attributes.className = className
  return (0, _node.node)(nodeName, null, children, attributes)
}
