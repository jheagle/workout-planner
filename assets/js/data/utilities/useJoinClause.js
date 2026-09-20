import { readEntity } from '../queries/readEntity.js'
import { where } from '../queries/where.js'
import { splitEntityProperty } from './splitEntityProperty.js'
import siFunciona from 'si-funciona'

export const useJoinClause = async (
  { propertyA = null, comparator = '=', propertyB = null } = {},
  dataSets = {},
  filterJoins = {}
) => {
  const { entity: entityA, property: propA } = splitEntityProperty(propertyA)
  const { entity: entityB, property: propB } = splitEntityProperty(propertyB)

  if (!dataSets.hasOwnProperty(entityA)) {
    dataSets[entityA] = await readEntity(entityA)
    filterJoins[entityA] = siFunciona.cloneObject(dataSets[entityA])
  }
  if (!dataSets.hasOwnProperty(entityB)) {
    dataSets[entityB] = await readEntity(entityB)
    filterJoins[entityB] = siFunciona.cloneObject(dataSets[entityB])
  }

  filterJoins[entityA] = filterJoins[entityB].reduce(
    (dataA, dataB) => dataA.concat(
      where(filterJoins[entityA], { property: propA, comparator: comparator, value: dataB[propB] })
    ),
    []
  )
  filterJoins[entityB] = filterJoins[entityA].reduce(
    (dataB, dataA) => dataB.concat(
      where(filterJoins[entityB], { property: propB, comparator: comparator, value: dataA[propA] })
    ),
    []
  )
  return filterJoins
}