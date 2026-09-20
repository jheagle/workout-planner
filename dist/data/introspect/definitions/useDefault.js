'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.useDefault = void 0
const useDefault = exports.useDefault = function useDefault () {
  const defaultValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  const value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined
  if (typeof value === 'undefined') {
    return defaultValue
  }
  return value
}
