const commandMatch = /^(count|delete|insert|read|update)\s+([a-z0-9_-]+)[\w\n]*/i

const joinEntityMatch = /\.([a-z0-9_-]+)/i
const joinClauseMatch = /(and)?\s*on\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+(=|!=|>|<|>=|<=|in|between|like)\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig

const mergeJoinMatch = /(and)?\s*merge\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+with\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig

const conditionMatch = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig

const sortMatch = /sort\s+([a-z0-9._-]+\s*(asc|desc)?)+\s*(,\s*[a-z0-9._-]+\s*(asc|desc)?)*/i
const sortRuleMatch = /(sort)?\s*,?\s*([a-z0-9._-]+)\s*(asc|desc)?/ig

const groupMatch = /group\s+by\s+(,?[a-z0-9._-]+)+/i

const removeFromQuery = (substring, query) => query.replace(substring, '').trim()

export const parser = (query = '') => {
  let remainingQuery = query
  const commandFound = remainingQuery.match(commandMatch)
  let action = undefined
  let entity = undefined
  if (commandFound) {
    action = commandFound[1]
    entity = commandFound[2]
    remainingQuery = removeFromQuery(commandFound[0], remainingQuery)
  }

  let joinEntity = undefined
  const joinEntityFound = remainingQuery.match(joinEntityMatch)
  if (joinEntityFound) {
    joinEntity = joinEntityFound ? joinEntityFound[1] : undefined
    remainingQuery = removeFromQuery(joinEntityFound[0], remainingQuery)
  }

  const joinClausesFound = remainingQuery.matchAll(joinClauseMatch)
  let joinClauses = []
  for (let joinClause of joinClausesFound) {
    joinClauses.push({
      and: joinClause[1],
      propertyA: joinClause[2],
      comparator: joinClause[3],
      propertyB: joinClause[4]
    })
    remainingQuery = removeFromQuery(joinClause[0], remainingQuery)
  }

  const mergeJoinsFound = remainingQuery.matchAll(mergeJoinMatch)
  let mergeJoins = []
  for (let mergeJoin of mergeJoinsFound) {
    mergeJoins.push({
      propertyA: mergeJoin[2],
      propertyB: mergeJoin[3]
    })
    remainingQuery = removeFromQuery(mergeJoinsFound[0], remainingQuery)
  }

  const conditionsFound = remainingQuery.matchAll(conditionMatch)
  const conditions = []
  for (let condition of conditionsFound) {
    conditions.push({
      andOr: condition[1],
      property: condition[3],
      comparator: condition[4],
      value: condition[6]
    })
    remainingQuery = removeFromQuery(condition[0], remainingQuery)
  }

  const sortFound = remainingQuery.match(sortMatch)
  let sortClauses = []
  if (sortFound) {
    remainingQuery = removeFromQuery(sortFound[0], remainingQuery)
    const sortRulesFound = sortFound[0].matchAll(sortRuleMatch)
    for (let sortClause of sortRulesFound) {
      sortClauses.push({
        property: sortClause[2],
        direction: sortClause[3] || 'asc',
      })
    }
  }

  const groupFound = remainingQuery.match(groupMatch)
  let groupClause = undefined
  if (groupFound) {
    remainingQuery = removeFromQuery(groupFound[0], remainingQuery)
    groupClause = groupFound ? groupFound[1] : undefined
  }

  return {
    command: action,
    entity: entity,
    joinEntity: joinEntity,
    joinClauses: joinClauses,
    mergeJoins: mergeJoins,
    sortClauses: sortClauses,
    groupBy: groupClause,
    conditions: conditions
  }
}
