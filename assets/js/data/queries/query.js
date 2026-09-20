import { parser } from './parser.js'
import { insertEntity } from './insertEntity.js'
import { readEntity } from './readEntity.js'
import { updateEntity } from './updateEntity.js'
import { deleteEntity } from './deleteEntity.js'
import { where } from './where.js'
import { joinEntity } from './joinEntity.js'
import { mergeJoins } from './mergeJoins.js'
import { sortBy } from './sortBy.js'
import { groupBy } from './groupBy.js'

export const query = async (queryString = '') => {
  const parsed = parser(queryString)

  let dataSet = { [parsed.entity]: [] }
  switch (parsed.command) {
    case 'delete':
      dataSet[parsed.entity] = await deleteEntity(parsed.entity, parsed.conditions)
      break
    case 'insert':
      dataSet[parsed.entity] = await insertEntity(parsed.entity, parsed.insertValues)
      break
    case 'count':
    case 'read':
      dataSet[parsed.entity] = await readEntity(parsed.entity)
      break
    case 'update':
      dataSet[parsed.entity] = await updateEntity(parsed.entity, parsed.updateValues)
      break
    default:
      throw new Error(`Unknown command: ${parsed.command}`)
  }
  dataSet = await joinEntity(parsed.entity, parsed.joinEntity, dataSet, parsed.joinClauses)
  dataSet = await mergeJoins(dataSet, parsed.mergeJoins)

  dataSet[parsed.entity] = parsed.conditions.reduce(
    (remainingData, condition) => {
      return where(remainingData, condition)
    },
    dataSet[parsed.entity]
  )

  if (parsed.command !== 'count') {
    dataSet[parsed.entity] = sortBy(dataSet[parsed.entity], parsed.sortClauses)
    dataSet[parsed.entity] = groupBy(dataSet[parsed.entity], parsed.groupBy)
  }

  return parsed.command === 'count' ? dataSet[parsed.entity].length : dataSet[parsed.entity]
}
