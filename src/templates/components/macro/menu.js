import { unorderedList } from '../micro/unorderedList.js'
import { listItem } from '../micro/listItem.js'
import { anchor } from '../micro/anchor.js'
import { text } from '../micro/text.js'

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
export const menu = (menuItems = [], menuClass = 'menu') => unorderedList(
  menuItems.map(
    menuItem => listItem([anchor(menuItem.link, [text(menuItem.text)])], menuItem.className)
  ),
  menuClass
)
