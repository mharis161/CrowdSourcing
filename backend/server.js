import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';

dotenv.config();

const app = express();

import authRoutes from './routes/authRoute.js';
import taskRoutes from './routes/taskRoute.js';
import participantTaskRoutes from './routes/participantTaskRoute.js';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/participant-tasks', participantTaskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CrowdForge API is running perfectly! 🚀' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server magically running on port ${PORT} ✨`);
});
