import { element } from './element.js'

export const tableRow = (children = [], className = '', attributes = {}) =>
  element('tr', children, className, attributes)
