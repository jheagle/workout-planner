'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.text = void 0
var _node = require('./node.js')
/**
 * Create the template of a DomItem
 * @param {string} nodeValue
 * @returns {DomItem}
 */
var text = exports.text = function text () {
  var nodeValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  return (0, _node.node)('#text', nodeValue)
}
