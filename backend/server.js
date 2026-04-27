const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
require('./models');

// ✅ Create app
const server = express();

// ✅ Middlewares
server.use(helmet());

server.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));

server.use(morgan('dev'));
server.use(express.json());

// ✅ Health Routes
server.get('/', (req, res) => {
  res.send('🚀 IntelliTask AI Backend is running');
});

server.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// ✅ API Routes
server.use('/api/auth', require('./routes/authRoutes'));
server.use('/api/tasks', require('./routes/taskRoutes'));
server.use('/api/goals', require('./routes/goalRoutes'));
server.use('/api/analytics', require('./routes/analyticsRoutes'));

// ✅ Error Handler
server.use((err, req, res, next) => {
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

// ✅ Start Server FIRST
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// ✅ Initialize DB AFTER server starts
(async () => {
  try {
    await connectDB();
    await sequelize.sync(); // ⚠️ no alter in production
    console.log('✅ Database connected & models synchronized');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1); // fail fast
  }
})();