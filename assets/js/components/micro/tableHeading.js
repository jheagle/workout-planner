import { element } from './element.js'

export const tableHeading = (children = [], className = '', attributes = {}) =>
  element('th', children, className, attributes)
