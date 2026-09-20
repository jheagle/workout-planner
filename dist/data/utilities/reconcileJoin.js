'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.reconcileJoin = void 0
require('core-js/modules/es.array.for-each.js')
require('core-js/modules/es.array.is-array.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.for-each.js')
require('core-js/modules/web.dom-collections.for-each.js')
const _where = require('../queries/where.js')
const reconcileJoin = exports.reconcileJoin = function reconcileJoin (dataSet, entityName, entityKey, joinEntity, joinProp) {
  const entity = dataSet[entityName][entityKey]
  if (entity.hasOwnProperty(joinEntity) && Array.isArray(entity[joinEntity])) {
    entity[joinEntity].forEach(function (mergedEntity, k) {
      const matchedEntity = (0, _where.where)(dataSet[joinEntity], {
        property: joinProp,
        comparator: '=',
        value: mergedEntity[joinProp]
      })
      if (matchedEntity.length) {
        dataSet[entityName][entityKey][joinEntity][k] = matchedEntity[0]
      }
    })
  }
  return dataSet
}
