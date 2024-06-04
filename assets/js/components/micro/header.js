import { element } from './element.js'

export const header = (children = [], className = '', attributes = {}) =>
  element('header', children, className, attributes)
