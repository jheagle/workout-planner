import { element } from './element.js'

export const footer = (children = [], className = '', attributes = {}) =>
  element('footer', children, className, attributes)
