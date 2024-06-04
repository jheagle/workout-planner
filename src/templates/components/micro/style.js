import { node } from './node.js'
import { text } from './text.js'

export const style = (styleContent = '') => node('style', null, [text(styleContent)])
