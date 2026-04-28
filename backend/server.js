const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

console.log("DB_URL exists:", !!process.env.DB_URL);

const { connectDB, sequelize, getDBStatus } = require('./config/db');
require('./models');

const server = express();

/* =========================
   🔐 MIDDLEWARE
========================= */

server.use(helmet());

server.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

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
}));

server.use(express.json());
server.use(morgan('dev'));

/* =========================
   ❤️ HEALTH
========================= */

server.get('/', (req, res) => {
  res.send('🚀 IntelliTask AI Backend is running');
});

server.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: getDBStatus() ? 'connected' : 'retrying',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  });
});

/* =========================
   🔗 ROUTES
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
   🚀 START SERVER
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

  // 🔥 connect DB (retry handled internally)
  connectDB();

  // 🔥 sync AFTER DB is ready (single attempt loop)
  const trySync = async () => {
    if (getDBStatus()) {
      try {
        await sequelize.sync();
        console.log('✅ Database synchronized');
      } catch (err) {
        console.error('❌ Sync error:', err.message);
      }
    } else {
      setTimeout(trySync, 3000);
    }
  };

  trySync();
});