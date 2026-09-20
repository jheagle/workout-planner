import { splitEntityProperty } from './splitEntityProperty.js'
import { reconcileJoin } from './reconcileJoin.js'

export const reconcileJoins = (propertyA, propertyB, dataSet) => {
  const { entity: entityA, property: propA } = splitEntityProperty(propertyA)
  const { entity: entityB, property: propB } = splitEntityProperty(propertyB)
  for (let entityName in dataSet) {
    for (let entityKey in dataSet[entityName]) {
      const entity = dataSet[entityName][entityKey]
      dataSet = reconcileJoin(dataSet, entityName, entityKey, entityA, propA)
      dataSet = reconcileJoin(dataSet, entityName, entityKey, entityB, propB)
    }
  }
  return dataSet
}