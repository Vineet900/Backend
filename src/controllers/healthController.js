import { buildHealthPayload } from '../models/healthModel.js'

export function getHealth(_req, res) {
  res.json(buildHealthPayload())
}
