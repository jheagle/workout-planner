"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copyDatabase = void 0;
var _promises = _interopRequireDefault(require("fs/promises"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Copy the real database/ directory into an isolated test directory, so insert/update tests have
 * real seed data to work with without ever touching the actual database/ this app runs against.
 * @param destination
 */
const copyDatabase = async (destination = 'test-database/') => _promises.default.cp('database/', destination, {
  recursive: true
});
exports.copyDatabase = copyDatabase;