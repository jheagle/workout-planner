import { element } from './element.js'

export const tableData = (children = [], className = '', attributes = {}) =>
  element('td', children, className, attributes)
