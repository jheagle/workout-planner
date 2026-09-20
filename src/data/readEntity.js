import { retrieveRecords } from '../../assets/js/data/utilities/retrieveRecords.js'

export const readEntity = async (entity = '') => retrieveRecords(entity)
