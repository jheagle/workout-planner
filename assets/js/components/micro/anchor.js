import { element } from './element.js'

export const anchor = (href = '#', children = [], className = '', attributes = {}) => {
  attributes.href = href
  return element('a', children, className, attributes)
}
