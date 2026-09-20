'use strict'

require('core-js/modules/es.symbol.js')
require('core-js/modules/es.symbol.description.js')
require('core-js/modules/es.symbol.iterator.js')
require('core-js/modules/es.array.from.js')
require('core-js/modules/es.array.is-array.js')
require('core-js/modules/es.array.iterator.js')
require('core-js/modules/es.array.slice.js')
require('core-js/modules/es.date.to-string.js')
require('core-js/modules/es.function.name.js')
require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/es.regexp.test.js')
require('core-js/modules/es.regexp.to-string.js')
require('core-js/modules/es.string.iterator.js')
require('core-js/modules/web.dom-collections.iterator.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.parser = void 0
require('core-js/modules/es.regexp.exec.js')
require('core-js/modules/es.string.match.js')
require('core-js/modules/es.string.match-all.js')
require('core-js/modules/es.string.replace.js')
require('core-js/modules/es.string.trim.js')
function _createForOfIteratorHelper (r, e) { let t = typeof Symbol !== 'undefined' && r[Symbol.iterator] || r['@@iterator']; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length === 'number') { t && (r = t); let _n = 0; const F = function F () {}; return { s: F, n: function n () { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] } }, e: function e (r) { throw r }, f: F } } throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.') } let o; let a = !0; let u = !1; return { s: function s () { t = t.call(r) }, n: function n () { const r = t.next(); return a = r.done, r }, e: function e (r) { u = !0, o = r }, f: function f () { try { a || t.return == null || t.return() } finally { if (u) throw o } } } }
function _unsupportedIterableToArray (r, a) { if (r) { if (typeof r === 'string') return _arrayLikeToArray(r, a); let t = {}.toString.call(r).slice(8, -1); return t === 'Object' && r.constructor && (t = r.constructor.name), t === 'Map' || t === 'Set' ? Array.from(r) : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0 } }
function _arrayLikeToArray (r, a) { (a == null || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n }
const commandMatch = /^(count|delete|insert|read|update)\s+([a-z0-9_-]+)[\w\n]*/i
const joinEntityMatch = /\.([a-z0-9_-]+)/i
const joinClauseMatch = /(and)?\s*on\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+(=|!=|>|<|>=|<=|in|between|like)\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig
const mergeJoinMatch = /(and)?\s*merge\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+with\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig
const conditionMatch = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig
const sortMatch = /sort\s+([a-z0-9._-]+\s*(asc|desc)?)+\s*(,\s*[a-z0-9._-]+\s*(asc|desc)?)*/i
const sortRuleMatch = /(sort)?\s*,?\s*([a-z0-9._-]+)\s*(asc|desc)?/ig
const groupMatch = /group\s+by\s+(,?[a-z0-9._-]+)+/i
const removeFromQuery = function removeFromQuery (substring, query) {
  return query.replace(substring, '').trim()
}
const parser = exports.parser = function parser () {
  const query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  let remainingQuery = query
  const commandFound = remainingQuery.match(commandMatch)
  let action
  let entity
  if (commandFound) {
    action = commandFound[1]
    entity = commandFound[2]
    remainingQuery = removeFromQuery(commandFound[0], remainingQuery)
  }
  let joinEntity
  const joinEntityFound = remainingQuery.match(joinEntityMatch)
  if (joinEntityFound) {
    joinEntity = joinEntityFound ? joinEntityFound[1] : undefined
    remainingQuery = removeFromQuery(joinEntityFound[0], remainingQuery)
  }
  const joinClausesFound = remainingQuery.matchAll(joinClauseMatch)
  const joinClauses = []
  const _iterator = _createForOfIteratorHelper(joinClausesFound)
  let _step
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const joinClause = _step.value
      joinClauses.push({
        and: joinClause[1],
        propertyA: joinClause[2],
        comparator: joinClause[3],
        propertyB: joinClause[4]
      })
      remainingQuery = removeFromQuery(joinClause[0], remainingQuery)
    }
  } catch (err) {
    _iterator.e(err)
  } finally {
    _iterator.f()
  }
  const mergeJoinsFound = remainingQuery.matchAll(mergeJoinMatch)
  const mergeJoins = []
  const _iterator2 = _createForOfIteratorHelper(mergeJoinsFound)
  let _step2
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      const mergeJoin = _step2.value
      mergeJoins.push({
        propertyA: mergeJoin[2],
        propertyB: mergeJoin[3]
      })
      remainingQuery = removeFromQuery(mergeJoinsFound[0], remainingQuery)
    }
  } catch (err) {
    _iterator2.e(err)
  } finally {
    _iterator2.f()
  }
  const conditionsFound = remainingQuery.matchAll(conditionMatch)
  const conditions = []
  const _iterator3 = _createForOfIteratorHelper(conditionsFound)
  let _step3
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      const condition = _step3.value
      conditions.push({
        andOr: condition[1],
        property: condition[3],
        comparator: condition[4],
        value: condition[6]
      })
      remainingQuery = removeFromQuery(condition[0], remainingQuery)
    }
  } catch (err) {
    _iterator3.e(err)
  } finally {
    _iterator3.f()
  }
  const sortFound = remainingQuery.match(sortMatch)
  const sortClauses = []
  if (sortFound) {
    remainingQuery = removeFromQuery(sortFound[0], remainingQuery)
    const sortRulesFound = sortFound[0].matchAll(sortRuleMatch)
    const _iterator4 = _createForOfIteratorHelper(sortRulesFound)
    let _step4
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        const sortClause = _step4.value
        sortClauses.push({
          property: sortClause[2],
          direction: sortClause[3] || 'asc'
        })
      }
    } catch (err) {
      _iterator4.e(err)
    } finally {
      _iterator4.f()
    }
  }
  const groupFound = remainingQuery.match(groupMatch)
  let groupClause
  if (groupFound) {
    remainingQuery = removeFromQuery(groupFound[0], remainingQuery)
    groupClause = groupFound ? groupFound[1] : undefined
  }
  return {
    command: action,
    entity,
    joinEntity,
    joinClauses,
    mergeJoins,
    sortClauses,
    groupBy: groupClause,
    conditions
  }
}
