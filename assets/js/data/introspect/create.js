import { fileExists } from 'test-filesystem'
import { field } from './definitions/field.js'

const gulpConfig = require('js-build-tools/gulp.config')
const { writeFile, mkdir } = require('fs/promises')
const databasePath = gulpConfig.get('databasePath', 'test-database/')

export const create = async (record, definition = []) => {
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
  return await mkdir(`${databasePath}${record}`, { recursive: true })
}
