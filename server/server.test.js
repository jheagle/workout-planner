/**
 * @jest-environment node
 */
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from '../assets/js/data/index.js'
import { copyDatabase } from '../assets/js/data/copyDatabase.js'
import { createApp } from './server.js'

const databasePath = 'server-test-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

let server
let baseUrl

beforeEach(async () => {
  await testHelpers.beforeEach()
  await copyDatabase(databasePath)
  server = createApp()
  await new Promise(resolve => server.listen(0, resolve))
  baseUrl = `http://localhost:${server.address().port}`
})

afterEach(async () => {
  await new Promise(resolve => server.close(resolve))
  await testHelpers.afterEach()
})

describe('workout-planner API', () => {
  test('GET /api/muscle-priority returns the real muscle priority ranking', async () => {
    const response = await fetch(`${baseUrl}/api/muscle-priority`)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(14)
  })

  test('GET /api/exercises-for-muscle returns exercises linked to a real muscle', async () => {
    const response = await fetch(`${baseUrl}/api/exercises-for-muscle?muscleId=11`)
    const body = await response.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Bench Press')
  })

  test('GET /api/exercises-for-muscle returns nothing for a muscle with no linked exercise yet', async () => {
    const response = await fetch(`${baseUrl}/api/exercises-for-muscle?muscleId=2`)
    const body = await response.json()
    expect(body).toHaveLength(0)
  })

  test('GET /api/last-session returns the most recent real session for an exercise', async () => {
    const response = await fetch(`${baseUrl}/api/last-session?exerciseId=1`)
    const body = await response.json()
    expect(body.date).toBe('2024-06-05')
  })

  test('GET /api/last-session returns null for an exercise never logged', async () => {
    const response = await fetch(`${baseUrl}/api/last-session?exerciseId=999`)
    const body = await response.json()
    expect(body).toBeNull()
  })

  test('POST /api/workouts logs a new real entry', async () => {
    const response = await fetch(`${baseUrl}/api/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: 1, weightEffort: '125lbs', sets: 3, reps: 8, date: '2024-06-12' })
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.weight_effort).toBe('125lbs')
  })

  test('PATCH /api/workouts/:id updates a real entry', async () => {
    const response = await fetch(`${baseUrl}/api/workouts/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weightEffort: '120lbs', reps: 12 })
    })
    const body = await response.json()
    expect(body.weight_effort).toBe('120lbs')
    expect(body.reps).toBe(12)
  })

  test('POST /api/exercises creates a real exercise linked to the given muscles', async () => {
    const response = await fetch(`${baseUrl}/api/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Overhead Press',
        description: 'Standing barbell press',
        muscleAssignments: [{ muscleId: 4, rank: 100 }]
      })
    })
    const body = await response.json()
    expect(body.name).toBe('Overhead Press')
  })

  test('an unknown route returns 404', async () => {
    const response = await fetch(`${baseUrl}/api/nope`)
    expect(response.status).toBe(404)
  })

  test('PATCH /api/workouts/:id on an id that matches nothing is a no-op, not an error', async () => {
    const response = await fetch(`${baseUrl}/api/workouts/999`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reps: 10 })
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toBeNull()
  })

  test('a write that fails for a real reason returns 400 with that real error message', async () => {
    const response = await fetch(`${baseUrl}/api/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sets: 3, reps: 8, date: '2024-06-12' }) // missing required exerciseId
    })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/Failed to interpret/)
  })
})
