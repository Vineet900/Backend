import { Router } from 'express'
import { getHealth } from '../controllers/healthController.js'

const healthRoutes = Router()

// Example endpoint requested in the spec.
healthRoutes.get('/health', getHealth)
healthRoutes.get('/test', getHealth)

export default healthRoutes
