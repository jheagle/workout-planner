import { createServer } from 'http'
import {
  getMusclePriority,
  getExercisesForMuscle,
  getLastSession,
  logWorkout,
  updateWorkout,
  addExercise
} from '../assets/js/data/workoutQueries.js'

const readJsonBody = (request) => new Promise((resolve, reject) => {
  let body = ''
  request.on('data', chunk => { body += chunk })
  request.on('end', () => {
    if (!body) {
      resolve({})
      return
    }
    try {
      resolve(JSON.parse(body))
    } catch (error) {
      reject(error)
    }
  })
  request.on('error', reject)
})

const sendJson = (response, statusCode, data) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  response.end(JSON.stringify(data))
}

const sendNoContent = (response) => {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  response.end()
}

// Each route's handler receives (request, pathParams, searchParams). Routes are matched in
// order, GET before PATCH before POST within the same path isn't a concern since every pattern
// here is unique - keep that true if new routes are added.
const routes = [
  {
    method: 'GET',
    pattern: /^\/api\/muscle-priority$/,
    handler: async () => await getMusclePriority()
  },
  {
    method: 'GET',
    pattern: /^\/api\/exercises-for-muscle$/,
    handler: async (_request, _params, searchParams) => await getExercisesForMuscle(searchParams.get('muscleId'))
  },
  {
    method: 'GET',
    pattern: /^\/api\/last-session$/,
    handler: async (_request, _params, searchParams) => await getLastSession(searchParams.get('exerciseId'))
  },
  {
    method: 'POST',
    pattern: /^\/api\/workouts$/,
    handler: async (request) => await logWorkout(await readJsonBody(request))
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/workouts\/([^/]+)$/,
    handler: async (request, params) => await updateWorkout(params[0], await readJsonBody(request))
  },
  {
    method: 'POST',
    pattern: /^\/api\/exercises$/,
    handler: async (request) => {
      const { name, description, muscleAssignments } = await readJsonBody(request)
      return await addExercise({ name, description }, muscleAssignments)
    }
  }
]

/**
 * The workout-planner API: a thin HTTP layer over workoutQueries.js, so a static page served
 * elsewhere (nginx locally, or just the json files on a public static host for read-only viewing)
 * can reach the Node-side query/write logic this needs - a browser has no filesystem access, so
 * that logic can't run as page JS.
 */
export const createApp = () => createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendNoContent(response)
    return
  }
  const url = new URL(request.url, 'http://localhost')
  const route = routes.find(route => route.method === request.method && route.pattern.test(url.pathname))
  if (!route) {
    sendJson(response, 404, { error: 'Not found' })
    return
  }
  try {
    const match = url.pathname.match(route.pattern)
    const result = await route.handler(request, match.slice(1), url.searchParams)
    sendJson(response, 200, result)
  } catch (error) {
    sendJson(response, 400, { error: error.message })
  }
})

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const port = process.env.PORT || 3001
  createApp().listen(port, () => console.log(`workout-planner API listening on port ${port}`))
}
