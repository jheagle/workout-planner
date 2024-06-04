'use strict'

require('core-js/modules/es.object.define-property.js')
require('core-js/modules/es.string.anchor.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.menu = void 0
require('core-js/modules/es.array.map.js')
require('core-js/modules/es.string.link.js')
require('core-js/modules/esnext.async-iterator.map.js')
require('core-js/modules/esnext.iterator.map.js')
var _unorderedList = require('../micro/unorderedList.js')
var _listItem = require('../micro/listItem.js')
var _anchor = require('../micro/anchor.js')
var _text = require('../micro/text.js')
/**
 * @typedef {Object} menuItem
 * @property {string} link
 * @property {string} text
 * @property {string} className
 */

/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {Array<menuItem>} menuItems
 * @param {string} menuClass
 * @returns {DomItem}
 */
var menu = exports.menu = function menu () {
  var menuItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  var menuClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'menu'
  return (0, _unorderedList.unorderedList)(menuItems.map(function (menuItem) {
    return (0, _listItem.listItem)([(0, _anchor.anchor)(menuItem.link, [(0, _text.text)(menuItem.text)])], menuItem.className)
  }), menuClass)
}
