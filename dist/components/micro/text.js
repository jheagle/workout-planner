'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.text = void 0
const _node = require('./node.js')
/**
 * Create the template of a DomItem
 * @param {string} nodeValue
 * @returns {DomItem}
 */
const text = exports.text = function text () {
  const nodeValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  return (0, _node.node)('#text', nodeValue)
}
