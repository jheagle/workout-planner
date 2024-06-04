import { element } from './element.js'

export const span = (children = [], className = '', attributes = {}) =>
  element('span', children, className, attributes)
