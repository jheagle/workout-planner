/**
 * Run the database migrations that haven't run yet (assets/js/data/migrations.js), then repack the database.
 *
 *   node scripts/migrate.js [--database database/]
 */
import { configure, packDatabase, query, quote } from 'json-fs-query'
import { migrate } from '../assets/js/data/migrations.js'

const args = process.argv.slice(2)
const index = args.indexOf('--database')
configure({ databasePath: index === -1 ? 'database/' : args[index + 1] })

migrate(query, quote)
  .then(async ran => {
    if (!ran.length) {
      console.log('Nothing to migrate.')
      return
    }
    for (const { name, result } of ran) console.log(`${name}: ${JSON.stringify(result)}`)
    // Repack, so the page reads each record in one request instead of every entry file
    await packDatabase()
  })
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
