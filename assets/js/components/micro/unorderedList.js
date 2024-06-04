import { element } from './element.js'

export const unorderedList = (children = [], className = '', attributes = {}) =>
  element('ul', children, className, attributes)
