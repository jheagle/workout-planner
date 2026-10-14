"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.option = void 0;
require("core-js/modules/es.object.assign.js");
var _element = require("./element.js");
var _text = require("./text.js");
var option = exports.option = function option(value, label) {
  var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return (0, _element.element)('option', [(0, _text.text)(label)], className, Object.assign({
    value: value
  }, attributes));
};