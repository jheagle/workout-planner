import { navigation } from '../micro/nav.js'
import { span } from '../micro/span.js'
import { header } from '../micro/header.js'
import { listItem } from '../micro/listItem.js'
import { menu } from '../macro/menu.js'

/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {number} currentIndex
 * @returns {DomItem}
 */
export const pageNavigation = (currentIndex = 1) => {
  const menuNav = menu(
    [
      {
        link: '#intro', text: 'Hello', className: 'third-menu'
      },
      {
        link: '#profile', text: 'Meet Me', className: 'third-menu lrg'
      },
      {
        link: '#work', text: 'See My Work', className: 'two-third-menu'
      },
      {
        link: '#profile', text: 'Meet Me', className: 'third-menu sml med'
      },
      {
        link: '#rates', text: 'Price Your Project', className: 'two-third-menu'
      },
      {
        link: '#contact', text: 'Contact Me', className: 'full-menu'
      },
    ],
    'menu hover'
  )
  menuNav.children.unshift(listItem([span()], 'menu-btn sml med'))
  menuNav.children[currentIndex].attributes.className += 'current'
  return header(
    [
      navigation(
        [
          menuNav
        ]
      )
    ],
    'hover'
  )
}
