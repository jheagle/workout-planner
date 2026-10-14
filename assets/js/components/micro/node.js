/* global jsonDom -- loaded as a plain script in muscles.html before this native ES module runs, not an npm import */

/**
 * Create the template of a DomItem
 * @param {string} nodeName
 * @param {string} nodeValue
 * @param {array} [children=[]]
 * @param {object} [attributes={}]
 * @returns {DomItem}
 */
export const node = (nodeName, nodeValue, children = [], attributes = {}) => jsonDom.createDomItem(
  {
    nodeName,
    nodeValue,
    attributes,
    children
  }
)
