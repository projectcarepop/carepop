import app from '../src/app'
import { handle } from 'hono/vercel'

// Edge runtime is recommended; remove if using node.
export default handle(app) 