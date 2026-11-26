/**
 * @jest-environment node
 */
import { setUp } from 'test-filesystem'
import { query, quote } from './index.js'
import { applyMuscleMap, exerciseShares, muscles } from './muscleMap.js'
import { createTestDatabase } from './testDatabase.js'

const databasePath = 'muscle-map-test-database/'
setUp.setDefaults(databasePath)

describe('the muscle map data', () => {
  const ids = new Set(muscles.map(muscle => muscle._id))

  test('every region names a muscle that exists and has no parent itself', () => {
    muscles.filter(muscle => muscle.parent_id).forEach(region => {
      const parent = muscles.find(muscle => muscle._id === region.parent_id)
      expect(parent).toBeDefined()
      expect(parent.parent_id).toBeUndefined()
    })
  })

  test.each(Object.entries(exerciseShares))('%s links only to known muscles, never to a muscle split into regions, with shares of 0-100 and one at 100', (name, shares) => {
    const parents = new Set(muscles.filter(muscle => muscle.parent_id).map(muscle => muscle.parent_id))
    Object.entries(shares).forEach(([muscleId, share]) => {
      expect(ids.has(muscleId)).toBe(true)
      expect(parents.has(muscleId)).toBe(false)
      expect(share).toBeGreaterThan(0)
      expect(share).toBeLessThanOrEqual(100)
    })
    expect(Object.values(shares)).toContain(100)
  })
})

describe('applyMuscleMap', () => {
  beforeEach(() => setUp.beforeEach().then(() => createTestDatabase(databasePath)))
  afterEach(setUp.afterEach)

  test('adds the regions, replaces a mapped exercise\'s links, reports the rest, and changes nothing the second time', async () => {
    const report = await applyMuscleMap(query, quote)
    expect(report.musclesAdded).toHaveLength(muscles.length - 14)
    expect(report.musclesUpdated).toContain('Gluteus Maximus -> Glutes')
    // Of the seed's exercises only Deadlift has its sheet name; the other two are renamed by the sheet import
    expect(report.exercisesLinked).toBe(1)
    expect(report.unmapped).toEqual(['Bench Press', 'Squat'])
    expect(report.missing).toHaveLength(Object.keys(exerciseShares).length - 1)

    const [[deadlift]] = await query("read exercises where name = 'Deadlift'")
    const [links] = await query(`read exercise_muscle where exercise_id = ${quote(String(deadlift._id))}`)
    expect(Object.fromEntries(links.map(link => [String(link.muscle_id), link.muscle_rank]))).toEqual(exerciseShares.Deadlift)
    const [[upperChest]] = await query("read muscles where _id = 'chest_upper'")
    expect(upperChest.parent_id).toBe('11')

    const again = await applyMuscleMap(query, quote)
    expect(again.musclesAdded).toEqual([])
    expect(again.musclesUpdated).toEqual([])
    const [linksAgain] = await query(`read exercise_muscle where exercise_id = ${quote(String(deadlift._id))}`)
    expect(linksAgain.map(link => link._id).sort()).toEqual(links.map(link => link._id).sort())
  })
})
