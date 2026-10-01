import { configure, create, describe, drop, query } from 'json-fs-query'

configure({ databasePath: 'database/' })

export { configure, create, describe, drop, query }
