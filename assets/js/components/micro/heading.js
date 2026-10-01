import { element } from './element.js'

export const heading = (level = 1, children = [], className = '', attributes = {}) =>
  element(`h${level}`, children, className, attributes)
