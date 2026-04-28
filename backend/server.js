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

// ✅ Helmet WITHOUT CSP (API servers don’t need CSP)
server.use(helmet());

// ✅ RELIABLE CORS CONFIG
const corsOptions = {
  origin: (origin, callback) => {
    // allow Postman / curl / mobile apps
    if (!origin) return callback(null, true);

    // allow local dev
    if (origin === 'http://localhost:5173') {
      return callback(null, true);
    }

    // 🔥 allow ALL Vercel deployments (prod + preview)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    console.log('❌ Blocked CORS:', origin);

    return callback(null, false);
  },
  credentials: true,
};

server.use(cors(corsOptions));

// ✅ Explicitly allow preflight (safe with Express 5)
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

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