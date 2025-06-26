import app from '../src/app'
import { handle } from '@hono/node-server/vercel'

// This file adapts the Hono app for Vercel's Node.js serverless environment.
export default handle(app) 