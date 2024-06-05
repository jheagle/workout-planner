import { element } from './element.js'

export const main = (children = [], className = '', attributes = {}) =>
  element('main', children, className, attributes)
