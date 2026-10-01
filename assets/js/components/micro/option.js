import { element } from './element.js'
import { text } from './text.js'

export const option = (value, label, className = '', attributes = {}) =>
  element('option', [text(label)], className, Object.assign({ value }, attributes))
