import { retrieveRecords } from '../utilities/retrieveRecords.js'

export const readEntity = async (entity = '') => retrieveRecords(entity)
