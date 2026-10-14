"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.heading = void 0;
var _element = require("./element.js");
var heading = exports.heading = function heading() {
  var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return (0, _element.element)("h".concat(level), children, className, attributes);
};