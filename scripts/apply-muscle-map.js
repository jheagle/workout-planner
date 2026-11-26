/**
 * Write the muscle map (assets/js/data/muscleMap.js) into database/: the muscles and their regions, and every mapped
 * exercise's muscles with their share of the work. Running it again changes nothing. Packs the database at the end.
 *
 *   node scripts/apply-muscle-map.js [--database database/]
 */
import { configure, packDatabase, query, quote } from 'json-fs-query'
import { applyMuscleMap } from '../assets/js/data/muscleMap.js'

const args = process.argv.slice(2)
const index = args.indexOf('--database')
configure({ databasePath: index === -1 ? 'database/' : args[index + 1] })

applyMuscleMap(query, quote)
  // Repack, so the page reads each record in one request instead of every entry file
  .then(report => packDatabase().then(() => report))
  .then(report => {
    console.log(`Muscles: ${report.musclesAdded.length} added, ${report.musclesUpdated.length} updated.`)
    if (report.musclesUpdated.length) console.log(`  Updated: ${report.musclesUpdated.join(', ')}`)
    console.log(`Exercises mapped: ${report.exercisesLinked} (${report.links} muscle links).`)
    if (report.unmapped.length) console.log(`Stored exercises with no map entry (${report.unmapped.length}): ${report.unmapped.join(', ')}`)
    if (report.missing.length) console.log(`Map entries with no stored exercise (${report.missing.length}): ${report.missing.join(', ')}`)
  })
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
