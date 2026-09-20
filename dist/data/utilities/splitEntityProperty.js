'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.splitEntityProperty = void 0
require('core-js/modules/es.regexp.exec.js')
require('core-js/modules/es.string.match.js')
const entityMatch = /^[a-z0-9_-]+/i
const propertyMatch = /\.([a-z0-9_-]+)$/i
const splitEntityProperty = exports.splitEntityProperty = function splitEntityProperty (entityProp) {
  const entityFound = entityProp.match(entityMatch)
  if (!entityFound) {
    throw new Error('Unable to use property: '.concat(entityProp))
  }
  const propFound = entityProp.match(propertyMatch)
  if (!propFound) {
    throw new Error('Unable to use property: '.concat(entityProp))
  }
  return {
    entity: entityFound[0],
    property: propFound[1]
  }
}
