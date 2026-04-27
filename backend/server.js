const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

// Models & Relationships
require('./models');

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

// Centralized Error Handling Middleware
server.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Sync Database & Start Server
const startServer = async () => {
  await connectDB();
  
  // Sync models
  try {
    await sequelize.sync({ alter: true }); // Automatically updates the schema to match models
    console.log('✅ Database models synchronized');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error synchronizing database models:', err);
  }
};

startServer();
