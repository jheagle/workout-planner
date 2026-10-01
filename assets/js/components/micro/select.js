import { element } from './element.js'

export const select = (children = [], className = '', attributes = {}) =>
  element('select', children, className, attributes)
