import express from 'express';
import { apiRouter } from '../server/api.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle both /api prefix and direct routes if Vercel routes to /api
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
