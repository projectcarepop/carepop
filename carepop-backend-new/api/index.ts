import app from '../src/app'
import { handle } from 'hono/vercel'

// Edge runtime is recommended; remove if using node.
export const config = {
  runtime: 'edge',
}

export default handle(app) 