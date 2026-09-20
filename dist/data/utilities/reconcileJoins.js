'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.reconcileJoins = void 0
const _splitEntityProperty3 = require('./splitEntityProperty.js')
const _reconcileJoin = require('./reconcileJoin.js')
const reconcileJoins = exports.reconcileJoins = function reconcileJoins (propertyA, propertyB, dataSet) {
  const _splitEntityProperty = (0, _splitEntityProperty3.splitEntityProperty)(propertyA)
  const entityA = _splitEntityProperty.entity
  const propA = _splitEntityProperty.property
  const _splitEntityProperty2 = (0, _splitEntityProperty3.splitEntityProperty)(propertyB)
  const entityB = _splitEntityProperty2.entity
  const propB = _splitEntityProperty2.property
  for (const entityName in dataSet) {
    for (const entityKey in dataSet[entityName]) {
      const entity = dataSet[entityName][entityKey]
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityA, propA)
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityB, propB)
    }
  }
  return dataSet
}
