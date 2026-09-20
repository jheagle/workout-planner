'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.field = void 0
require('core-js/modules/es.array.iterator.js')
require('core-js/modules/es.array.map.js')
require('core-js/modules/es.function.name.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.map.js')
require('core-js/modules/web.dom-collections.iterator.js')
const _key = require('./key.js')
const field = exports.field = function field () {
  const _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  const _ref$name = _ref.name
  const name = _ref$name === void 0 ? '_id' : _ref$name
  const _ref$type = _ref.type
  const type = _ref$type === void 0 ? 'string' : _ref$type
  const _ref$optional = _ref.optional
  const optional = _ref$optional === void 0 ? false : _ref$optional
  const _ref$useDefault = _ref.useDefault
  const useDefault = _ref$useDefault === void 0 ? false : _ref$useDefault
  const _ref$defaultValue = _ref.defaultValue
  const defaultValue = _ref$defaultValue === void 0 ? '' : _ref$defaultValue
  const _ref$keys = _ref.keys
  const keys = _ref$keys === void 0 ? [] : _ref$keys
  const returnField = {
    name,
    type,
    optional,
    keys: keys.map(_key.key)
  }
  if (useDefault) {
    returnField.default = defaultValue
  }
  return returnField
}
