'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.where = void 0
require('core-js/modules/es.array.concat.js')
require('core-js/modules/es.array.filter.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.filter.js')
const makeCondition = function makeCondition (data, property, comparator, value) {
  if (!data.hasOwnProperty(property)) {
    return false
  }
  switch (comparator) {
    case '=':
      return data[property] == value
    case '!=':
    case '<>':
      break
    case '>':
      break
    case '>=':
      break
    case '<':
      break
    case '<=':
      break
    case 'in':
      break
    case 'between':
      break
    case 'like':
      break
  }
  return false
}
const where = exports.where = function where () {
  const dataSet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
  const _ref$andOr = _ref.andOr
  const andOr = _ref$andOr === void 0 ? undefined : _ref$andOr
  const _ref$property = _ref.property
  const property = _ref$property === void 0 ? '' : _ref$property
  const _ref$joinEntity = _ref.joinEntity
  const joinEntity = _ref$joinEntity === void 0 ? undefined : _ref$joinEntity
  const _ref$comparator = _ref.comparator
  const comparator = _ref$comparator === void 0 ? '=' : _ref$comparator
  const _ref$value = _ref.value
  const value = _ref$value === void 0 ? null : _ref$value
  return dataSet.filter(function (data) {
    const testProperty = joinEntity ? ''.concat(joinEntity, '.').concat(property) : property
    return makeCondition(data, testProperty, comparator, value)
  })
}
