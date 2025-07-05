import dotenv from 'dotenv';
dotenv.config();

import express, { json } from 'express';
import cors from 'cors';
import { startBot } from './bot';
import { router } from './api';
import { initDb } from './services/database';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Allow requests from the frontend
app.use(json()); // Parse JSON bodies

// API routes
app.use('/api', router);

// Initialize Database and start server
initDb()
  .then(() => {
    console.log('Database initialized successfully.');
    app.listen(port, () => {
      console.log(`Backend server running at http://localhost:${port}`);
      // Start the Telegram bot after server is ready
      startBot();
    });
  })
  .catch(error => {
    console.error('Failed to initialize database or start server:', error);
    (process as any).exit(1);
  });