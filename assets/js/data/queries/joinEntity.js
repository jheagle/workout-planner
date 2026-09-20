import siFunciona from 'si-funciona'
import { readEntity } from './readEntity.js'
import { useJoinClause } from '../utilities/useJoinClause.js'

export const joinEntity = async (entity, joinEntity, dataSets = {}, joinClauses = []) => {
  if (!dataSets.hasOwnProperty(entity)) {
    dataSets[entity] = await readEntity(entity)
  }
  if (joinEntity && !dataSets.hasOwnProperty(joinEntity)) {
    dataSets[joinEntity] = await readEntity(joinEntity)
  }
  if (!joinClauses.length) {
    return dataSets
  }
  for (const anEntity in dataSets[entity]) {
    let filterJoins = siFunciona.cloneObject(dataSets)
    filterJoins[entity] = [dataSets[entity][anEntity]]
    for (let joinClause of joinClauses) {
      filterJoins = await useJoinClause(joinClause, dataSets, filterJoins)
    }
    dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity]
  }
  return dataSets
}