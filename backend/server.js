const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
require('./models');

const server = express();

/* =========================
   🔐 SECURITY & MIDDLEWARE
========================= */

// ✅ FIXED HELMET (CSP configured properly)
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://intellitask-ai.onrender.com",   // backend
          "https://intellitask-ai1.vercel.app",    // frontend
          "https://*.vercel.app"                   // preview deployments
        ],
      },
    },
  })
);

// ✅ CORS CONFIG
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      origin === 'http://localhost:5173' ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

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
   🚀 SERVER START
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

/* =========================
   🗄️ DATABASE INIT
========================= */

(async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log('✅ Database connected & models synchronized');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
})();