import { element } from './element.js'

export const tableHead = (children = [], className = '', attributes = {}) =>
  element('thead', children, className, attributes)
