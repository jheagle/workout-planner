"use strict";

require("core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.responsiveTable = void 0;
require("core-js/modules/es.array.concat.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
/* global jsonDomComponents */
var _jsonDomComponents = jsonDomComponents,
  table = _jsonDomComponents.table,
  tableBody = _jsonDomComponents.tableBody,
  tableData = _jsonDomComponents.tableData,
  tableHead = _jsonDomComponents.tableHead,
  tableHeading = _jsonDomComponents.tableHeading,
  tableRow = _jsonDomComponents.tableRow,
  text = _jsonDomComponents.text,
  style = _jsonDomComponents.style;
var tableStyle = '/* \n' + 'Max width before this PARTICULAR table gets nasty\n' + 'This query will take effect for any screen smaller than 760px\n' + 'and also iPads specifically.\n' + '*/\n' + '@media \n' + 'only screen and (max-width: 760px),\n' + '(min-device-width: 768px) and (max-device-width: 1024px)  {\n';
var addLabelStyle = function addLabelStyle(label, index, tableId) {
  return "\t.".concat(tableId, " td:nth-of-type(").concat(index, "):before { content: \"").concat(label, "\"; }\n");
};

/**
 * Generates a menu with the provided index as the currently selected item.
 * @param {Array} tableRows
 * @param {Array} tableHeadings
 * @param {string} tableClass
 * @returns {Object.<DomItem>}
 */
var responsiveTable = exports.responsiveTable = function responsiveTable() {
  var tableRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var tableHeadings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var tableClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var headingCount = 1;
  var styles = tableStyle;
  var tableId = 'table_' + (100 + Math.floor(Math.random() * 899));
  var tableHeadItem = tableHead([tableRow(tableHeadings.map(function (heading) {
    styles += addLabelStyle(heading.text, headingCount++, tableId);
    return tableHeading([text(heading.text)], heading.className);
  }))]);
  return {
    table: table([tableHeadItem, tableBody(tableRows.map(function (rowItem) {
      return tableRow(rowItem.data.map(function (data) {
        return tableData([text(data.text)], data.className);
      }), rowItem.className);
    }))], "".concat(tableClass, " ").concat(tableId)),
    style: style("".concat(styles, "}"))
  };
};