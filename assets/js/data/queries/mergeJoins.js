import { mergeJoin } from '../utilities/mergeJoin.js'
import { reconcileJoins } from '../utilities/reconcileJoins.js'

export const mergeJoins = async (dataSet = {}, merges = []) => {
  if (!merges.length) {
    return dataSet
  }
  for (let merge of merges) {
    dataSet = await mergeJoin(merge.propertyA, merge.propertyB, dataSet)
    dataSet = reconcileJoins(merge.propertyA, merge.propertyB, dataSet)
  }
  return dataSet
}