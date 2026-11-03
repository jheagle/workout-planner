"use strict";

require("core-js/modules/esnext.async-iterator.constructor.js");
require("core-js/modules/esnext.async-iterator.drop.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.drop.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "configure", {
  enumerable: true,
  get: function () {
    return _jsonFsQuery.configure;
  }
});
Object.defineProperty(exports, "create", {
  enumerable: true,
  get: function () {
    return _jsonFsQuery.create;
  }
});
Object.defineProperty(exports, "describe", {
  enumerable: true,
  get: function () {
    return _jsonFsQuery.describe;
  }
});
Object.defineProperty(exports, "drop", {
  enumerable: true,
  get: function () {
    return _jsonFsQuery.drop;
  }
});
Object.defineProperty(exports, "query", {
  enumerable: true,
  get: function () {
    return _jsonFsQuery.query;
  }
});
Object.defineProperty(exports, "quote", {
  enumerable: true,
  get: function () {
    return _jsonFsQuery.quote;
  }
});
var _jsonFsQuery = require("json-fs-query");
(0, _jsonFsQuery.configure)({
  databasePath: 'database/'
});