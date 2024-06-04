'use strict'

require('core-js/modules/es.object.define-property.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.pageNavigation = void 0
var _nav = require('../micro/nav.js')
var _span = require('../micro/span.js')
var _header = require('../micro/header.js')
var _listItem = require('../micro/listItem.js')
var _menu = require('../macro/menu.js')
/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {number} currentIndex
 * @returns {DomItem}
 */
var pageNavigation = exports.pageNavigation = function pageNavigation () {
  var currentIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1
  var menuNav = (0, _menu.menu)([{
    link: '#intro',
    text: 'Hello',
    className: 'third-menu'
  }, {
    link: '#profile',
    text: 'Meet Me',
    className: 'third-menu lrg'
  }, {
    link: '#work',
    text: 'See My Work',
    className: 'two-third-menu'
  }, {
    link: '#profile',
    text: 'Meet Me',
    className: 'third-menu sml med'
  }, {
    link: '#rates',
    text: 'Price Your Project',
    className: 'two-third-menu'
  }, {
    link: '#contact',
    text: 'Contact Me',
    className: 'full-menu'
  }], 'menu hover')
  menuNav.children.unshift((0, _listItem.listItem)([(0, _span.span)()], 'menu-btn sml med'))
  menuNav.children[currentIndex].attributes.className += 'current'
  return (0, _header.header)([(0, _nav.navigation)([menuNav])], 'hover')
}
