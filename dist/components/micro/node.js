'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.node = void 0
/**
 * Create the template of a DomItem
 * @param {string} nodeName
 * @param {string} nodeValue
 * @param {array} [children=[]]
 * @param {object} [attributes={}]
 * @returns {DomItem}
 */
const node = exports.node = function node (nodeName, nodeValue) {
  const children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : []
  const attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {}
  return jsonDom.createDomItem({
    nodeName,
    nodeValue,
    attributes,
    children
  })
}
