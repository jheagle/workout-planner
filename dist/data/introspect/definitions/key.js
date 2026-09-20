'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.key = void 0
const key = exports.key = function key () {
  const _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  const _ref$type = _ref.type
  const type = _ref$type === void 0 ? 'index' : _ref$type
  const _ref$references = _ref.references
  let references = _ref$references === void 0 ? [] : _ref$references
  const _ref$autoGenerate = _ref.autoGenerate
  let autoGenerate = _ref$autoGenerate === void 0 ? false : _ref$autoGenerate
  switch (type) {
    case 'primary':
      autoGenerate = true
    case 'index':
    case 'unique':
      references = ['self']
      break
    case 'multi':
      if (references.length < 2) {
        throw new Error('Multi key indicated with less than two references')
      }
      break
    case 'foreign':
      if (references.length !== 1) {
        throw new Error('Foreign key must have one reference to an external record')
      }
      break
    default:
      throw new Error('Unrecognized key type; must be index, primary, unique, multi, or foreign')
  }
  return {
    type,
    references,
    autoGenerate
  }
}
