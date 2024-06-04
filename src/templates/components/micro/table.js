import { element } from './element.js'

export const table = (children = [], className = '', attributes = {}) =>
  element('table', children, className, attributes)
