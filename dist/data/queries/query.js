'use strict'

require('core-js/modules/es.symbol.js')
require('core-js/modules/es.symbol.description.js')
require('core-js/modules/es.symbol.iterator.js')
require('core-js/modules/es.symbol.to-primitive.js')
require('core-js/modules/es.array.iterator.js')
require('core-js/modules/es.date.to-primitive.js')
require('core-js/modules/es.function.bind.js')
require('core-js/modules/es.number.constructor.js')
require('core-js/modules/es.object.create.js')
require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.object.get-prototype-of.js')
require('core-js/modules/es.object.set-prototype-of.js')
require('core-js/modules/es.string.iterator.js')
require('core-js/modules/web.dom-collections.iterator.js')
function _typeof (o) { '@babel/helpers - typeof'; return _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (o) { return typeof o } : function (o) { return o && typeof Symbol === 'function' && o.constructor === Symbol && o !== Symbol.prototype ? 'symbol' : typeof o }, _typeof(o) }
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.query = void 0
require('core-js/modules/es.array.reduce.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/es.promise.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
const _parser = require('./parser.js')
const _insertEntity = require('./insertEntity.js')
const _readEntity = require('./readEntity.js')
const _updateEntity = require('./updateEntity.js')
const _deleteEntity = require('./deleteEntity.js')
const _where = require('./where.js')
const _joinEntity = require('./joinEntity.js')
const _mergeJoins = require('./mergeJoins.js')
const _sortBy = require('./sortBy.js')
const _groupBy = require('./groupBy.js')
function _regenerator () { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ let e; let t; const r = typeof Symbol === 'function' ? Symbol : {}; const n = r.iterator || '@@iterator'; const o = r.toStringTag || '@@toStringTag'; function i (r, n, o, i) { const c = n && n.prototype instanceof Generator ? n : Generator; const u = Object.create(c.prototype); return _regeneratorDefine2(u, '_invoke', (function (r, n, o) { let i; let c; let u; let f = 0; const p = o || []; let y = !1; var G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d (t, r) { return i = t, c = 0, u = e, G.n = r, a } }; function d (r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o; const i = p[t]; const d = G.p; const l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)) } if (o || r > 1) return a; throw y = !0, n } return function (o, p, l) { if (f > 1) throw TypeError('Generator is already running'); for (y && p === 1 && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = 'next'), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError('iterator result is not an object'); if (!t.done) return t; u = t.value, c < 2 && (c = 0) } else c === 1 && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break } catch (t) { i = e, c = 1, u = t } finally { f = 1 } } return { value: t, done: y } } }(r, o, i)), !0), u } var a = {}; function Generator () {} function GeneratorFunction () {} function GeneratorFunctionPrototype () {} t = Object.getPrototypeOf; const c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this }), t); const u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f (e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, 'GeneratorFunction')), e.prototype = Object.create(u), e } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, 'constructor', GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, 'constructor', GeneratorFunction), GeneratorFunction.displayName = 'GeneratorFunction', _regeneratorDefine2(GeneratorFunctionPrototype, o, 'GeneratorFunction'), _regeneratorDefine2(u), _regeneratorDefine2(u, o, 'Generator'), _regeneratorDefine2(u, n, function () { return this }), _regeneratorDefine2(u, 'toString', function () { return '[object Generator]' }), (_regenerator = function _regenerator () { return { w: i, m: f } })() }
function _regeneratorDefine2 (e, r, n, t) { let i = Object.defineProperty; try { i({}, '', {}) } catch (e) { i = 0 } _regeneratorDefine2 = function _regeneratorDefine (e, r, n, t) { function o (r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e) }) } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o('next', 0), o('throw', 1), o('return', 2)) }, _regeneratorDefine2(e, r, n, t) }
function _defineProperty (e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e }
function _toPropertyKey (t) { const i = _toPrimitive(t, 'string'); return _typeof(i) == 'symbol' ? i : i + '' }
function _toPrimitive (t, r) { if (_typeof(t) != 'object' || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || 'default'); if (_typeof(i) != 'object') return i; throw new TypeError('@@toPrimitive must return a primitive value.') } return (r === 'string' ? String : Number)(t) }
function asyncGeneratorStep (n, t, e, r, o, a, c) { try { var i = n[a](c); var u = i.value } catch (n) { return void e(n) } i.done ? t(u) : Promise.resolve(u).then(r, o) }
function _asyncToGenerator (n) { return function () { const t = this; const e = arguments; return new Promise(function (r, o) { const a = n.apply(t, e); function _next (n) { asyncGeneratorStep(a, r, o, _next, _throw, 'next', n) } function _throw (n) { asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n) } _next(void 0) }) } }
const query = exports.query = /* #__PURE__ */(function () {
  const _ref = _asyncToGenerator(/* #__PURE__ */_regenerator().m(function _callee () {
    let queryString
    let parsed
    let dataSet
    const _args = arguments
    let _t
    return _regenerator().w(function (_context) {
      while (1) {
        switch (_context.n) {
          case 0:
            queryString = _args.length > 0 && _args[0] !== undefined ? _args[0] : ''
            parsed = (0, _parser.parser)(queryString)
            dataSet = _defineProperty({}, parsed.entity, [])
            _t = parsed.command
            _context.n = _t === 'delete' ? 1 : _t === 'insert' ? 3 : _t === 'count' ? 5 : _t === 'read' ? 5 : _t === 'update' ? 7 : 9
            break
          case 1:
            _context.n = 2
            return (0, _deleteEntity.deleteEntity)(parsed.entity, parsed.conditions)
          case 2:
            dataSet[parsed.entity] = _context.v
            return _context.a(3, 10)
          case 3:
            _context.n = 4
            return (0, _insertEntity.insertEntity)(parsed.entity, parsed.insertValues)
          case 4:
            dataSet[parsed.entity] = _context.v
            return _context.a(3, 10)
          case 5:
            _context.n = 6
            return (0, _readEntity.readEntity)(parsed.entity)
          case 6:
            dataSet[parsed.entity] = _context.v
            return _context.a(3, 10)
          case 7:
            _context.n = 8
            return (0, _updateEntity.updateEntity)(parsed.entity, parsed.updateValues)
          case 8:
            dataSet[parsed.entity] = _context.v
            return _context.a(3, 10)
          case 9:
            throw new Error('Unknown command: '.concat(parsed.command))
          case 10:
            _context.n = 11
            return (0, _joinEntity.joinEntity)(parsed.entity, parsed.joinEntity, dataSet, parsed.joinClauses)
          case 11:
            dataSet = _context.v
            _context.n = 12
            return (0, _mergeJoins.mergeJoins)(dataSet, parsed.mergeJoins)
          case 12:
            dataSet = _context.v
            dataSet[parsed.entity] = parsed.conditions.reduce(function (remainingData, condition) {
              return (0, _where.where)(remainingData, condition)
            }, dataSet[parsed.entity])
            if (parsed.command !== 'count') {
              dataSet[parsed.entity] = (0, _sortBy.sortBy)(dataSet[parsed.entity], parsed.sortClauses)
              dataSet[parsed.entity] = (0, _groupBy.groupBy)(dataSet[parsed.entity], parsed.groupBy)
            }
            return _context.a(2, parsed.command === 'count' ? dataSet[parsed.entity].length : dataSet[parsed.entity])
        }
      }
    }, _callee)
  }))
  return function query () {
    return _ref.apply(this, arguments)
  }
}())
