require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '10kb' }));

// connect DB
connectDB().catch(err => {
  console.error('Failed to connect to DB, exiting', err);
  process.exit(1);
});

// mount routes under /api/v1
app.use('/api/v1/tasks', require('./routes/taskRoutes'));
app.use('/api/v1/notes', require('./routes/noteRoutes'));
app.use('/api/v1/gpa', require('./routes/gpaRoutes'));
app.use('/api/v1/pomodoro', require('./routes/pomodoroRoutes'));

// health
app.get('/api/v1/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StudyHub API listening on port ${PORT}`);
});
