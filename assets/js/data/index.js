import { configure, create, describe, drop, packDatabase, query, quote } from 'json-fs-query'

configure({ databasePath: 'database/' })

export { configure, create, describe, drop, packDatabase, query, quote }
