import { create } from './create.js'
import { fileExists, logObject, setUp } from 'test-filesystem'

const gulpConfig = require('js-build-tools/gulp.config')

const databasePath = 'test-database/'
gulpConfig.set('databasePath', databasePath)
setUp.setDefaults(databasePath)

beforeEach(setUp.beforeEach)

afterEach(setUp.afterEach)

describe('create', () => {
  test('create a new record', async () => {
    expect.assertions(2)
    const recordName = 'foo'
    const result = await create(recordName, [
      {
        name: '_id',
        type: 'string',
        optional: false,
        keys: [
          {
            type: 'primary',
            references: ['self'],
            autoGenerate: true
          }
        ]
      },
      {
        name: 'bar',
        type: 'string',
        optional: true,
        keys: []
      }
    ])
    expect(fileExists(`${result}.json`)).toBeTruthy()
    expect(fileExists(`${result}`)).toBeTruthy()
  })
})
