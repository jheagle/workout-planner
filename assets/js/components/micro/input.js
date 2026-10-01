import { element } from './element.js'

export const input = (type = 'text', attributes = {}, className = '') =>
  element('input', [], className, Object.assign({ type }, attributes))
