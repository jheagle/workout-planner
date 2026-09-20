import { retrieveFile } from './retrieveFile.js'

export const retrieveRecords = async (entity = '') => {
  const recordFile = await retrieveFile(`${entity}.json`)
  const dataSet = []
  for (let file of recordFile.entries) {
    const data = await retrieveFile(`${recordFile.path}/${file}`)
      .catch(err => console.error(err))
    if (!data) {
      throw new Error(`Could not read entity ${file}`)
    }
    dataSet.push(data)
  }
  return dataSet
}