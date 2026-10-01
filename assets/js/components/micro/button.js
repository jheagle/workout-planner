import { element } from './element.js'
import { text } from './text.js'

export const button = (label, className = '', attributes = {}) =>
  element('button', [text(label)], className, Object.assign({ type: 'button' }, attributes))
