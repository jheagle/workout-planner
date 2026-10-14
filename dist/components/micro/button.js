"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.button = void 0;
require("core-js/modules/es.object.assign.js");
var _element = require("./element.js");
var _text = require("./text.js");
var button = exports.button = function button(label) {
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return (0, _element.element)('button', [(0, _text.text)(label)], className, Object.assign({
    type: 'button'
  }, attributes));
};