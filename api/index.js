// Vercel serverless entry point: every /api/* request is routed here (see vercel.json)
// and handled by the same Express app used in local development.
import app from '../server/src/app.js';

export default app;
