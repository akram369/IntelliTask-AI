const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

console.log("DB_URL exists:", !!process.env.DB_URL);

const { connectDB, sequelize } = require('./config/db');
require('./models');

const server = express();

/* =========================
   🔐 SECURITY & MIDDLEWARE
========================= */

// API server → keep Helmet, no CSP needed
server.use(helmet());

// Robust CORS for Vercel + local
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman/curl

    if (
      origin === 'http://localhost:5173' ||
      origin.includes('.vercel.app')
    ) {
      return callback(null, true);
    }

    console.log('❌ Blocked CORS:', origin);
    return callback(null, false);
  },
  credentials: true,
};

server.use(cors(corsOptions));
server.use(morgan('dev'));
server.use(express.json());

/* =========================
   ❤️ HEALTH CHECK ROUTES
========================= */

server.get('/', (req, res) => {
  res.send('🚀 IntelliTask AI Backend is running');
});

server.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  });
});

/* =========================
   🔗 API ROUTES
========================= */

server.use('/api/auth', require('./routes/authRoutes'));
server.use('/api/tasks', require('./routes/taskRoutes'));
server.use('/api/goals', require('./routes/goalRoutes'));
server.use('/api/analytics', require('./routes/analyticsRoutes'));

/* =========================
   ⚠️ ERROR HANDLER
========================= */

server.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

/* =========================
   🚀 STARTUP (DB FIRST)
========================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');

    await connectDB();            // ⬅️ MUST succeed
    await sequelize.sync();       // ⬅️ sync models

    console.log('✅ Database connected & models synchronized');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1); // fail fast (no half-alive server)
  }
};

startServer();