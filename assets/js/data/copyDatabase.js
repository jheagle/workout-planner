import fs from 'fs/promises'

/**
 * Copy the real database/ directory into an isolated test directory, so insert/update tests have
 * real seed data to work with without ever touching the actual database/ this app runs against.
 * @param destination
 */
export const copyDatabase = async (destination = 'test-database/') => fs.cp('database/', destination, { recursive: true })
