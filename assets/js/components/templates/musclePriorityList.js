import { responsiveTable } from '../macro/responsiveTable.js'

// A muscle never worked carries Infinity here, but Infinity has no JSON representation -
// it crosses the API as `null` (JSON.stringify(Infinity) === 'null'), not the number itself.
const formatDaysSinceWorked = (daysSinceLastWorked) =>
  daysSinceLastWorked === Infinity || daysSinceLastWorked === null ? 'Never' : `${daysSinceLastWorked}`

// Recovered means 3 days since worked; a muscle at its weekly target is done for the week even when recovered
const status = (row) => {
  if (row.needsPriority) return 'Needs priority'
  if (row.weeklySets >= row.weeklyTarget) return 'Target met'
  return 'Recovering'
}

/**
 * Generates a table ranking muscles by how much they need attention right now.
 * @param {Array} priorityRows - musclePriority()'s shape: [{ muscleId, name, daysSinceLastWorked, weeklySets, weeklyTarget, needsPriority }]
 * @returns {Object.<DomItem>}
 */
export const musclePriorityList = (priorityRows = []) => responsiveTable(
  priorityRows.map((row) => ({
    data: [
      { text: row.name, className: '' },
      { text: formatDaysSinceWorked(row.daysSinceLastWorked), className: '' },
      { text: `${row.weeklySets} / ${row.weeklyTarget}`, className: '' },
      { text: status(row), className: '' }
    ],
    className: row.needsPriority ? 'needs-priority' : ''
  })),
  [
    { text: 'Muscle', className: '' },
    { text: 'Days Since Worked', className: '' },
    { text: 'Weighted Sets (7 days)', className: '' },
    { text: 'Status', className: '' }
  ]
)
