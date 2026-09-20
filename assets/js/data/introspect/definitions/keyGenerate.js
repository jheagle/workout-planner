import { keyUnique } from './keyUnique.js'

export const keyGenerate = async (entity, references = []) => {
  let uuid = null
  let isUnique = false
  while (!isUnique) {
    uuid = crypto.randomUUID()
    isUnique = keyUnique(entity, references, uuid)
  }
  return uuid
}