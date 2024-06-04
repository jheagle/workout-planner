'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.style = void 0
var _node = require('./node.js')
var _text = require('./text.js')
var style = exports.style = function style () {
  var styleContent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  return (0, _node.node)('style', null, [(0, _text.text)(styleContent)])
}
