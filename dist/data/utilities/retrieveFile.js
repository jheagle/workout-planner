'use strict'

function _typeof (o) { '@babel/helpers - typeof'; return _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (o) { return typeof o } : function (o) { return o && typeof Symbol === 'function' && o.constructor === Symbol && o !== Symbol.prototype ? 'symbol' : typeof o }, _typeof(o) }
require('core-js/modules/es.symbol.js')
require('core-js/modules/es.symbol.description.js')
require('core-js/modules/es.symbol.iterator.js')
require('core-js/modules/es.array.iterator.js')
require('core-js/modules/es.function.bind.js')
require('core-js/modules/es.object.create.js')
require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.object.get-own-property-descriptor.js')
require('core-js/modules/es.object.get-prototype-of.js')
require('core-js/modules/es.object.set-prototype-of.js')
require('core-js/modules/es.string.iterator.js')
require('core-js/modules/es.weak-map.js')
require('core-js/modules/esnext.weak-map.delete-all.js')
require('core-js/modules/web.dom-collections.iterator.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveFile = void 0
require('core-js/modules/es.array.concat.js')
require('core-js/modules/es.object.keys.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/es.promise.js')
const jsEnv = _interopRequireWildcard(require('browser-or-node'))
function _interopRequireWildcard (e, t) { if (typeof WeakMap === 'function') var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard (e, t) { if (!t && e && e.__esModule) return e; let o; let i; const f = { __proto__: null, default: e }; if (e === null || _typeof(e) != 'object' && typeof e !== 'function') return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f) } for (const _t in e) _t !== 'default' && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f })(e, t) }
function _regenerator () { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ let e; let t; const r = typeof Symbol === 'function' ? Symbol : {}; const n = r.iterator || '@@iterator'; const o = r.toStringTag || '@@toStringTag'; function i (r, n, o, i) { const c = n && n.prototype instanceof Generator ? n : Generator; const u = Object.create(c.prototype); return _regeneratorDefine2(u, '_invoke', (function (r, n, o) { let i; let c; let u; let f = 0; const p = o || []; let y = !1; var G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d (t, r) { return i = t, c = 0, u = e, G.n = r, a } }; function d (r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o; const i = p[t]; const d = G.p; const l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)) } if (o || r > 1) return a; throw y = !0, n } return function (o, p, l) { if (f > 1) throw TypeError('Generator is already running'); for (y && p === 1 && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = 'next'), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError('iterator result is not an object'); if (!t.done) return t; u = t.value, c < 2 && (c = 0) } else c === 1 && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break } catch (t) { i = e, c = 1, u = t } finally { f = 1 } } return { value: t, done: y } } }(r, o, i)), !0), u } var a = {}; function Generator () {} function GeneratorFunction () {} function GeneratorFunctionPrototype () {} t = Object.getPrototypeOf; const c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this }), t); const u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f (e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, 'GeneratorFunction')), e.prototype = Object.create(u), e } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, 'constructor', GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, 'constructor', GeneratorFunction), GeneratorFunction.displayName = 'GeneratorFunction', _regeneratorDefine2(GeneratorFunctionPrototype, o, 'GeneratorFunction'), _regeneratorDefine2(u), _regeneratorDefine2(u, o, 'Generator'), _regeneratorDefine2(u, n, function () { return this }), _regeneratorDefine2(u, 'toString', function () { return '[object Generator]' }), (_regenerator = function _regenerator () { return { w: i, m: f } })() }
function _regeneratorDefine2 (e, r, n, t) { let i = Object.defineProperty; try { i({}, '', {}) } catch (e) { i = 0 } _regeneratorDefine2 = function _regeneratorDefine (e, r, n, t) { function o (r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e) }) } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o('next', 0), o('throw', 1), o('return', 2)) }, _regeneratorDefine2(e, r, n, t) }
function asyncGeneratorStep (n, t, e, r, o, a, c) { try { var i = n[a](c); var u = i.value } catch (n) { return void e(n) } i.done ? t(u) : Promise.resolve(u).then(r, o) }
function _asyncToGenerator (n) { return function () { const t = this; const e = arguments; return new Promise(function (r, o) { const a = n.apply(t, e); function _next (n) { asyncGeneratorStep(a, r, o, _next, _throw, 'next', n) } function _throw (n) { asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n) } _next(void 0) }) } }
// import * as gulpConfig from 'js-build-tools/gulp.config.mjs'

var gulpConfig = typeof gulpConfig !== 'undefined' ? gulpConfig : {}
let retrieveFn = function retrieveFn (url) {
  return fetch(url).then(function (res) {
    return res.json()
  })
}
let relativePath = ''
if (jsEnv.isNode) {
  gulpConfig = require('js-build-tools/gulp.config')
  const _require = require('fs/promises')
  const readFile = _require.readFile
  retrieveFn = function retrieveFn (url) {
    return readFile(url).then(function (res) {
      return JSON.parse(res)
    })
  }
}
if (jsEnv.isBrowser) {
  relativePath = gulpConfig.get('relativePath', 'http://joshuaheagle.local/projects/workout-planner/')
}
const databasePath = gulpConfig.get('databasePath', 'database/')
const retrieveFile = exports.retrieveFile = /* #__PURE__ */(function () {
  const _ref = _asyncToGenerator(/* #__PURE__ */_regenerator().m(function _callee (path) {
    let fetchUrl, recordInfo
    return _regenerator().w(function (_context) {
      while (1) {
        switch (_context.n) {
          case 0:
            fetchUrl = ''.concat(relativePath).concat(databasePath).concat(path)
            _context.n = 1
            return retrieveFn(fetchUrl).catch(function (err) {
              return console.error(err)
            })
          case 1:
            recordInfo = _context.v
            if (recordInfo) {
              _context.n = 2
              break
            }
            throw new Error('Could not read '.concat(path))
          case 2:
            return _context.a(2, recordInfo)
        }
      }
    }, _callee)
  }))
  return function retrieveFile (_x) {
    return _ref.apply(this, arguments)
  }
}())
