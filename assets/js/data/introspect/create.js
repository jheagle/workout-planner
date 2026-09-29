import { fileExists } from 'test-filesystem'
import { field } from './definitions/field.js'

const gulpConfig = require('js-build-tools/gulp.config')
const { writeFile, mkdir } = require('fs/promises')

export const create = async (record, definition = []) => {
  const databasePath = gulpConfig.get('databasePath', 'test-database/')
  if (record === '__RECORDS') {
    return null
  }
  if (fileExists(`${databasePath}${record}.json`)) {
    return null
  }
  const recordContent = {
    path: record,
    definition: definition.map(field),
    entries: []
  }
  await writeFile(`${databasePath}${record}.json`, JSON.stringify(recordContent, null, 2))
  await mkdir(`${databasePath}${record}`, { recursive: true })
  return `${databasePath}${record}`
}
