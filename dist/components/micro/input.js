"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.input = void 0;
require("core-js/modules/es.object.assign.js");
var _element = require("./element.js");
var input = exports.input = function input() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'text';
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  return (0, _element.element)('input', [], className, Object.assign({
    type: type
  }, attributes));
};