const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
require('./models');

// ✅ DEFINE SERVER FIRST
const server = express();

// Middlewares
server.use(helmet());
server.use(cors());
server.use(morgan('dev'));
server.use(express.json());

// Routes
server.use('/api/auth', require('./routes/authRoutes'));
server.use('/api/tasks', require('./routes/taskRoutes'));
server.use('/api/goals', require('./routes/goalRoutes'));
server.use('/api/analytics', require('./routes/analyticsRoutes'));

// Error handler
server.use((err, req, res, next) => {
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

// ✅ START SERVER FIRST
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ CONNECT DB AFTER SERVER STARTS
(async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected & models synchronized');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();