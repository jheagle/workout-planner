import { element } from './element.js'

/**
 * Create a nav DomItem
 * @param {array} [children=[]]
 * @param {string} [className='']
 * @param {object} [attributes={}]
 * @returns {DomItem}
 */
export const navigation = (children = [], className = '', attributes = {}) =>
  element('nav', children, className, attributes)
