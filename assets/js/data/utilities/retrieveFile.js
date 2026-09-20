import * as jsEnv from 'browser-or-node'
// import * as gulpConfig from 'js-build-tools/gulp.config.mjs'

let gulpConfig = typeof gulpConfig !== 'undefined' ? gulpConfig : {}

let retrieveFn = url => fetch(url).then(res => res.json())
let relativePath = ''
if (jsEnv.isNode) {
  gulpConfig = require('js-build-tools/gulp.config')
  const { readFile } = require('fs/promises')
  retrieveFn = url => readFile(url).then(res => JSON.parse(res))
}
if (jsEnv.isBrowser) {
  relativePath = gulpConfig.get('relativePath', 'http://joshuaheagle.local/projects/workout-planner/')
}
const databasePath = gulpConfig.get('databasePath', 'database/')

export const retrieveFile = async (path) => {
  const fetchUrl = `${relativePath}${databasePath}${path}`
  const recordInfo = await retrieveFn(fetchUrl)
    .catch(err => console.error(err))
  if (!recordInfo) {
    throw new Error(`Could not read ${path}`)
  }
  return recordInfo
}