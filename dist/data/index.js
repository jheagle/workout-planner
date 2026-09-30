'use strict'

require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.object.to-string.js')
require('core-js/modules/es.promise.js')
require('core-js/modules/esnext.async-iterator.constructor.js')
require('core-js/modules/esnext.async-iterator.drop.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.drop.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
Object.defineProperty(exports, 'create', {
  enumerable: true,
  get: function get () {
    return _jsonFsQuery.create
  }
})
Object.defineProperty(exports, 'describe', {
  enumerable: true,
  get: function get () {
    return _jsonFsQuery.describe
  }
})
Object.defineProperty(exports, 'drop', {
  enumerable: true,
  get: function get () {
    return _jsonFsQuery.drop
  }
})
Object.defineProperty(exports, 'query', {
  enumerable: true,
  get: function get () {
    return _jsonFsQuery.query
  }
})
var _jsonFsQuery = require('json-fs-query');
(0, _jsonFsQuery.configure)({
  databasePath: 'database/'
})
