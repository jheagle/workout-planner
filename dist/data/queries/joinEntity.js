'use strict'

require('core-js/modules/es.symbol.js')
require('core-js/modules/es.symbol.description.js')
require('core-js/modules/es.symbol.iterator.js')
require('core-js/modules/es.array.from.js')
require('core-js/modules/es.array.is-array.js')
require('core-js/modules/es.array.iterator.js')
require('core-js/modules/es.array.slice.js')
require('core-js/modules/es.date.to-string.js')
require('core-js/modules/es.function.bind.js')
require('core-js/modules/es.function.name.js')
require('core-js/modules/es.object.create.js')
require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.object.get-prototype-of.js')
require('core-js/modules/es.object.set-prototype-of.js')
require('core-js/modules/es.regexp.exec.js')
require('core-js/modules/es.regexp.test.js')
require('core-js/modules/es.regexp.to-string.js')
require('core-js/modules/es.string.iterator.js')
require('core-js/modules/web.dom-collections.iterator.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.joinEntity = void 0
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/es.promise.js')
const _siFunciona = _interopRequireDefault(require('si-funciona'))
const _readEntity = require('./readEntity.js')
const _useJoinClause = require('../utilities/useJoinClause.js')
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
function _regeneratorKeys (e) { const n = Object(e); const r = []; for (var t in n) r.unshift(t); return function e () { for (; r.length;) if ((t = r.pop()) in n) return e.value = t, e.done = !1, e; return e.done = !0, e } }
function _regenerator () { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ let e; let t; const r = typeof Symbol === 'function' ? Symbol : {}; const n = r.iterator || '@@iterator'; const o = r.toStringTag || '@@toStringTag'; function i (r, n, o, i) { const c = n && n.prototype instanceof Generator ? n : Generator; const u = Object.create(c.prototype); return _regeneratorDefine2(u, '_invoke', (function (r, n, o) { let i; let c; let u; let f = 0; const p = o || []; let y = !1; var G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d (t, r) { return i = t, c = 0, u = e, G.n = r, a } }; function d (r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o; const i = p[t]; const d = G.p; const l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)) } if (o || r > 1) return a; throw y = !0, n } return function (o, p, l) { if (f > 1) throw TypeError('Generator is already running'); for (y && p === 1 && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = 'next'), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError('iterator result is not an object'); if (!t.done) return t; u = t.value, c < 2 && (c = 0) } else c === 1 && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break } catch (t) { i = e, c = 1, u = t } finally { f = 1 } } return { value: t, done: y } } }(r, o, i)), !0), u } var a = {}; function Generator () {} function GeneratorFunction () {} function GeneratorFunctionPrototype () {} t = Object.getPrototypeOf; const c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this }), t); const u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f (e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, 'GeneratorFunction')), e.prototype = Object.create(u), e } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, 'constructor', GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, 'constructor', GeneratorFunction), GeneratorFunction.displayName = 'GeneratorFunction', _regeneratorDefine2(GeneratorFunctionPrototype, o, 'GeneratorFunction'), _regeneratorDefine2(u), _regeneratorDefine2(u, o, 'Generator'), _regeneratorDefine2(u, n, function () { return this }), _regeneratorDefine2(u, 'toString', function () { return '[object Generator]' }), (_regenerator = function _regenerator () { return { w: i, m: f } })() }
function _regeneratorDefine2 (e, r, n, t) { let i = Object.defineProperty; try { i({}, '', {}) } catch (e) { i = 0 } _regeneratorDefine2 = function _regeneratorDefine (e, r, n, t) { function o (r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e) }) } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o('next', 0), o('throw', 1), o('return', 2)) }, _regeneratorDefine2(e, r, n, t) }
function _createForOfIteratorHelper (r, e) { let t = typeof Symbol !== 'undefined' && r[Symbol.iterator] || r['@@iterator']; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length === 'number') { t && (r = t); let _n = 0; const F = function F () {}; return { s: F, n: function n () { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] } }, e: function e (r) { throw r }, f: F } } throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.') } let o; let a = !0; let u = !1; return { s: function s () { t = t.call(r) }, n: function n () { const r = t.next(); return a = r.done, r }, e: function e (r) { u = !0, o = r }, f: function f () { try { a || t.return == null || t.return() } finally { if (u) throw o } } } }
function _unsupportedIterableToArray (r, a) { if (r) { if (typeof r === 'string') return _arrayLikeToArray(r, a); let t = {}.toString.call(r).slice(8, -1); return t === 'Object' && r.constructor && (t = r.constructor.name), t === 'Map' || t === 'Set' ? Array.from(r) : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0 } }
function _arrayLikeToArray (r, a) { (a == null || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n }
function asyncGeneratorStep (n, t, e, r, o, a, c) { try { var i = n[a](c); var u = i.value } catch (n) { return void e(n) } i.done ? t(u) : Promise.resolve(u).then(r, o) }
function _asyncToGenerator (n) { return function () { const t = this; const e = arguments; return new Promise(function (r, o) { const a = n.apply(t, e); function _next (n) { asyncGeneratorStep(a, r, o, _next, _throw, 'next', n) } function _throw (n) { asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n) } _next(void 0) }) } }
const joinEntity = exports.joinEntity = /* #__PURE__ */(function () {
  const _ref = _asyncToGenerator(/* #__PURE__ */_regenerator().m(function _callee (entity, _joinEntity) {
    let dataSets
    let joinClauses
    let anEntity
    let filterJoins
    let _iterator
    let _step
    let joinClause
    const _args = arguments
    let _t
    let _t2
    let _t3
    return _regenerator().w(function (_context) {
      while (1) {
        switch (_context.p = _context.n) {
          case 0:
            dataSets = _args.length > 2 && _args[2] !== undefined ? _args[2] : {}
            joinClauses = _args.length > 3 && _args[3] !== undefined ? _args[3] : []
            if (dataSets.hasOwnProperty(entity)) {
              _context.n = 2
              break
            }
            _context.n = 1
            return (0, _readEntity.readEntity)(entity)
          case 1:
            dataSets[entity] = _context.v
          case 2:
            if (!(_joinEntity && !dataSets.hasOwnProperty(_joinEntity))) {
              _context.n = 4
              break
            }
            _context.n = 3
            return (0, _readEntity.readEntity)(_joinEntity)
          case 3:
            dataSets[_joinEntity] = _context.v
          case 4:
            if (joinClauses.length) {
              _context.n = 5
              break
            }
            return _context.a(2, dataSets)
          case 5:
            _t = _regeneratorKeys(dataSets[entity])
          case 6:
            if ((_t2 = _t()).done) {
              _context.n = 15
              break
            }
            anEntity = _t2.value
            filterJoins = _siFunciona.default.cloneObject(dataSets)
            filterJoins[entity] = [dataSets[entity][anEntity]]
            _iterator = _createForOfIteratorHelper(joinClauses)
            _context.p = 7
            _iterator.s()
          case 8:
            if ((_step = _iterator.n()).done) {
              _context.n = 11
              break
            }
            joinClause = _step.value
            _context.n = 9
            return (0, _useJoinClause.useJoinClause)(joinClause, dataSets, filterJoins)
          case 9:
            filterJoins = _context.v
          case 10:
            _context.n = 8
            break
          case 11:
            _context.n = 13
            break
          case 12:
            _context.p = 12
            _t3 = _context.v
            _iterator.e(_t3)
          case 13:
            _context.p = 13
            _iterator.f()
            return _context.f(13)
          case 14:
            dataSets[entity][anEntity][_joinEntity] = filterJoins[_joinEntity]
            _context.n = 6
            break
          case 15:
            return _context.a(2, dataSets)
        }
      }
    }, _callee, null, [[7, 12, 13, 14]])
  }))
  return function joinEntity (_x, _x2) {
    return _ref.apply(this, arguments)
  }
}())
