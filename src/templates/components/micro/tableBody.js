import { element } from './element.js'

export const tableBody = (children = [], className = '', attributes = {}) =>
  element('tbody', children, className, attributes)
