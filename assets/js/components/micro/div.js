import { element } from './element.js'

export const div = (children = [], className = '', attributes = {}) =>
  element('div', children, className, attributes)
