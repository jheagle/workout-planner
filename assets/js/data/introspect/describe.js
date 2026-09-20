import { retrieveFile } from '../utilities/retrieveFile.js'

export const describe = async (record = '__RECORDS') => {
  const recordFile = await retrieveFile(`${record}.json`)
  if (record === '__RECORDS') {
    return recordFile.entries
  }
  return recordFile.description
}