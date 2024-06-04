import { element } from './element.js'

export const listItem = (children = [], className = '', attributes = {}) =>
  element('li', children, className, attributes)
