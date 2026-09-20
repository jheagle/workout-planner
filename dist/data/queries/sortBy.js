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
require('core-js/modules/es.regexp.exec.js')
require('core-js/modules/es.regexp.test.js')
require('core-js/modules/es.regexp.to-string.js')
require('core-js/modules/es.string.iterator.js')
require('core-js/modules/web.dom-collections.iterator.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.sortBy = void 0
require('core-js/modules/es.array.sort.js')
function _createForOfIteratorHelper (r, e) { let t = typeof Symbol !== 'undefined' && r[Symbol.iterator] || r['@@iterator']; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length === 'number') { t && (r = t); let _n = 0; const F = function F () {}; return { s: F, n: function n () { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] } }, e: function e (r) { throw r }, f: F } } throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.') } let o; let a = !0; let u = !1; return { s: function s () { t = t.call(r) }, n: function n () { const r = t.next(); return a = r.done, r }, e: function e (r) { u = !0, o = r }, f: function f () { try { a || t.return == null || t.return() } finally { if (u) throw o } } } }
function _unsupportedIterableToArray (r, a) { if (r) { if (typeof r === 'string') return _arrayLikeToArray(r, a); let t = {}.toString.call(r).slice(8, -1); return t === 'Object' && r.constructor && (t = r.constructor.name), t === 'Map' || t === 'Set' ? Array.from(r) : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0 } }
function _arrayLikeToArray (r, a) { (a == null || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n }
const sortBy = exports.sortBy = function sortBy () {
  const dataSet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const sortClauses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
  if (!sortClauses.length) {
    return dataSet
  }
  dataSet.sort(function (a, b) {
    const _iterator = _createForOfIteratorHelper(sortClauses)
    let _step
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const sortClause = _step.value
        const property = sortClause.property
        const direction = sortClause.direction
        if (a[property] == b[property]) {
          continue
        }
        const result = a[property] < b[property] ? -1 : 1
        return direction === 'asc' ? result : result * -1
      }
    } catch (err) {
      _iterator.e(err)
    } finally {
      _iterator.f()
    }
    return 0
  })
  return dataSet
}
